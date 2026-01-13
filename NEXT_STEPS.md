# TOONVERSE AI - 다음 단계 가이드

## ✅ 완료된 작업

### 1. 개발 환경 설정
- ✅ PHP 8.1+ 설치 확인
- ✅ Composer 설치 확인
- ✅ MySQL 8.0+ 설치 확인
- ✅ Redis 6.0+ 설치 및 실행 확인
- ✅ Python 3.10+ 설치 확인
- ✅ FFmpeg 설치
- ✅ ImageMagick 설치
- ✅ Supervisor 설치
- ✅ FastAPI 및 필수 Python 패키지 설치

### 2. Laravel 프로젝트 설정
- ✅ Laravel 10.x 프로젝트 생성 (`/var/www/toonverse/webapp/backend-api`)
- ✅ `.env` 파일 설정 (DB, Redis, AI Engine URLs)
- ✅ 데이터베이스 마이그레이션 13개 완료:
  - projects
  - episodes
  - jobs
  - assets
  - characters
  - prompts
  - channels
  - publish_tasks
  - metrics
  - (+ Laravel 기본 테이블 4개)

### 3. Laravel 구조 생성
- ✅ 모델 9개 생성:
  - Project, Episode, Job, Asset, Character
  - Prompt, Channel, PublishTask, Metric
- ✅ API 컨트롤러 4개 생성:
  - ProjectController
  - EpisodeController
  - JobController
  - DashboardController
- ✅ Queue Job 1개 생성:
  - RunTextScriptJob

---

## 🚧 진행해야 할 작업

### Phase 1: MVP 핵심 기능 구현 (1-2일)

#### 1.1 Laravel 모델 관계 설정
각 모델 파일에 Eloquent 관계를 정의해야 합니다.

**파일 경로**: `/var/www/toonverse/webapp/backend-api/app/Models/`

**Project.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'genre',
        'target_country',
        'tone',
        'target_audience',
        'keywords',
        'world_setting',
        'status'
    ];

    protected $casts = [
        'keywords' => 'array',
    ];

    public function episodes()
    {
        return $this->hasMany(Episode::class);
    }

    public function characters()
    {
        return $this->hasMany(Character::class);
    }
}
```

**Episode.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
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
```

**Job.php**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
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
```

*나머지 모델도 유사하게 작성...*

#### 1.2 API 컨트롤러 구현
**파일 경로**: `/var/www/toonverse/webapp/backend-api/app/Http/Controllers/Api/`

**ProjectController.php** (핵심 메소드)
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // POST /api/projects
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

    // GET /api/projects
    public function index(Request $request)
    {
        $projects = Project::with('episodes')
            ->paginate($request->get('limit', 20));

        return response()->json([
            'success' => true,
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'total' => $projects->total()
            ]
        ]);
    }

    // GET /api/projects/{id}
    public function show($id)
    {
        $project = Project::with(['episodes', 'characters'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }
}
```

**EpisodeController.php** (핵심 메소드)
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use App\Models\Project;
use App\Models\Job;
use App\Jobs\RunTextScriptJob;
use Illuminate\Http\Request;

class EpisodeController extends Controller
{
    // POST /api/projects/{project}/episodes
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

    // POST /api/episodes/{episode}/generate
    public function generate(Request $request, $episodeId)
    {
        $episode = Episode::findOrFail($episodeId);
        
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

    // GET /api/episodes/{id}
    public function show($id)
    {
        $episode = Episode::with(['project', 'jobs', 'assets'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $episode
        ]);
    }
}
```

**JobController.php**
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    // GET /api/jobs/{id}
    public function show($id)
    {
        $job = Job::with('episode')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }

    // GET /api/jobs
    public function index(Request $request)
    {
        $query = Job::query();

        if ($request->has('episode_id')) {
            $query->where('episode_id', $request->episode_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $jobs = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $jobs->items()
        ]);
    }
}
```

#### 1.3 API 라우트 설정
**파일 경로**: `/var/www/toonverse/webapp/backend-api/routes/api.php`

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\EpisodeController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\DashboardController;

// Projects
Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);

// Episodes
Route::post('/projects/{project}/episodes', [EpisodeController::class, 'store']);
Route::post('/episodes/{episode}/generate', [EpisodeController::class, 'generate']);
Route::get('/episodes/{id}', [EpisodeController::class, 'show']);

// Jobs
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{id}', [JobController::class, 'show']);

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
```

#### 1.4 Queue Job 구현
**파일 경로**: `/var/www/toonverse/webapp/backend-api/app/Jobs/RunTextScriptJob.php`

```php
<?php

namespace App\Jobs;

use App\Models\Job;
use App\Models\Episode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunTextScriptJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $job;

    public function __construct(Job $job)
    {
        $this->job = $job;
    }

    public function handle()
    {
        try {
            // Job 시작
            $this->job->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            // Episode 상태 업데이트
            $this->job->episode->update(['status' => 'running']);

            // AI Text Engine 호출
            $response = Http::timeout(120)->post(
                config('app.ai_text_engine_url', env('AI_TEXT_ENGINE_URL')) . '/engine/text/script',
                $this->job->input_json
            );

            if ($response->successful()) {
                $result = $response->json();

                // Episode에 결과 저장
                $this->job->episode->update([
                    'script_text' => $result['result']['script_text'] ?? '',
                    'status' => 'done',
                ]);

                // Job 완료 처리
                $this->job->update([
                    'status' => 'done',
                    'output_json' => $result['result'] ?? [],
                    'cost_units' => $result['metadata']['cost_units'] ?? 0,
                    'completed_at' => now(),
                ]);

                Log::info("Job {$this->job->id} completed successfully");
            } else {
                throw new \Exception("Engine returned error: " . $response->body());
            }

        } catch (\Exception $e) {
            // 에러 처리
            Log::error("Job {$this->job->id} failed: " . $e->getMessage());

            $this->job->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'retry_count' => $this->job->retry_count + 1,
            ]);

            $this->job->episode->update(['status' => 'failed']);

            // 재시도 (최대 3회)
            if ($this->job->retry_count < 3) {
                $this->release(60); // 60초 후 재시도
            }
        }
    }
}
```

#### 1.5 Text Engine 구현 (FastAPI)
**파일 경로**: `/var/www/toonverse/webapp/ai-engines/text_engine/`

**main.py**
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn
import time

app = FastAPI(title="TOONVERSE Text Engine", version="1.0.0")

class EngineRequest(BaseModel):
    project: Dict[str, Any]
    episode: Dict[str, Any]
    inputs: Optional[Dict[str, Any]] = {}
    options: Optional[Dict[str, Any]] = {}

class EngineResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/")
def root():
    return {
        "service": "TOONVERSE Text Engine",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/engine/text/script", response_model=EngineResponse)
def generate_script(request: EngineRequest):
    """
    시나리오 자동 생성
    MVP: 더미 데이터 반환
    V1: 실제 LLM API 연동
    """
    start_time = time.time()
    
    try:
        # 프로젝트 정보 추출
        project = request.project
        episode = request.episode
        keywords = request.inputs.get('keywords', [])
        
        # MVP: 더미 시나리오 생성
        # TODO: 실제 LLM (GPT-4, Claude 등) 연동
        script_text = generate_dummy_script(
            project.get('title', 'Unknown'),
            project.get('genre', 'Unknown'),
            episode.get('episode_number', 1),
            keywords
        )
        
        # 씬 분석 (간단한 파싱)
        scenes = parse_scenes(script_text)
        
        processing_time = time.time() - start_time
        
        return EngineResponse(
            success=True,
            result={
                "script_text": script_text,
                "scenes": scenes,
                "word_count": len(script_text.split()),
                "estimated_panels": len(scenes) * 3
            },
            metadata={
                "engine_version": "1.0.0-mvp",
                "cost_units": 0.50,
                "processing_time": round(processing_time, 2),
                "model": "dummy",
                "warnings": ["This is a dummy implementation for MVP"]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_dummy_script(title: str, genre: str, episode_number: int, keywords: List[str]) -> str:
    """더미 시나리오 생성 (MVP용)"""
    keyword_text = ", ".join(keywords) if keywords else "모험, 성장"
    
    script = f"""# {title} - {episode_number}화

## 씬 1 - 오프닝
주인공은 새로운 도전에 직면한다. 이번 회차의 키워드: {keyword_text}

대사:
- 주인공: "이제 시작이야..."

## 씬 2 - 전개
갈등이 고조되고, 주인공은 중요한 결정을 내려야 한다.

대사:
- 주인공: "내가 해낼 수 있을까?"
- 조력자: "넌 할 수 있어. 믿어!"

## 씬 3 - 클라이맥스
긴장감이 최고조에 달한다. 주인공의 선택이 운명을 결정한다.

대사:
- 주인공: "이제 끝이다!"

## 씬 4 - 결말
이번 회차가 마무리되지만, 다음 화에 대한 기대감을 남긴다.

대사:
- 주인공: "하지만 이건 시작에 불과해..."

[다음 화 예고: 더 큰 위기가 찾아온다!]
"""
    return script

def parse_scenes(script_text: str) -> List[Dict[str, Any]]:
    """시나리오를 씬 단위로 파싱"""
    scenes = []
    lines = script_text.split('\n')
    
    current_scene = None
    for line in lines:
        if line.startswith('## 씬'):
            if current_scene:
                scenes.append(current_scene)
            
            scene_parts = line.split(' - ')
            scene_number = len(scenes) + 1
            location = scene_parts[1] if len(scene_parts) > 1 else "Unknown"
            
            current_scene = {
                "scene_number": scene_number,
                "location": location,
                "description": "",
                "dialogue_count": 0
            }
        elif current_scene and line.strip().startswith('-'):
            current_scene['dialogue_count'] += 1
    
    if current_scene:
        scenes.append(current_scene)
    
    return scenes

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```

**requirements.txt**
```
fastapi==0.128.0
uvicorn==0.40.0
pydantic==2.12.5
```

---

### Phase 2: 실행 및 테스트

#### 2.1 Storage 디렉토리 권한 설정
```bash
cd /var/www/toonverse/webapp/backend-api
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

#### 2.2 Laravel 서버 실행 (터미널 1)
```bash
cd /var/www/toonverse/webapp/backend-api
php artisan serve --host=0.0.0.0 --port=8000
```

#### 2.3 Queue Worker 실행 (터미널 2)
```bash
cd /var/www/toonverse/webapp/backend-api
php artisan queue:work redis --verbose --tries=3
```

#### 2.4 Text Engine 실행 (터미널 3)
```bash
cd /var/www/toonverse/webapp/ai-engines/text_engine
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### 2.5 테스트 시나리오
```bash
# 1. 프로젝트 생성
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "무한 레벨업",
    "genre": "action",
    "target_country": "KR",
    "keywords": ["레벨업", "헌터", "던전", "회귀"]
  }'

# 2. 에피소드 생성
curl -X POST http://localhost:8000/api/projects/1/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "각성"
  }'

# 3. 생성 시작
curl -X POST http://localhost:8000/api/episodes/1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["첫 던전", "위기", "각성"]
  }'

# 4. Job 상태 확인 (5초 후)
sleep 5
curl http://localhost:8000/api/jobs/1

# 5. 에피소드 조회 (완료 후)
curl http://localhost:8000/api/episodes/1
```

---

## 📚 다음 개발 단계 (V1)

### 1. Director Engine (콘티 자동 생성)
- 시나리오를 컷 단위로 분할
- 카메라 앵글, 구도 자동 배치
- 감정 흐름 분석

### 2. Image Engine (캐릭터 일관 작화)
- Stable Diffusion / Midjourney API 연동
- 캐릭터 일관성 유지 시스템
- 배경 자동 생성

### 3. Lettering & Packaging
- 말풍선 자동 배치
- 세로 스크롤 웹툰 합성
- 썸네일 자동 생성

### 4. 다국어 유통
- I18N Engine (번역/현지화)
- Video Engine (쇼츠 생성)
- SNS 자동 업로드

---

## 🛠️ 운영 최적화

### Supervisor 설정
**파일**: `/etc/supervisor/conf.d/toonverse.conf`

```ini
[program:toonverse-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/toonverse/webapp/backend-api/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/toonverse/webapp/backend-api/storage/logs/worker.log

[program:toonverse-text-engine]
command=uvicorn main:app --host 0.0.0.0 --port 8001
directory=/var/www/toonverse/webapp/ai-engines/text_engine
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/toonverse/webapp/backend-api/storage/logs/text-engine.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
sudo supervisorctl status
```

---

## ✅ 성공 기준

### MVP 완료 조건
- [ ] API 호출로 프로젝트/에피소드 생성 가능
- [ ] Generate API 호출 시 백그라운드 작업 실행
- [ ] Text Engine이 시나리오 생성하여 DB에 저장
- [ ] Job 상태 추적 가능
- [ ] 평균 생성 시간 < 5분
- [ ] 실패율 < 5%

### V1 완료 조건
- [ ] 키워드 입력 → 완성 웹툰 1화 < 30분
- [ ] 캐릭터 일관성 > 85%
- [ ] 5개 언어 자동 번역
- [ ] 쇼츠 20종 자동 생성

---

## 📞 문의 및 지원

문제가 발생하면 다음을 확인하세요:

1. **Redis 실행 상태**: `redis-cli ping`
2. **MySQL 연결**: `mysql -u toonuser -p -D toonverse`
3. **Laravel 로그**: `tail -f storage/logs/laravel.log`
4. **Queue 로그**: `php artisan queue:failed`
5. **Supervisor 상태**: `supervisorctl status`

---

**TOONVERSE AI** - 완전 자동화 웹툰 제작 플랫폼 🚀
