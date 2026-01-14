<?php

namespace App\Services;

use App\Models\Episode;
use App\Models\SnsPost;
use App\Models\SnsAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SnsService
{
    /**
     * Generate SNS post content for an episode
     */
    public function generatePostContent(Episode $episode, string $platform): string
    {
        $project = $episode->project;
        
        // Basic template
        $templates = [
            'twitter' => "🎨 새로운 에피소드 공개!\n\n📖 {title} - {episode_number}화\n{genre} | {tone}\n\n✨ {description}\n\n👉 지금 바로 확인하세요!\n\n#{genre} #웹툰 #TOONVERSE",
            
            'facebook' => "🎉 새로운 에피소드가 공개되었습니다!\n\n📖 제목: {title} - {episode_number}화\n🎭 장르: {genre}\n🎨 톤: {tone}\n\n{description}\n\n지금 바로 ToonVerse에서 확인해보세요! 🚀\n\n#웹툰 #{genre} #TOONVERSE #AI웹툰",
            
            'instagram' => "✨ NEW EPISODE ALERT! ✨\n\n{title} - Episode {episode_number}\n\n{description}\n\n📱 Read now on ToonVerse!\n\n#{genre} #webtoon #TOONVERSE #comics #manga #manhwa #{tone}",
            
            'tiktok' => "🔥 {title} EP.{episode_number} 🔥\n\n{description}\n\n✨ 지금 바로 확인! ✨\n\n#{genre} #웹툰 #TOONVERSE #추천 #꿀잼"
        ];

        $template = $templates[$platform] ?? $templates['twitter'];
        
        // Generate description from script (first 100 characters)
        $description = mb_substr(strip_tags($episode->script_text ?? '새로운 이야기가 펼쳐집니다!'), 0, 100);
        if (strlen($description) >= 100) {
            $description .= '...';
        }

        // Replace placeholders
        $content = str_replace(
            ['{title}', '{episode_number}', '{genre}', '{tone}', '{description}'],
            [
                $project->title ?? 'Untitled',
                $episode->episode_number,
                $project->genre ?? 'Drama',
                $project->tone ?? 'Neutral',
                $description
            ],
            $template
        );

        return $content;
    }

    /**
     * Create SNS posts for an episode on all active platforms
     */
    public function createPostsForEpisode(Episode $episode, bool $autoSchedule = true): array
    {
        $posts = [];
        $activeAccounts = SnsAccount::active()->get();

        foreach ($activeAccounts as $account) {
            $content = $this->generatePostContent($episode, $account->platform);
            
            // Get episode thumbnail
            $imageUrl = $this->getEpisodeThumbnail($episode);
            
            $post = SnsPost::create([
                'episode_id' => $episode->id,
                'platform' => $account->platform,
                'content' => $content,
                'image_url' => $imageUrl,
                'status' => $autoSchedule ? 'scheduled' : 'draft',
                'scheduled_at' => $autoSchedule ? now()->addMinutes(5) : null,
                'metadata' => [
                    'account_id' => $account->id,
                    'auto_generated' => true,
                    'project_title' => $episode->project->title ?? '',
                    'episode_number' => $episode->episode_number,
                ]
            ]);

            $posts[] = $post;
        }

        return $posts;
    }

    /**
     * Get episode thumbnail URL
     */
    private function getEpisodeThumbnail(Episode $episode): ?string
    {
        // Try to get first panel from storyboard
        $storyboard = $episode->storyboard_json;
        
        if ($storyboard && isset($storyboard['panels']) && count($storyboard['panels']) > 0) {
            $firstPanel = $storyboard['panels'][0];
            if (isset($firstPanel['image_url'])) {
                return $firstPanel['image_url'];
            }
        }

        // Try to get from assets
        $asset = $episode->assets()->where('type', 'final_image')->first();
        if ($asset && $asset->file_path) {
            return Storage::url($asset->file_path);
        }

        return null;
    }

    /**
     * Post to social media platform
     */
    public function postToSocialMedia(SnsPost $post): bool
    {
        try {
            $account = SnsAccount::active()
                ->byPlatform($post->platform)
                ->first();

            if (!$account) {
                throw new \Exception("No active account found for platform: {$post->platform}");
            }

            // Call appropriate platform service
            $result = match($post->platform) {
                'twitter' => $this->postToTwitter($post, $account),
                'facebook' => $this->postToFacebook($post, $account),
                'instagram' => $this->postToInstagram($post, $account),
                'tiktok' => $this->postToTikTok($post, $account),
                default => throw new \Exception("Unsupported platform: {$post->platform}")
            };

            if ($result['success']) {
                $post->update([
                    'status' => 'posted',
                    'posted_at' => now(),
                    'post_url' => $result['post_url'] ?? null,
                    'post_id' => $result['post_id'] ?? null,
                ]);
                
                Log::info("Successfully posted to {$post->platform}", [
                    'post_id' => $post->id,
                    'platform_post_id' => $result['post_id'] ?? null
                ]);
                
                return true;
            }

            throw new \Exception($result['error'] ?? 'Unknown error');

        } catch (\Exception $e) {
            $post->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            
            Log::error("Failed to post to {$post->platform}", [
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }

    /**
     * Post to Twitter/X
     */
    private function postToTwitter(SnsPost $post, SnsAccount $account): array
    {
        // TODO: Implement Twitter API integration
        // For now, return mock success for testing
        Log::info('Twitter posting (mock)', ['post_id' => $post->id]);
        
        return [
            'success' => true,
            'post_id' => 'twitter_' . time(),
            'post_url' => 'https://twitter.com/toonverse/status/' . time(),
        ];
    }

    /**
     * Post to Facebook
     */
    private function postToFacebook(SnsPost $post, SnsAccount $account): array
    {
        // TODO: Implement Facebook API integration
        Log::info('Facebook posting (mock)', ['post_id' => $post->id]);
        
        return [
            'success' => true,
            'post_id' => 'fb_' . time(),
            'post_url' => 'https://facebook.com/posts/' . time(),
        ];
    }

    /**
     * Post to Instagram
     */
    private function postToInstagram(SnsPost $post, SnsAccount $account): array
    {
        // TODO: Implement Instagram API integration
        Log::info('Instagram posting (mock)', ['post_id' => $post->id]);
        
        return [
            'success' => true,
            'post_id' => 'ig_' . time(),
            'post_url' => 'https://instagram.com/p/' . time(),
        ];
    }

    /**
     * Post to TikTok
     */
    private function postToTikTok(SnsPost $post, SnsAccount $account): array
    {
        // TODO: Implement TikTok API integration
        Log::info('TikTok posting (mock)', ['post_id' => $post->id]);
        
        return [
            'success' => true,
            'post_id' => 'tiktok_' . time(),
            'post_url' => 'https://tiktok.com/@toonverse/video/' . time(),
        ];
    }

    /**
     * Process scheduled posts that are ready
     */
    public function processScheduledPosts(): int
    {
        $posts = SnsPost::readyToPost()->get();
        $processedCount = 0;

        foreach ($posts as $post) {
            if ($this->postToSocialMedia($post)) {
                $processedCount++;
            }
        }

        return $processedCount;
    }
}
