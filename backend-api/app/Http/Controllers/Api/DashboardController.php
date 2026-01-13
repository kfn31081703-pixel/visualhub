<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Episode;
use App\Models\Project;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();

        // Today's stats
        $todayEpisodes = Episode::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
        $todayJobs = Job::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
        $completedJobs = Job::whereBetween('completed_at', [$startOfDay, $endOfDay])
            ->where('status', 'done')
            ->count();
        
        $successRate = $todayJobs > 0 ? round(($completedJobs / $todayJobs) * 100, 2) : 0;
        
        $avgCost = Job::whereBetween('completed_at', [$startOfDay, $endOfDay])
            ->where('status', 'done')
            ->avg('cost_units') ?? 0;

        // Jobs by status
        $jobsByStatus = [
            'queued' => Job::where('status', 'queued')->count(),
            'running' => Job::where('status', 'running')->count(),
            'done' => Job::where('status', 'done')->count(),
            'failed' => Job::where('status', 'failed')->count(),
        ];

        // Jobs by type
        $jobsByType = Job::selectRaw('type, COUNT(*) as count')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Overall stats
        $totalProjects = Project::count();
        $totalEpisodes = Episode::count();
        $totalJobs = Job::count();

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'episodes_created' => $todayEpisodes,
                    'jobs_completed' => $completedJobs,
                    'success_rate' => $successRate,
                    'avg_cost' => round($avgCost, 2)
                ],
                'by_status' => $jobsByStatus,
                'by_type' => $jobsByType,
                'overall' => [
                    'total_projects' => $totalProjects,
                    'total_episodes' => $totalEpisodes,
                    'total_jobs' => $totalJobs
                ]
            ]
        ]);
    }
}
