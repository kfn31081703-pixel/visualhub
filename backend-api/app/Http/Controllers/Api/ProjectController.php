<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request)
    {
        $projects = Project::with('episodes')
            ->paginate($request->get('limit', 20));

        return response()->json([
            'success' => true,
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
                'last_page' => $projects->lastPage()
            ]
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'genre' => 'required|string|max:100',
            'target_country' => 'nullable|string|max:10',
            'tone' => 'nullable|string|max:50',
            'target_audience' => 'nullable|string|max:50',
            'keywords' => 'nullable|array',
            'world_setting' => 'nullable|string',
        ]);

        $project = Project::create($validated);

        return response()->json([
            'success' => true,
            'data' => $project
        ], 201);
    }

    /**
     * Display the specified project.
     */
    public function show($id)
    {
        $project = Project::with(['episodes', 'characters'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'genre' => 'sometimes|string|max:100',
            'target_country' => 'nullable|string|max:10',
            'tone' => 'nullable|string|max:50',
            'target_audience' => 'nullable|string|max:50',
            'keywords' => 'nullable|array',
            'world_setting' => 'nullable|string',
            'status' => 'nullable|string|max:50',
        ]);

        $project->update($validated);

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }

    /**
     * Remove the specified project.
     */
    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);
    }
}
