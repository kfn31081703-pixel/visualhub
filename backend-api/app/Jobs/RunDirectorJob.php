<?php

namespace App\Jobs;

use App\Models\Job;
use App\Models\Episode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunDirectorJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $jobModel;
    public $timeout = 300; // 5 minutes
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
            Log::info("Starting Director Job {$this->jobModel->id}");

            // Job 시작
            $this->jobModel->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            // Episode 상태 업데이트
            if ($this->jobModel->episode) {
                $this->jobModel->episode->update(['status' => 'running']);
            }

            // AI Director Engine 호출
            $engineUrl = env('AI_DIRECTOR_ENGINE_URL', 'http://localhost:8002');
            
            Log::info("Calling Director Engine at: {$engineUrl}/engine/director/storyboard");

            $response = Http::timeout(180)->post(
                "{$engineUrl}/engine/director/storyboard",
                [
                    'project' => $this->jobModel->input_json['project'] ?? [],
                    'episode' => $this->jobModel->input_json['episode'] ?? [],
                    'inputs' => [
                        'target_panels' => $this->jobModel->input_json['target_panels'] ?? 15,
                    ],
                    'options' => [
                        'style' => 'webtoon'
                    ]
                ]
            );

            if ($response->successful()) {
                $result = $response->json();

                Log::info("Director Engine response received successfully");

                // Episode에 결과 저장
                if ($this->jobModel->episode) {
                    $this->jobModel->episode->update([
                        'storyboard_json' => $result['result'] ?? [],
                        'status' => 'done',
                        'generation_metadata' => array_merge(
                            $this->jobModel->episode->generation_metadata ?? [],
                            [
                                'director' => [
                                    'total_panels' => $result['result']['total_panels'] ?? 0,
                                    'generated_at' => now()->toIso8601String()
                                ]
                            ]
                        )
                    ]);

                    Log::info("Episode {$this->jobModel->episode->id} updated with storyboard");
                }

                // Job 완료 처리
                $this->jobModel->update([
                    'status' => 'done',
                    'output_json' => $result['result'] ?? [],
                    'cost_units' => ($this->jobModel->cost_units ?? 0) + ($result['metadata']['cost_units'] ?? 0),
                    'completed_at' => now(),
                ]);

                Log::info("Director Job {$this->jobModel->id} completed successfully");

            } else {
                throw new \Exception("Engine returned error: HTTP {$response->status()} - {$response->body()}");
            }

        } catch (\Exception $e) {
            // 에러 처리
            Log::error("Director Job {$this->jobModel->id} failed: " . $e->getMessage());
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
                Log::info("Director Job {$this->jobModel->id} will be retried in 60 seconds");
                $this->release(60);
            } else {
                Log::error("Director Job {$this->jobModel->id} failed after 3 attempts");
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Director Job {$this->jobModel->id} permanently failed: " . $exception->getMessage());
        
        $this->jobModel->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        if ($this->jobModel->episode) {
            $this->jobModel->episode->update(['status' => 'failed']);
        }
    }
}
