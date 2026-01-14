<?php

namespace App\Services;

use App\Models\Episode;
use App\Models\SnsPost;
use App\Models\SnsAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Config;

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
        // Check if mock mode is enabled
        if (Config::get('sns.mock_mode', true) || !Config::get('sns.twitter.enabled', false)) {
            Log::info('Twitter posting (mock mode)', [
                'post_id' => $post->id,
                'account' => $account->account_name,
            ]);
            
            return [
                'success' => true,
                'post_id' => 'twitter_mock_' . time(),
                'post_url' => 'https://twitter.com/' . str_replace('@', '', $account->account_name) . '/status/' . time(),
                'mock' => true,
            ];
        }

        try {
            // Get Twitter API credentials
            $bearerToken = $account->access_token ?? Config::get('sns.twitter.bearer_token');

            if (!$bearerToken) {
                throw new \Exception('Twitter API credentials not configured');
            }

            // Twitter API v2 endpoint for creating tweets
            $apiUrl = 'https://api.twitter.com/2/tweets';

            // Prepare tweet data
            $tweetData = [
                'text' => mb_substr($post->content, 0, 280), // Twitter character limit
            ];

            // Add media if available
            if ($post->image_url) {
                // First, upload the media
                $mediaId = $this->uploadTwitterMedia($post->image_url, $bearerToken);
                if ($mediaId) {
                    $tweetData['media'] = ['media_ids' => [$mediaId]];
                }
            }

            // Make API request
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $bearerToken,
                'Content-Type' => 'application/json',
            ])->post($apiUrl, $tweetData);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data']['id'])) {
                    Log::info('Twitter post created successfully', [
                        'post_id' => $post->id,
                        'tweet_id' => $data['data']['id']
                    ]);

                    return [
                        'success' => true,
                        'post_id' => $data['data']['id'],
                        'post_url' => 'https://twitter.com/' . str_replace('@', '', $account->account_name) . '/status/' . $data['data']['id'],
                    ];
                }
            }

            // API request failed
            $error = $response->json()['detail'] ?? $response->body();
            throw new \Exception('Twitter API error: ' . $error);

        } catch (\Exception $e) {
            Log::error('Twitter posting failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Upload media to Twitter
     */
    private function uploadTwitterMedia(string $imageUrl, string $bearerToken): ?string
    {
        try {
            // Download image
            $imageContent = Http::get($imageUrl)->body();
            
            // Upload to Twitter
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $bearerToken,
            ])->attach('media', $imageContent, 'image.jpg')
              ->post('https://upload.twitter.com/1.1/media/upload.json');

            if ($response->successful()) {
                return $response->json()['media_id_string'] ?? null;
            }
        } catch (\Exception $e) {
            Log::error('Twitter media upload failed', ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Post to Facebook
     */
    private function postToFacebook(SnsPost $post, SnsAccount $account): array
    {
        // Check if mock mode is enabled
        if (Config::get('sns.mock_mode', true) || !Config::get('sns.facebook.enabled', false)) {
            Log::info('Facebook posting (mock mode)', [
                'post_id' => $post->id,
                'account' => $account->account_name,
            ]);
            
            return [
                'success' => true,
                'post_id' => 'fb_mock_' . time(),
                'post_url' => 'https://facebook.com/' . $account->account_id . '/posts/' . time(),
                'mock' => true,
            ];
        }

        try {
            // Get Facebook API credentials
            $accessToken = $account->access_token ?? Config::get('sns.facebook.access_token');
            $pageId = $account->account_id ?? $account->settings['page_id'] ?? null;

            if (!$accessToken || !$pageId) {
                throw new \Exception('Facebook API credentials not configured');
            }

            // Facebook Graph API endpoint
            $apiVersion = Config::get('sns.facebook.api_version', 'v18.0');
            $apiUrl = "https://graph.facebook.com/{$apiVersion}/{$pageId}/feed";

            // Prepare post data
            $postData = [
                'message' => $post->content,
                'access_token' => $accessToken,
            ];

            // Add image if available
            if ($post->image_url) {
                $postData['link'] = $post->image_url;
            }

            // Make API request
            $response = Http::asForm()->post($apiUrl, $postData);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['id'])) {
                    Log::info('Facebook post created successfully', [
                        'post_id' => $post->id,
                        'fb_post_id' => $data['id']
                    ]);

                    return [
                        'success' => true,
                        'post_id' => $data['id'],
                        'post_url' => "https://facebook.com/{$data['id']}",
                    ];
                }
            }

            // API request failed
            $error = $response->json()['error']['message'] ?? $response->body();
            throw new \Exception('Facebook API error: ' . $error);

        } catch (\Exception $e) {
            Log::error('Facebook posting failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Post to Instagram
     */
    private function postToInstagram(SnsPost $post, SnsAccount $account): array
    {
        // Check if mock mode is enabled
        if (Config::get('sns.mock_mode', true) || !Config::get('sns.instagram.enabled', false)) {
            Log::info('Instagram posting (mock mode)', [
                'post_id' => $post->id,
                'account' => $account->account_name,
            ]);
            
            return [
                'success' => true,
                'post_id' => 'ig_mock_' . time(),
                'post_url' => 'https://instagram.com/p/' . base64_encode(time()),
                'mock' => true,
            ];
        }

        try {
            // Get Instagram API credentials
            $accessToken = $account->access_token ?? Config::get('sns.instagram.access_token');
            $accountId = $account->account_id ?? $account->settings['instagram_account_id'] ?? null;

            if (!$accessToken || !$accountId) {
                throw new \Exception('Instagram API credentials not configured');
            }

            // Instagram requires an image URL
            if (!$post->image_url) {
                throw new \Exception('Instagram posts require an image');
            }

            // Instagram Graph API endpoint (using Facebook Graph API)
            $apiVersion = Config::get('sns.instagram.api_version', 'v18.0');
            
            // Step 1: Create media container
            $containerUrl = "https://graph.facebook.com/{$apiVersion}/{$accountId}/media";
            $containerData = [
                'image_url' => $post->image_url,
                'caption' => $post->content,
                'access_token' => $accessToken,
            ];

            $containerResponse = Http::asForm()->post($containerUrl, $containerData);

            if (!$containerResponse->successful()) {
                $error = $containerResponse->json()['error']['message'] ?? $containerResponse->body();
                throw new \Exception('Instagram media container error: ' . $error);
            }

            $containerId = $containerResponse->json()['id'];

            // Step 2: Publish the media container
            $publishUrl = "https://graph.facebook.com/{$apiVersion}/{$accountId}/media_publish";
            $publishData = [
                'creation_id' => $containerId,
                'access_token' => $accessToken,
            ];

            $publishResponse = Http::asForm()->post($publishUrl, $publishData);

            if ($publishResponse->successful()) {
                $data = $publishResponse->json();
                
                if (isset($data['id'])) {
                    Log::info('Instagram post created successfully', [
                        'post_id' => $post->id,
                        'ig_post_id' => $data['id']
                    ]);

                    return [
                        'success' => true,
                        'post_id' => $data['id'],
                        'post_url' => "https://instagram.com/p/" . base64_encode($data['id']),
                    ];
                }
            }

            // API request failed
            $error = $publishResponse->json()['error']['message'] ?? $publishResponse->body();
            throw new \Exception('Instagram publish error: ' . $error);

        } catch (\Exception $e) {
            Log::error('Instagram posting failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Post to TikTok
     */
    private function postToTikTok(SnsPost $post, SnsAccount $account): array
    {
        // Check if mock mode is enabled
        if (Config::get('sns.mock_mode', true) || !Config::get('sns.tiktok.enabled', false)) {
            Log::info('TikTok posting (mock mode)', [
                'post_id' => $post->id,
                'account' => $account->account_name,
                'reason' => !Config::get('sns.tiktok.enabled') ? 'API not configured' : 'Mock mode enabled'
            ]);
            
            return [
                'success' => true,
                'post_id' => 'tiktok_mock_' . time(),
                'post_url' => 'https://tiktok.com/@' . str_replace('@', '', $account->account_name) . '/video/' . time(),
                'mock' => true,
            ];
        }

        try {
            // Get TikTok API credentials
            $accessToken = $account->access_token ?? Config::get('sns.tiktok.access_token');
            $openId = $account->settings['open_id'] ?? Config::get('sns.tiktok.open_id');

            if (!$accessToken || !$openId) {
                throw new \Exception('TikTok API credentials not configured');
            }

            // TikTok API endpoint for creating video posts
            $apiUrl = 'https://open.tiktokapis.com/v2/post/publish/video/init/';

            // Prepare post data
            $postData = [
                'post_info' => [
                    'title' => mb_substr($post->content, 0, 150), // TikTok title limit
                    'privacy_level' => 'PUBLIC_TO_EVERYONE',
                    'disable_duet' => false,
                    'disable_comment' => false,
                    'disable_stitch' => false,
                    'video_cover_timestamp_ms' => 1000,
                ],
                'source_info' => [
                    'source' => 'FILE_UPLOAD',
                    'video_size' => 0, // Will be updated when actual video is uploaded
                    'chunk_size' => 10000000,
                    'total_chunk_count' => 1,
                ]
            ];

            // Make API request
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post($apiUrl, $postData);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data']['publish_id'])) {
                    Log::info('TikTok post created successfully', [
                        'post_id' => $post->id,
                        'tiktok_publish_id' => $data['data']['publish_id']
                    ]);

                    return [
                        'success' => true,
                        'post_id' => $data['data']['publish_id'],
                        'post_url' => 'https://tiktok.com/@' . str_replace('@', '', $account->account_name) . '/video/' . $data['data']['publish_id'],
                        'upload_url' => $data['data']['upload_url'] ?? null,
                    ];
                }
            }

            // API request failed
            $error = $response->json()['error']['message'] ?? $response->body();
            throw new \Exception('TikTok API error: ' . $error);

        } catch (\Exception $e) {
            Log::error('TikTok posting failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
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
