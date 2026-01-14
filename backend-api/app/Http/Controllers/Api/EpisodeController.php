<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use App\Models\Project;
use App\Models\Job;
use App\Jobs\RunTextScriptJob;
use App\Jobs\RunDirectorJob;
use App\Jobs\RunImageJob;
use App\Jobs\RunFullPipelineJob;
use Illuminate\Http\Request;

class EpisodeController extends Controller
{
    /**
     * Store a newly created episode.
     */
    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'episode_number' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'keywords' => 'nullable|array',
        ]);

        $project = Project::findOrFail($projectId);

        $episode = $project->episodes()->create([
            'episode_number' => $validated['episode_number'],
            'title' => $validated['title'] ?? "Episode {$validated['episode_number']}",
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'data' => $episode
        ], 201);
    }

    /**
     * Start generation process for an episode (Text only).
     */
    public function generate(Request $request, $episodeId)
    {
        $episode = Episode::with('project')->findOrFail($episodeId);
        
        // 상태 업데이트
        $episode->update(['status' => 'queued']);

        // Job 생성
        $job = Job::create([
            'episode_id' => $episode->id,
            'type' => 'text.script',
            'status' => 'queued',
            'input_json' => [
                'project' => $episode->project->toArray(),
                'episode' => $episode->toArray(),
                'keywords' => $request->input('keywords', []),
            ],
        ]);

        // Redis Queue에 dispatch
        RunTextScriptJob::dispatch($job);

        return response()->json([
            'success' => true,
            'message' => 'Generation started',
            'data' => [
                'episode_id' => $episode->id,
                'jobs' => [$job]
            ]
        ], 202);
    }

    /**
     * Start FULL pipeline generation (Text → Director → Image).
     */
    public function generateFull(Request $request, $episodeId)
    {
        $episode = Episode::with('project')->findOrFail($episodeId);
        
        // 상태 업데이트
        $episode->update(['status' => 'queued']);

        // Job 생성
        $job = Job::create([
            'episode_id' => $episode->id,
            'type' => 'pipeline.full',
            'status' => 'queued',
            'input_json' => [
                'project' => $episode->project->toArray(),
                'episode' => $episode->toArray(),
                'keywords' => $request->input('keywords', []),
                'target_panels' => $request->input('target_panels', 10),
            ],
        ]);

        // Redis Queue에 dispatch
        RunFullPipelineJob::dispatch($job);

        return response()->json([
            'success' => true,
            'message' => 'Full pipeline generation started (Text → Director → Image)',
            'data' => [
                'episode_id' => $episode->id,
                'jobs' => [$job]
            ]
        ], 202);
    }

    /**
     * Display the specified episode.
     */
    public function show($id)
    {
        $episode = Episode::with(['project', 'jobs', 'assets'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $episode
        ]);
    }

    /**
     * Display a listing of episodes for a project.
     */
    public function index($projectId)
    {
        $project = Project::findOrFail($projectId);
        $episodes = $project->episodes()->orderBy('episode_number')->get();

        return response()->json([
            'success' => true,
            'data' => $episodes
        ]);
    }

    /**
     * Generate storyboard (Director Engine)
     */
    public function generateDirector(Request $request, $episodeId)
    {
        $episode = Episode::with('project')->findOrFail($episodeId);
        
        // 시나리오가 있는지 확인
        if (!$episode->script_text) {
            return response()->json([
                'success' => false,
                'message' => 'Script is required. Please generate script first.'
            ], 400);
        }

        // 상태 업데이트
        $episode->update(['status' => 'queued']);

        // Job 생성
        $job = Job::create([
            'episode_id' => $episode->id,
            'type' => 'director.storyboard',
            'status' => 'queued',
            'input_json' => [
                'project' => $episode->project->toArray(),
                'episode' => $episode->toArray(),
                'target_panels' => $request->input('target_panels', 15),
            ],
        ]);

        // Redis Queue에 dispatch
        RunDirectorJob::dispatch($job);

        return response()->json([
            'success' => true,
            'message' => 'Storyboard generation started',
            'data' => [
                'episode_id' => $episode->id,
                'jobs' => [$job]
            ]
        ], 202);
    }

    /**
     * Generate images (Image Engine)
     */
    public function generateImages(Request $request, $episodeId)
    {
        $episode = Episode::with('project')->findOrFail($episodeId);
        
        // Storyboard가 있는지 확인
        if (!$episode->storyboard_json || empty($episode->storyboard_json['panels'] ?? [])) {
            return response()->json([
                'success' => false,
                'message' => 'Storyboard is required. Please generate storyboard first.'
            ], 400);
        }

        // 상태 업데이트
        $episode->update(['status' => 'queued']);

        // Job 생성
        $job = Job::create([
            'episode_id' => $episode->id,
            'type' => 'image.generate',
            'status' => 'queued',
            'input_json' => [
                'project' => $episode->project->toArray(),
                'episode' => $episode->toArray(),
            ],
        ]);

        // Redis Queue에 dispatch
        RunImageJob::dispatch($job);

        return response()->json([
            'success' => true,
            'message' => 'Image generation started',
            'data' => [
                'episode_id' => $episode->id,
                'jobs' => [$job]
            ]
        ], 202);
    }

    /**
     * Activate an episode (make it visible to public).
     */
    public function activate($episodeId)
    {
        try {
            $episode = Episode::with('project')->findOrFail($episodeId);
            
            // 에피소드가 완료 상태인지 확인
            if ($episode->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => '에피소드를 활성화하려면 먼저 생성을 완료해야 합니다.',
                    'current_status' => $episode->status
                ], 400);
            }
            
            // 에피소드 활성화
            $episode->update([
                'status' => 'active',
                'published_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => '에피소드가 성공적으로 활성화되었습니다.',
                'data' => $episode
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '에피소드 활성화 중 오류가 발생했습니다.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate an episode (hide from public).
     */
    public function deactivate($episodeId)
    {
        try {
            $episode = Episode::findOrFail($episodeId);
            
            $episode->update([
                'status' => 'completed',
                'published_at' => null
            ]);
            
            return response()->json([
                'success' => true,
                'message' => '에피소드가 비활성화되었습니다.',
                'data' => $episode
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '에피소드 비활성화 중 오류가 발생했습니다.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
