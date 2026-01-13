<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
