<?php

namespace App\Jobs;

use App\Models\Job;
use App\Models\Episode;
use App\Models\Asset;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunPackagingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $jobModel;
    public $timeout = 300; // 5 minutes
    public $tries = 3;

    public function __construct(Job $jobModel)
    {
        $this->jobModel = $jobModel;
    }

    public function handle(): void
    {
        try {
            Log::info("Starting Packaging Job {$this->jobModel->id}");

            $this->jobModel->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            $episode = $this->jobModel->episode;
            if (!$episode) {
                throw new \Exception("Episode not found");
            }

            $episode->update(['status' => 'running']);

            // Lettered 이미지 Assets 가져오기 (없으면 일반 이미지 사용)
            $letteredAssets = Asset::where('episode_id', $episode->id)
                ->where('type', 'lettered_image')
                ->orderBy('id')
                ->get();

            if ($letteredAssets->isEmpty()) {
                Log::info("No lettered images found, using original images");
                $letteredAssets = Asset::where('episode_id', $episode->id)
                    ->where('type', 'image')
                    ->orderBy('id')
                    ->get();
            }

            if ($letteredAssets->isEmpty()) {
                throw new \Exception("No images found for packaging");
            }

            Log::info("Packaging {$letteredAssets->count()} images");

            $packagingEngineUrl = env('AI_PACKAGING_ENGINE_URL', 'http://localhost:8005');

            // 패널 정보 수집
            $panels = [];
            foreach ($letteredAssets as $index => $asset) {
                $panels[] = [
                    'panel_number' => $index + 1,
                    'lettered_image_url' => $asset->path
                ];
            }

            // Packaging Engine 호출
            $response = Http::timeout(120)->post("{$packagingEngineUrl}/engine/pack/webtoon", [
                'panels' => $panels,
                'episode_id' => $episode->id,
                'layout' => 'vertical',
                'spacing' => 20
            ]);

            if (!$response->successful()) {
                throw new \Exception("Packaging Engine failed");
            }

            $result = $response->json();
            if (!$result['success']) {
                throw new \Exception("Packaging failed: " . ($result['error'] ?? 'Unknown error'));
            }

            Log::info("Packaging completed successfully");

            $packagingResult = $result['result'];

            // 최종 웹툰 이미지를 Asset으로 저장
            Asset::create([
                'episode_id' => $episode->id,
                'type' => 'final_webtoon',
                'path' => $packagingResult['final_webtoon_url'] ?? '',
                'file_size' => ($packagingResult['file_size_mb'] ?? 0) * 1024 * 1024,
                'meta_json' => [
                    'total_panels' => $packagingResult['total_panels'] ?? 0,
                    'height' => $packagingResult['height'] ?? 0,
                    'width' => $packagingResult['width'] ?? 0
                ]
            ]);

            Log::info("Final webtoon asset created");

            // Episode 메타데이터 업데이트
            $metadata = $episode->generation_metadata ?? [];
            $metadata['final_webtoon_path'] = $packagingResult['final_webtoon_url'] ?? '';
            $metadata['final_webtoon_size_mb'] = $packagingResult['file_size_mb'] ?? 0;
            $metadata['packaged_at'] = now()->toIso8601String();

            $episode->update(['generation_metadata' => $metadata]);

            // Job 완료
            $this->jobModel->update([
                'status' => 'done',
                'output_json' => [
                    'final_webtoon_path' => $packagingResult['final_webtoon_url'] ?? '',
                    'total_panels' => $packagingResult['total_panels'] ?? 0,
                    'size_mb' => $packagingResult['file_size_mb'] ?? 0
                ],
                'cost_units' => 0.20, // 패키징 고정 비용
                'completed_at' => now(),
            ]);

            $episode->update(['status' => 'done']);

            Log::info("Packaging Job {$this->jobModel->id} completed successfully");

        } catch (\Exception $e) {
            Log::error("Packaging Job {$this->jobModel->id} failed: " . $e->getMessage());

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
                Log::error("Packaging Job {$this->jobModel->id} failed permanently after 3 retries");
            }

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Packaging Job {$this->jobModel->id} permanently failed");
        
        $this->jobModel->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        if ($this->jobModel->episode) {
            $this->jobModel->episode->update(['status' => 'failed']);
        }
    }
}
