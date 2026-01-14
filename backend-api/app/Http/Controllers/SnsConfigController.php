<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;

class SnsConfigController extends Controller
{
    /**
     * Get SNS configuration status
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'mock_mode' => Config::get('sns.mock_mode', true),
                'platforms' => [
                    'twitter' => [
                        'enabled' => Config::get('sns.twitter.enabled', false),
                        'configured' => !empty(env('TWITTER_ACCESS_TOKEN')),
                    ],
                    'facebook' => [
                        'enabled' => Config::get('sns.facebook.enabled', false),
                        'configured' => !empty(env('FACEBOOK_ACCESS_TOKEN')),
                    ],
                    'instagram' => [
                        'enabled' => Config::get('sns.instagram.enabled', false),
                        'configured' => !empty(env('INSTAGRAM_ACCESS_TOKEN')),
                    ],
                    'tiktok' => [
                        'enabled' => Config::get('sns.tiktok.enabled', false),
                        'configured' => !empty(env('TIKTOK_ACCESS_TOKEN')),
                    ],
                ],
            ],
        ]);
    }

    /**
     * Update SNS configuration
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'platform' => 'required|in:twitter,facebook,instagram,tiktok',
            'config' => 'required|array',
        ]);

        $platform = $validated['platform'];
        $config = $validated['config'];

        // Update .env file
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $updates = [];
        switch ($platform) {
            case 'twitter':
                $updates = [
                    'TWITTER_API_KEY' => $config['api_key'] ?? '',
                    'TWITTER_API_SECRET' => $config['api_secret'] ?? '',
                    'TWITTER_ACCESS_TOKEN' => $config['access_token'] ?? '',
                    'TWITTER_ACCESS_SECRET' => $config['access_secret'] ?? '',
                    'TWITTER_BEARER_TOKEN' => $config['bearer_token'] ?? '',
                ];
                break;
            
            case 'facebook':
                $updates = [
                    'FACEBOOK_APP_ID' => $config['app_id'] ?? '',
                    'FACEBOOK_APP_SECRET' => $config['app_secret'] ?? '',
                    'FACEBOOK_ACCESS_TOKEN' => $config['access_token'] ?? '',
                ];
                break;
            
            case 'instagram':
                $updates = [
                    'INSTAGRAM_APP_ID' => $config['app_id'] ?? '',
                    'INSTAGRAM_APP_SECRET' => $config['app_secret'] ?? '',
                    'INSTAGRAM_ACCESS_TOKEN' => $config['access_token'] ?? '',
                ];
                break;
            
            case 'tiktok':
                $updates = [
                    'TIKTOK_CLIENT_KEY' => $config['client_key'] ?? '',
                    'TIKTOK_CLIENT_SECRET' => $config['client_secret'] ?? '',
                    'TIKTOK_ACCESS_TOKEN' => $config['access_token'] ?? '',
                    'TIKTOK_OPEN_ID' => $config['open_id'] ?? '',
                ];
                break;
        }

        // Update environment variables
        foreach ($updates as $key => $value) {
            $pattern = "/^{$key}=.*/m";
            $replacement = "{$key}={$value}";
            
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        file_put_contents($envPath, $envContent);

        // Clear config cache
        Artisan::call('config:clear');

        return response()->json([
            'success' => true,
            'message' => ucfirst($platform) . ' API configuration updated successfully',
        ]);
    }

    /**
     * Toggle mock mode
     */
    public function toggleMockMode(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);

        $pattern = "/^SNS_MOCK_MODE=.*/m";
        $replacement = "SNS_MOCK_MODE=" . ($validated['enabled'] ? 'true' : 'false');
        
        if (preg_match($pattern, $envContent)) {
            $envContent = preg_replace($pattern, $replacement, $envContent);
        } else {
            $envContent .= "\n{$replacement}";
        }

        file_put_contents($envPath, $envContent);

        // Clear config cache
        Artisan::call('config:clear');

        return response()->json([
            'success' => true,
            'message' => 'Mock mode ' . ($validated['enabled'] ? 'enabled' : 'disabled'),
            'mock_mode' => $validated['enabled'],
        ]);
    }

    /**
     * Test API connection
     */
    public function testConnection(Request $request, string $platform)
    {
        $validated = $request->validate([
            'access_token' => 'required|string',
        ]);

        try {
            $result = match($platform) {
                'twitter' => $this->testTwitterConnection($validated['access_token']),
                'facebook' => $this->testFacebookConnection($validated['access_token']),
                'instagram' => $this->testInstagramConnection($validated['access_token']),
                'tiktok' => $this->testTikTokConnection($validated['access_token']),
                default => throw new \Exception("Unsupported platform: {$platform}")
            };

            return response()->json([
                'success' => true,
                'message' => ucfirst($platform) . ' API connection successful',
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ], 400);
        }
    }

    private function testTwitterConnection(string $accessToken): array
    {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
        ])->get('https://api.twitter.com/2/users/me');

        if ($response->successful()) {
            $data = $response->json();
            return [
                'username' => $data['data']['username'] ?? 'Unknown',
                'name' => $data['data']['name'] ?? 'Unknown',
            ];
        }

        throw new \Exception($response->json()['detail'] ?? 'API request failed');
    }

    private function testFacebookConnection(string $accessToken): array
    {
        $response = \Illuminate\Support\Facades\Http::get('https://graph.facebook.com/v18.0/me', [
            'access_token' => $accessToken,
            'fields' => 'id,name',
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception($response->json()['error']['message'] ?? 'API request failed');
    }

    private function testInstagramConnection(string $accessToken): array
    {
        $response = \Illuminate\Support\Facades\Http::get('https://graph.facebook.com/v18.0/me/accounts', [
            'access_token' => $accessToken,
            'fields' => 'instagram_business_account',
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception($response->json()['error']['message'] ?? 'API request failed');
    }

    private function testTikTokConnection(string $accessToken): array
    {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
        ])->get('https://open.tiktokapis.com/v2/user/info/');

        if ($response->successful()) {
            return $response->json();
        }

        throw new \Exception($response->json()['error']['message'] ?? 'API request failed');
    }
}
