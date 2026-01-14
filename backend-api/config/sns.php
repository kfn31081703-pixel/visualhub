<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SNS API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for various social media platform APIs
    |
    */

    'twitter' => [
        'api_key' => env('TWITTER_API_KEY'),
        'api_secret' => env('TWITTER_API_SECRET'),
        'access_token' => env('TWITTER_ACCESS_TOKEN'),
        'access_secret' => env('TWITTER_ACCESS_SECRET'),
        'bearer_token' => env('TWITTER_BEARER_TOKEN'),
        'api_version' => '2',
        'enabled' => !empty(env('TWITTER_ACCESS_TOKEN')),
    ],

    'facebook' => [
        'app_id' => env('FACEBOOK_APP_ID'),
        'app_secret' => env('FACEBOOK_APP_SECRET'),
        'access_token' => env('FACEBOOK_ACCESS_TOKEN'),
        'api_version' => 'v18.0',
        'enabled' => !empty(env('FACEBOOK_ACCESS_TOKEN')),
    ],

    'instagram' => [
        'app_id' => env('INSTAGRAM_APP_ID'),
        'app_secret' => env('INSTAGRAM_APP_SECRET'),
        'access_token' => env('INSTAGRAM_ACCESS_TOKEN'),
        'api_version' => 'v18.0',
        'enabled' => !empty(env('INSTAGRAM_ACCESS_TOKEN')),
    ],

    'tiktok' => [
        'client_key' => env('TIKTOK_CLIENT_KEY'),
        'client_secret' => env('TIKTOK_CLIENT_SECRET'),
        'access_token' => env('TIKTOK_ACCESS_TOKEN'),
        'open_id' => env('TIKTOK_OPEN_ID'),
        'api_version' => 'v2',
        'enabled' => !empty(env('TIKTOK_ACCESS_TOKEN')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Mock Mode
    |--------------------------------------------------------------------------
    |
    | When enabled, API calls will be simulated instead of making real requests.
    | Useful for development and testing.
    |
    */
    'mock_mode' => env('SNS_MOCK_MODE', true),
];
