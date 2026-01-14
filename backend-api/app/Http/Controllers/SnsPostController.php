<?php

namespace App\Http\Controllers;

use App\Models\SnsPost;
use App\Models\Episode;
use App\Services\SnsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SnsPostController extends Controller
{
    protected $snsService;

    public function __construct(SnsService $snsService)
    {
        $this->snsService = $snsService;
    }

    /**
     * Get all SNS posts
     */
    public function index(Request $request)
    {
        $query = SnsPost::with(['episode', 'episode.project']);

        // Filter by platform
        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by episode
        if ($request->has('episode_id')) {
            $query->where('episode_id', $request->episode_id);
        }

        $posts = $query->orderBy('created_at', 'desc')
                      ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Get a single SNS post
     */
    public function show($id)
    {
        $post = SnsPost::with(['episode', 'episode.project'])->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'SNS post not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Create SNS posts for an episode
     */
    public function createForEpisode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'episode_id' => 'required|exists:episodes,id',
            'auto_schedule' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $episode = Episode::find($request->episode_id);
        $autoSchedule = $request->get('auto_schedule', true);

        $posts = $this->snsService->createPostsForEpisode($episode, $autoSchedule);

        return response()->json([
            'success' => true,
            'message' => 'SNS posts created successfully',
            'data' => $posts
        ], 201);
    }

    /**
     * Create or update a single SNS post
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'episode_id' => 'required|exists:episodes,id',
            'platform' => 'required|in:twitter,facebook,instagram,tiktok',
            'content' => 'required|string',
            'image_url' => 'nullable|url',
            'scheduled_at' => 'nullable|date',
            'status' => 'nullable|in:draft,scheduled,posted,failed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $post = SnsPost::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'SNS post created successfully',
            'data' => $post
        ], 201);
    }

    /**
     * Update an SNS post
     */
    public function update(Request $request, $id)
    {
        $post = SnsPost::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'SNS post not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'platform' => 'sometimes|in:twitter,facebook,instagram,tiktok',
            'content' => 'sometimes|string',
            'image_url' => 'nullable|url',
            'scheduled_at' => 'nullable|date',
            'status' => 'nullable|in:draft,scheduled,posted,failed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $post->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'SNS post updated successfully',
            'data' => $post
        ]);
    }

    /**
     * Delete an SNS post
     */
    public function destroy($id)
    {
        $post = SnsPost::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'SNS post not found'
            ], 404);
        }

        // Only allow deleting draft or failed posts
        if (in_array($post->status, ['posted'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a posted SNS post'
            ], 400);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'SNS post deleted successfully'
        ]);
    }

    /**
     * Post immediately to social media
     */
    public function postNow($id)
    {
        $post = SnsPost::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'SNS post not found'
            ], 404);
        }

        if ($post->status === 'posted') {
            return response()->json([
                'success' => false,
                'message' => 'This post has already been posted'
            ], 400);
        }

        $success = $this->snsService->postToSocialMedia($post);

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Post published successfully',
                'data' => $post->fresh()
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to publish post',
            'error' => $post->error_message
        ], 500);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => SnsPost::count(),
            'by_status' => [
                'draft' => SnsPost::where('status', 'draft')->count(),
                'scheduled' => SnsPost::where('status', 'scheduled')->count(),
                'posted' => SnsPost::where('status', 'posted')->count(),
                'failed' => SnsPost::where('status', 'failed')->count(),
            ],
            'by_platform' => [
                'twitter' => SnsPost::where('platform', 'twitter')->count(),
                'facebook' => SnsPost::where('platform', 'facebook')->count(),
                'instagram' => SnsPost::where('platform', 'instagram')->count(),
                'tiktok' => SnsPost::where('platform', 'tiktok')->count(),
            ],
            'recent_posts' => SnsPost::where('status', 'posted')
                ->orderBy('posted_at', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
