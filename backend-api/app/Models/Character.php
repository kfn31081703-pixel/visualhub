<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'reference_images',
        'style_preset',
        'appearance',
        'personality'
    ];

    protected $casts = [
        'reference_images' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
