<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    /**
     * Display a listing of jobs.
     */
    public function index(Request $request)
    {
        $query = Job::with('episode');

        if ($request->has('episode_id')) {
            $query->where('episode_id', $request->episode_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $jobs = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $jobs->items(),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'total' => $jobs->total()
            ]
        ]);
    }

    /**
     * Display the specified job.
     */
    public function show($id)
    {
        $job = Job::with('episode')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }

    /**
     * Retry a failed job.
     */
    public function retry($id)
    {
        $job = Job::findOrFail($id);

        if ($job->status !== 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'Only failed jobs can be retried'
            ], 400);
        }

        $job->update([
            'status' => 'queued',
            'error_message' => null,
        ]);

        // Redispatch to queue
        \App\Jobs\RunTextScriptJob::dispatch($job);

        return response()->json([
            'success' => true,
            'message' => 'Job retried successfully',
            'data' => $job
        ]);
    }
}
