<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\DashboardController;

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

// Health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'TOONVERSE AI API is running',
        'timestamp' => now()->toIso8601String()
    ]);
});
