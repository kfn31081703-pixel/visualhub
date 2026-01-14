<?php

namespace App\Jobs;

use App\Services\SnsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessScheduledSnsPostsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(SnsService $snsService): void
    {
        Log::info('Processing scheduled SNS posts');
        
        $processedCount = $snsService->processScheduledPosts();
        
        Log::info("Processed {$processedCount} scheduled SNS posts");
    }
}
