<?php

namespace App\Jobs;

use App\Models\Job as EpisodeJob;
use App\Models\Episode;
use App\Models\Asset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunLetteringJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $jobModel;
    public $timeout = 300; // 5 minutes
    public $tries = 3;

    public function __construct(EpisodeJob $jobModel)
    {
        $this->jobModel = $jobModel;
    }

    public function handle(): void
    {
        try {
            Log::info("Starting Lettering Job {$this->jobModel->id}");

            $this->jobModel->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            $episode = $this->jobModel->episode;
            if (!$episode) {
                throw new \Exception("Episode not found");
            }

            $episode->update(['status' => 'running']);

            // Storyboard 데이터 가져오기
            $storyboard = $episode->storyboard_json;
            if (!$storyboard || !isset($storyboard['panels'])) {
                throw new \Exception("Storyboard not found");
            }

            $panels = $storyboard['panels'];

            // 기존 이미지 Assets 가져오기
            $imageAssets = Asset::where('episode_id', $episode->id)
                ->where('type', 'image')
                ->orderBy('id')
                ->get();

            if ($imageAssets->isEmpty()) {
                throw new \Exception("No images found for lettering");
            }

            Log::info("Processing {$imageAssets->count()} images for lettering");

            $letteringEngineUrl = env('AI_LETTERING_ENGINE_URL', 'http://localhost:8004');
            $letteredImages = [];

            // 각 이미지에 레터링 적용
            foreach ($imageAssets as $index => $imageAsset) {
                $panel = $panels[$index] ?? null;
                if (!$panel) {
                    Log::warning("No panel data for image {$index}");
                    continue;
                }

                $response = Http::timeout(120)->post("{$letteringEngineUrl}/engine/lettering/apply", [
                    'image_path' => $imageAsset->path,
                    'dialogues' => $panel['dialogue'] ? [$panel['dialogue']] : [],
                    'panel_number' => $panel['panel_number'] ?? ($index + 1),
                    'font_size' => 32,
                    'output_format' => 'png'
                ]);

                if (!$response->successful()) {
                    throw new \Exception("Lettering Engine failed for panel " . ($index + 1));
                }

                $result = $response->json();
                if (!$result['success']) {
                    throw new \Exception("Lettering failed: " . ($result['error'] ?? 'Unknown error'));
                }

                $letteredImages[] = $result['result'];
                Log::info("Lettering applied to panel " . ($index + 1));
            }

            // Lettered 이미지를 Asset으로 저장
            foreach ($letteredImages as $letteredData) {
                Asset::create([
                    'episode_id' => $episode->id,
                    'type' => 'lettered_image',
                    'path' => $letteredData['lettered_image_url'] ?? '',
                    'file_size' => 0, // Lettering Engine은 size를 반환하지 않음
                    'meta_json' => [
                        'panel_number' => $letteredData['panel_number'] ?? 0,
                        'dialogue' => $letteredData['dialogue'] ?? '',
                        'speaker' => $letteredData['speaker'] ?? ''
                    ]
                ]);
            }

            Log::info("Created " . count($letteredImages) . " lettered image assets");

            // Job 완료
            $this->jobModel->update([
                'status' => 'done',
                'output_json' => [
                    'lettered_images' => count($letteredImages),
                    'processed_panels' => count($panels)
                ],
                'cost_units' => count($letteredImages) * 0.10, // 패널당 0.10 units
                'completed_at' => now(),
            ]);

            $episode->update(['status' => 'running']); // 다음 단계를 위해 running 유지

            Log::info("Lettering Job {$this->jobModel->id} completed successfully");

        } catch (\Exception $e) {
            Log::error("Lettering Job {$this->jobModel->id} failed: " . $e->getMessage());

            $this->jobModel->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            if ($this->jobModel->episode) {
                $this->jobModel->episode->update(['status' => 'failed']);
            }

            $this->jobModel->increment('retry_count');

            if ($this->jobModel->retry_count < 3) {
                $this->release(60);
            } else {
                Log::error("Lettering Job {$this->jobModel->id} failed permanently after 3 retries");
            }

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Lettering Job {$this->jobModel->id} permanently failed");
        
        $this->jobModel->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        if ($this->jobModel->episode) {
            $this->jobModel->episode->update(['status' => 'failed']);
        }
    }
}
