<?php

namespace App\Jobs;

use App\Models\Job;
use App\Models\Episode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RunFullPipelineJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $jobModel;
    public $timeout = 900; // 15 minutes
    public $tries = 1; // 전체 파이프라인은 재시도하지 않음

    public function __construct(Job $jobModel)
    {
        $this->jobModel = $jobModel;
    }

    public function handle(): void
    {
        try {
            Log::info("Starting Full Pipeline Job {$this->jobModel->id}");

            $this->jobModel->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            $episode = $this->jobModel->episode;
            if (!$episode) {
                throw new \Exception("Episode not found");
            }

            $episode->update(['status' => 'running']);

            // Step 1: Text Engine (시나리오 생성)
            Log::info("Step 1: Generating script...");
            $textJob = Job::create([
                'episode_id' => $episode->id,
                'type' => 'text.script',
                'status' => 'queued',
                'input_json' => $this->jobModel->input_json
            ]);
            RunTextScriptJob::dispatchSync($textJob);
            
            // 재시도 로직으로 Job 상태 확인 (최대 10회, 각 100ms 대기)
            $textJobId = $textJob->id;
            $maxRetries = 10;
            $textJob = null;
            
            for ($i = 0; $i < $maxRetries; $i++) {
                usleep(100000); // 0.1초
                $textJob = Job::where('id', $textJobId)->first();
                
                if ($textJob && $textJob->status === 'done') {
                    Log::info("Text Job {$textJobId} completed successfully (attempt " . ($i + 1) . ")");
                    break;
                }
                
                if ($textJob && $textJob->status === 'failed') {
                    throw new \Exception("Text generation failed: " . ($textJob->error_message ?? 'Unknown'));
                }
            }
            
            if (!$textJob || $textJob->status !== 'done') {
                throw new \Exception("Text generation timeout or failed: status=" . ($textJob->status ?? 'NULL'));
            }

            // Episode 새로고침
            $episode->refresh();

            // Step 2: Director Engine (컷 리스트 생성)
            Log::info("Step 2: Generating storyboard...");
            $directorJob = Job::create([
                'episode_id' => $episode->id,
                'type' => 'director.storyboard',
                'status' => 'queued',
                'input_json' => [
                    'project' => $episode->project->toArray(),
                    'episode' => $episode->toArray(),
                    'target_panels' => $this->jobModel->input_json['target_panels'] ?? 10
                ]
            ]);
            RunDirectorJob::dispatchSync($directorJob);
            
            $directorJobId = $directorJob->id;
            $directorJob = null;
            
            for ($i = 0; $i < $maxRetries; $i++) {
                usleep(100000);
                $directorJob = Job::where('id', $directorJobId)->first();
                if ($directorJob && $directorJob->status === 'done') {
                    Log::info("Director Job {$directorJobId} completed (attempt " . ($i + 1) . ")");
                    break;
                }
                if ($directorJob && $directorJob->status === 'failed') {
                    throw new \Exception("Director generation failed: " . ($directorJob->error_message ?? 'Unknown'));
                }
            }
            
            if (!$directorJob || $directorJob->status !== 'done') {
                throw new \Exception("Director generation timeout: status=" . ($directorJob->status ?? 'NULL'));
            }

            $episode->refresh();

            // Step 3: Image Engine (이미지 생성)
            Log::info("Step 3: Generating images...");
            $imageJob = Job::create([
                'episode_id' => $episode->id,
                'type' => 'image.generate',
                'status' => 'queued',
                'input_json' => [
                    'project' => $episode->project->toArray(),
                    'episode' => $episode->toArray()
                ]
            ]);
            RunImageJob::dispatchSync($imageJob);
            
            $imageJobId = $imageJob->id;
            $imageJob = null;
            
            for ($i = 0; $i < $maxRetries; $i++) {
                usleep(100000);
                $imageJob = Job::where('id', $imageJobId)->first();
                if ($imageJob && $imageJob->status === 'done') {
                    Log::info("Image Job {$imageJobId} completed (attempt " . ($i + 1) . ")");
                    break;
                }
                if ($imageJob && $imageJob->status === 'failed') {
                    throw new \Exception("Image generation failed: " . ($imageJob->error_message ?? 'Unknown'));
                }
            }
            
            if (!$imageJob || $imageJob->status !== 'done') {
                throw new \Exception("Image generation timeout: status=" . ($imageJob->status ?? 'NULL'));
            }

            $episode->refresh();

            // Step 4: Lettering Engine (말풍선 + 대사 합성)
            Log::info("Step 4: Applying lettering...");
            $letteringJob = Job::create([
                'episode_id' => $episode->id,
                'type' => 'lettering.apply',
                'status' => 'queued',
                'input_json' => [
                    'project' => $episode->project->toArray(),
                    'episode' => $episode->toArray()
                ]
            ]);
            RunLetteringJob::dispatchSync($letteringJob);
            
            $letteringJobId = $letteringJob->id;
            $letteringJob = null;
            
            for ($i = 0; $i < $maxRetries; $i++) {
                usleep(100000);
                $letteringJob = Job::where('id', $letteringJobId)->first();
                if ($letteringJob && $letteringJob->status === 'done') {
                    Log::info("Lettering Job {$letteringJobId} completed (attempt " . ($i + 1) . ")");
                    break;
                }
                if ($letteringJob && $letteringJob->status === 'failed') {
                    throw new \Exception("Lettering failed: " . ($letteringJob->error_message ?? 'Unknown'));
                }
            }
            
            if (!$letteringJob || $letteringJob->status !== 'done') {
                throw new \Exception("Lettering timeout: status=" . ($letteringJob->status ?? 'NULL'));
            }

            $episode->refresh();

            // Step 5: Packaging Engine (최종 웹툰 이미지 패키징)
            Log::info("Step 5: Packaging final webtoon...");
            $packagingJob = Job::create([
                'episode_id' => $episode->id,
                'type' => 'packaging.webtoon',
                'status' => 'queued',
                'input_json' => [
                    'project' => $episode->project->toArray(),
                    'episode' => $episode->toArray()
                ]
            ]);
            RunPackagingJob::dispatchSync($packagingJob);
            
            $packagingJobId = $packagingJob->id;
            $packagingJob = null;
            
            for ($i = 0; $i < $maxRetries; $i++) {
                usleep(100000);
                $packagingJob = Job::where('id', $packagingJobId)->first();
                if ($packagingJob && $packagingJob->status === 'done') {
                    Log::info("Packaging Job {$packagingJobId} completed (attempt " . ($i + 1) . ")");
                    break;
                }
                if ($packagingJob && $packagingJob->status === 'failed') {
                    throw new \Exception("Packaging failed: " . ($packagingJob->error_message ?? 'Unknown'));
                }
            }
            
            if (!$packagingJob || $packagingJob->status !== 'done') {
                throw new \Exception("Packaging timeout: status=" . ($packagingJob->status ?? 'NULL'));
            }

            // 전체 파이프라인 완료
            $this->jobModel->update([
                'status' => 'done',
                'output_json' => [
                    'text_job_id' => $textJob->id,
                    'director_job_id' => $directorJob->id,
                    'image_job_id' => $imageJob->id,
                    'lettering_job_id' => $letteringJob->id,
                    'packaging_job_id' => $packagingJob->id,
                    'completed_steps' => 5
                ],
                'cost_units' => $textJob->cost_units + $directorJob->cost_units + $imageJob->cost_units + $letteringJob->cost_units + $packagingJob->cost_units,
                'completed_at' => now(),
            ]);

            $episode->update(['status' => 'done']);

            Log::info("Full Pipeline Job {$this->jobModel->id} completed successfully (5 steps)");

        } catch (\Exception $e) {
            Log::error("Full Pipeline Job {$this->jobModel->id} failed: " . $e->getMessage());

            $this->jobModel->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            if ($this->jobModel->episode) {
                $this->jobModel->episode->update(['status' => 'failed']);
            }

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Full Pipeline Job {$this->jobModel->id} permanently failed");
        
        $this->jobModel->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        if ($this->jobModel->episode) {
            $this->jobModel->episode->update(['status' => 'failed']);
        }
    }
}
