<?php

namespace App\Jobs;

use App\Models\Job as EpisodeJob;
use App\Models\Episode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunTextScriptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $jobModel;
    public $timeout = 300; // 5 minutes
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(EpisodeJob $jobModel)
    {
        $this->jobModel = $jobModel;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Starting Job {$this->jobModel->id} - Type: {$this->jobModel->type}");

            // Job 시작
            $this->jobModel->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            // Episode 상태 업데이트
            if ($this->jobModel->episode) {
                $this->jobModel->episode->update(['status' => 'running']);
            }

            // AI Text Engine 호출
            $engineUrl = env('AI_TEXT_ENGINE_URL', 'http://localhost:8001');
            
            Log::info("Calling Text Engine at: {$engineUrl}/engine/text/script");

            $response = Http::timeout(120)->post(
                "{$engineUrl}/engine/text/script",
                [
                    'project' => $this->jobModel->input_json['project'] ?? [],
                    'episode' => $this->jobModel->input_json['episode'] ?? [],
                    'inputs' => [
                        'keywords' => $this->jobModel->input_json['keywords'] ?? [],
                        'target_word_count' => 2000
                    ],
                    'options' => [
                        'language' => 'ko',
                        'include_clifhanger' => true,
                        'tone' => $this->jobModel->input_json['project']['tone'] ?? 'serious'
                    ]
                ]
            );

            if ($response->successful()) {
                $result = $response->json();

                Log::info("Text Engine response received successfully");

                // Episode에 결과 저장
                if ($this->jobModel->episode) {
                    $this->jobModel->episode->update([
                        'script_text' => $result['result']['script_text'] ?? '',
                        'status' => 'done',
                        'generation_metadata' => [
                            'word_count' => $result['result']['word_count'] ?? 0,
                            'estimated_panels' => $result['result']['estimated_panels'] ?? 0,
                            'scenes_count' => count($result['result']['scenes'] ?? []),
                            'generated_at' => now()->toIso8601String()
                        ]
                    ]);

                    Log::info("Episode {$this->jobModel->episode->id} updated with script");
                }

                // Job 완료 처리
                $this->jobModel->update([
                    'status' => 'done',
                    'output_json' => $result['result'] ?? [],
                    'cost_units' => $result['metadata']['cost_units'] ?? 0,
                    'completed_at' => now(),
                ]);

                Log::info("Job {$this->jobModel->id} completed successfully");

            } else {
                throw new \Exception("Engine returned error: HTTP {$response->status()} - {$response->body()}");
            }

        } catch (\Exception $e) {
            // 에러 처리
            Log::error("Job {$this->jobModel->id} failed: " . $e->getMessage());
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
                Log::info("Job {$this->jobModel->id} will be retried in 60 seconds");
                $this->release(60);
            } else {
                Log::error("Job {$this->jobModel->id} failed after 3 attempts");
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Job {$this->jobModel->id} permanently failed: " . $exception->getMessage());
        
        $this->jobModel->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        if ($this->jobModel->episode) {
            $this->jobModel->episode->update(['status' => 'failed']);
        }
    }
}
