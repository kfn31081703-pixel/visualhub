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

class RunImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $jobModel;
    public $timeout = 600; // 10 minutes (이미지 생성은 시간이 걸림)
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(Job $jobModel)
    {
        $this->jobModel = $jobModel;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Starting Image Job {$this->jobModel->id}");

            // Job 시작
            $this->jobModel->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            // Episode 상태 업데이트
            if ($this->jobModel->episode) {
                $this->jobModel->episode->update(['status' => 'running']);
            }

            // Storyboard 확인
            $storyboard = $this->jobModel->episode->storyboard_json ?? [];
            $panels = $storyboard['panels'] ?? [];

            if (empty($panels)) {
                throw new \Exception("No storyboard panels found. Please generate storyboard first.");
            }

            // Image Engine 호출
            $engineUrl = env('AI_IMAGE_ENGINE_URL', 'http://localhost:8003');
            
            Log::info("Calling Image Engine at: {$engineUrl}/engine/image/generate-batch");

            // 패널 정보를 Image Engine 형식으로 변환
            $imageRequests = [];
            foreach ($panels as $panel) {
                $imageRequests[] = [
                    'panel_number' => $panel['panel_number'] ?? 0,
                    'visual_prompt' => $panel['visual_prompt'] ?? '',
                    'characters' => $panel['characters'] ?? [],
                    'style' => 'webtoon',
                    'width' => 1024,
                    'height' => 1448
                ];
            }

            $response = Http::timeout(300)->post(
                "{$engineUrl}/engine/image/generate-batch",
                [
                    'episode_id' => $this->jobModel->episode->id,
                    'panels' => $imageRequests,
                    'options' => (object)[]  // 빈 객체로 전송
                ]
            );

            if ($response->successful()) {
                $result = $response->json();

                Log::info("Image Engine response received successfully");

                // Asset 저장
                $images = $result['result']['images'] ?? [];
                foreach ($images as $imageData) {
                    Asset::create([
                        'episode_id' => $this->jobModel->episode->id,
                        'type' => 'image',
                        'path' => $imageData['image_url'] ?? '',
                        'file_size' => ($imageData['size_mb'] ?? 0) * 1024 * 1024, // MB를 bytes로 변환
                        'meta_json' => [
                            'panel_number' => $imageData['panel_number'] ?? 0,
                            'width' => $imageData['width'] ?? 0,
                            'height' => $imageData['height'] ?? 0,
                            'size_mb' => $imageData['size_mb'] ?? 0,
                            'generation_metadata' => $imageData['generation_metadata'] ?? []
                        ]
                    ]);
                }

                Log::info("Created " . count($images) . " asset records");

                // Episode 업데이트
                if ($this->jobModel->episode) {
                    $this->jobModel->episode->update([
                        'status' => 'done',
                        'generation_metadata' => array_merge(
                            $this->jobModel->episode->generation_metadata ?? [],
                            [
                                'images' => [
                                    'total_panels' => count($images),
                                    'total_size_mb' => $result['result']['total_size_mb'] ?? 0,
                                    'generated_at' => now()->toIso8601String()
                                ]
                            ]
                        )
                    ]);
                }

                // Job 완료 처리
                $this->jobModel->update([
                    'status' => 'done',
                    'output_json' => $result['result'] ?? [],
                    'cost_units' => ($this->jobModel->cost_units ?? 0) + ($result['metadata']['cost_units'] ?? 0),
                    'completed_at' => now(),
                ]);

                Log::info("Image Job {$this->jobModel->id} completed successfully");

            } else {
                throw new \Exception("Engine returned error: HTTP {$response->status()} - {$response->body()}");
            }

        } catch (\Exception $e) {
            // 에러 처리
            Log::error("Image Job {$this->jobModel->id} failed: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            $this->jobModel->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'retry_count' => $this->jobModel->retry_count + 1,
            ]);

            if ($this->jobModel->episode) {
                $this->jobModel->episode->update(['status' => 'failed']);
            }

            // 재시도 (최대 3회)
            if ($this->jobModel->retry_count < 3) {
                Log::info("Image Job {$this->jobModel->id} will be retried in 60 seconds");
                $this->release(60);
            } else {
                Log::error("Image Job {$this->jobModel->id} failed after 3 attempts");
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Image Job {$this->jobModel->id} permanently failed: " . $exception->getMessage());
        
        $this->jobModel->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        if ($this->jobModel->episode) {
            $this->jobModel->episode->update(['status' => 'failed']);
        }
    }
}
