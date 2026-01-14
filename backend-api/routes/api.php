<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\SnsPostController;
use App\Http\Controllers\SnsAccountController;
use App\Http\Controllers\SnsConfigController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Projects
Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::put('/projects/{id}', [ProjectController::class, 'update']);
Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

// Episodes
Route::get('/projects/{project}/episodes', [EpisodeController::class, 'index']);
Route::post('/projects/{project}/episodes', [EpisodeController::class, 'store']);
Route::post('/episodes/{episode}/generate', [EpisodeController::class, 'generate']);
Route::post('/episodes/{episode}/generate-full', [EpisodeController::class, 'generateFull']);
Route::post('/episodes/{episode}/generate-director', [EpisodeController::class, 'generateDirector']);
Route::post('/episodes/{episode}/generate-images', [EpisodeController::class, 'generateImages']);
Route::post('/episodes/{id}/activate', [EpisodeController::class, 'activate']);
Route::post('/episodes/{id}/deactivate', [EpisodeController::class, 'deactivate']);
Route::get('/episodes/{id}', [EpisodeController::class, 'show']);

// Jobs
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{id}', [JobController::class, 'show']);
Route::post('/jobs/{id}/retry', [JobController::class, 'retry']);

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// SNS Posts
Route::get('/sns/posts', [SnsPostController::class, 'index']);
Route::post('/sns/posts', [SnsPostController::class, 'store']);
Route::post('/sns/posts/episode', [SnsPostController::class, 'createForEpisode']);
Route::get('/sns/posts/statistics', [SnsPostController::class, 'statistics']);
Route::get('/sns/posts/{id}', [SnsPostController::class, 'show']);
Route::put('/sns/posts/{id}', [SnsPostController::class, 'update']);
Route::delete('/sns/posts/{id}', [SnsPostController::class, 'destroy']);
Route::post('/sns/posts/{id}/post-now', [SnsPostController::class, 'postNow']);

// SNS Accounts
Route::get('/sns/accounts', [SnsAccountController::class, 'index']);
Route::post('/sns/accounts', [SnsAccountController::class, 'store']);
Route::get('/sns/accounts/{id}', [SnsAccountController::class, 'show']);
Route::put('/sns/accounts/{id}', [SnsAccountController::class, 'update']);
Route::delete('/sns/accounts/{id}', [SnsAccountController::class, 'destroy']);
Route::post('/sns/accounts/{id}/toggle-active', [SnsAccountController::class, 'toggleActive']);

// SNS Configuration
Route::get('/sns/config', [SnsConfigController::class, 'index']);
Route::put('/sns/config', [SnsConfigController::class, 'update']);
Route::post('/sns/config/mock-mode', [SnsConfigController::class, 'toggleMockMode']);
Route::post('/sns/config/test/{platform}', [SnsConfigController::class, 'testConnection']);

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'TOONVERSE AI API is running',
        'timestamp' => now()->toIso8601String()
    ]);
});
