<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $table = 'episode_jobs';

    protected $fillable = [
        'episode_id',
        'type',
        'status',
        'input_json',
        'output_json',
        'error_message',
        'cost_units',
        'retry_count',
        'started_at',
        'completed_at'
    ];

    protected $casts = [
        'input_json' => 'array',
        'output_json' => 'array',
        'cost_units' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function episode()
    {
        return $this->belongsTo(Episode::class);
    }
}
