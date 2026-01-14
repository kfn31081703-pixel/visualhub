<?php

namespace App\Console\Commands;

use App\Services\SnsService;
use Illuminate\Console\Command;

class ProcessScheduledSnsPosts extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'sns:process-scheduled';

    /**
     * The console command description.
     */
    protected $description = 'Process scheduled SNS posts and publish them to social media';

    /**
     * Execute the console command.
     */
    public function handle(SnsService $snsService)
    {
        $this->info('Processing scheduled SNS posts...');
        
        $processedCount = $snsService->processScheduledPosts();
        
        $this->info("Successfully processed {$processedCount} posts");
        
        return Command::SUCCESS;
    }
}
