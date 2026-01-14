<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\SnsService;

class Episode extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'episode_number',
        'title',
        'script_text',
        'storyboard_json',
        'status',
        'generation_metadata'
    ];

    protected $casts = [
        'storyboard_json' => 'array',
        'generation_metadata' => 'array',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically create SNS posts when episode status changes to 'active' or 'completed'
        static::updated(function ($episode) {
            if ($episode->isDirty('status') && in_array($episode->status, ['active', 'completed'])) {
                // Auto-generate SNS posts
                $snsService = app(SnsService::class);
                $snsService->createPostsForEpisode($episode, true);
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    public function snsPosts()
    {
        return $this->hasMany(SnsPost::class);
    }
}
