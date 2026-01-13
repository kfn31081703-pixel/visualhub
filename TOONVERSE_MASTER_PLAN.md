# 🎬 TOONVERSE AI - 완전 자동화 웹툰 제작 및 글로벌 유통 플랫폼

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [데이터베이스 설계](#데이터베이스-설계)
4. [API 엔드포인트](#api-엔드포인트)
5. [AI 엔진 사양](#ai-엔진-사양)
6. [파이프라인 워크플로우](#파이프라인-워크플로우)
7. [개발 로드맵](#개발-로드맵)
8. [설치 및 실행](#설치-및-실행)

---

## 🎯 프로젝트 개요

### 서비스명
**TOONVERSE AI** - From Idea to Global Hit
*"키워드 입력만으로 웹툰 제작부터 글로벌 유통까지 완전 자동화"*

### 핵심 가치 제안
- 🤖 **AI 자동 제작**: 시나리오 → 콘티 → 작화 → 식자 → 패키징 완전 자동화
- 🌍 **글로벌 배포**: 다국어 번역 및 현지화 자동 지원
- 📱 **SNS 최적화**: 쇼츠/릴스 자동 생성 및 예약 발행
- 💰 **수익 추적**: 플랫폼별 조회수, 전환율, 수익 실시간 모니터링
- 🏭 **IP 공장화**: 1명의 운영자가 수천 개 채널 동시 관리

### 개발 단계
```
MVP (v0.1) → V1 (v1.0) → V2 (v2.0)
   ↓            ↓           ↓
 핵심기능    유통기능    수익화
```

#### 📦 MVP (v0.1) - 현재 개발 목표
**목표**: 키워드 → 웹툰 1화 자동 생성 시스템 구축

✅ **필수 기능**
- 프로젝트/에피소드 생성 API
- Text Engine (시나리오 자동 생성)
- Redis Queue 기반 작업 관리
- 상태 추적 및 에러 핸들링
- 기본 관리자 대시보드

📊 **성공 기준**
- API 호출 → 백그라운드 작업 → DB 저장 완료
- 평균 생성 시간 < 5분
- 실패율 < 5%

#### 🚀 V1 (v1.0) - 완전 자동화
**목표**: 제작부터 유통까지 End-to-End 자동화

✅ **추가 기능**
- Director Engine (콘티 자동 생성)
- Image Engine (캐릭터 일관성 유지 작화)
- Lettering Engine (말풍선/효과음 자동 식자)
- Packaging Engine (웹툰 패키징, 썸네일 생성)
- I18N Engine (다국어 번역/현지화)
- Video Engine (쇼츠 자동 생성)
- SNS Scheduler (최적 시간대 예약 발행)

📊 **성공 기준**
- 키워드 입력 → 완성 웹툰 + 20개 쇼츠 < 30분
- 캐릭터 일관성 > 85%
- 5개 언어 자동 번역

#### 💎 V2 (v2.0) - 수익화 및 IP 확장
**목표**: 상업적 성공 및 IP 다각화

✅ **추가 기능**
- 플랫폼 자동 업로드 (웹툰, 유튜브, 웹소설)
- 실시간 성과 분석 (조회수, 전환율, 수익)
- A/B 테스트 자동화 (썸네일, 제목, 해시태그)
- IP 확장 도구 (애니메이션, 굿즈, 게임)
- 저작권 관리 시스템
- AI 학습 데이터 피드백 루프

📊 **성공 기준**
- 월 1,000개 이상 콘텐츠 생산
- 평균 ROI > 300%
- 10개 이상 플랫폼 동시 운영

---

## 🏗️ 시스템 아키텍처

### 전체 구조
```
┌─────────────────────────────────────────────────────────────┐
│                      TOONVERSE AI Platform                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │────│  Backend API │────│   Database   │  │
│  │   (Admin)    │    │   (Laravel)  │    │   (MySQL)    │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                              │                               │
│                     ┌────────▼────────┐                      │
│                     │  Orchestrator   │                      │
│                     │  (Queue Worker) │                      │
│                     └────────┬────────┘                      │
│                              │                               │
│         ┌────────────────────┼────────────────────┐         │
│         │                    │                    │         │
│    ┌────▼─────┐         ┌───▼────┐         ┌────▼─────┐   │
│    │   Text   │         │Director│         │  Image   │   │
│    │  Engine  │         │ Engine │         │  Engine  │   │
│    └──────────┘         └────────┘         └──────────┘   │
│                                                               │
│    ┌──────────┐         ┌────────┐         ┌──────────┐   │
│    │Lettering │         │  Pack  │         │  Video   │   │
│    │  Engine  │         │ Engine │         │  Engine  │   │
│    └──────────┘         └────────┘         └──────────┘   │
│                                                               │
│    ┌──────────┐         ┌────────┐         ┌──────────┐   │
│    │   I18N   │         │  SNS   │         │Analytics │   │
│    │  Engine  │         │Connector         │Collector │   │
│    └──────────┘         └────────┘         └──────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
├─────────────────────────────────────────────────────────────┤
│  Redis Cache │ Storage (S3) │ CDN │ AI APIs │ SNS APIs     │
└─────────────────────────────────────────────────────────────┘
```

### 디렉토리 구조
```
/var/www/toonverse/
├── webapp/                          # 현재 작업 디렉토리
│   ├── backend-api/                 # Laravel REST API
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/     # API 컨트롤러
│   │   │   │   └── Middleware/
│   │   │   ├── Models/              # Eloquent 모델
│   │   │   │   ├── Project.php
│   │   │   │   ├── Episode.php
│   │   │   │   ├── Job.php
│   │   │   │   ├── Asset.php
│   │   │   │   └── Character.php
│   │   │   └── Jobs/                # Queue 작업
│   │   │       ├── RunTextScriptJob.php
│   │   │       ├── RunDirectorJob.php
│   │   │       └── RunImageRenderJob.php
│   │   ├── database/
│   │   │   └── migrations/          # 데이터베이스 마이그레이션
│   │   ├── routes/
│   │   │   └── api.php              # API 라우트
│   │   ├── config/
│   │   │   ├── queue.php
│   │   │   └── database.php
│   │   ├── .env                     # 환경변수
│   │   └── composer.json
│   │
│   ├── ai-engines/                  # Python FastAPI 엔진
│   │   ├── common/                  # 공통 모듈
│   │   │   ├── __init__.py
│   │   │   ├── schemas.py           # Pydantic 스키마
│   │   │   └── utils.py
│   │   │
│   │   ├── text_engine/             # [MVP] 시나리오 생성
│   │   │   ├── main.py
│   │   │   ├── engine.py
│   │   │   └── requirements.txt
│   │   │
│   │   ├── director_engine/         # [V1] 콘티 생성
│   │   │   ├── main.py
│   │   │   └── engine.py
│   │   │
│   │   ├── image_engine/            # [V1] 이미지 생성
│   │   │   ├── main.py
│   │   │   ├── engine.py
│   │   │   └── character_manager.py
│   │   │
│   │   ├── lettering_engine/        # [V1] 식자 처리
│   │   │   ├── main.py
│   │   │   ├── engine.py
│   │   │   └── fonts/
│   │   │
│   │   ├── packaging_engine/        # [V1] 패키징
│   │   │   ├── main.py
│   │   │   └── engine.py
│   │   │
│   │   ├── video_engine/            # [V1] 쇼츠 생성
│   │   │   ├── main.py
│   │   │   ├── engine.py
│   │   │   └── templates/
│   │   │
│   │   └── i18n_engine/             # [V1] 번역/현지화
│   │       ├── main.py
│   │       └── engine.py
│   │
│   ├── storage/                     # 생성된 파일 저장소
│   │   └── projects/
│   │       └── {project_id}/
│   │           └── episodes/
│   │               └── {episode_id}/
│   │                   ├── script.txt
│   │                   ├── storyboard.json
│   │                   ├── cuts/
│   │                   │   ├── cut_001.png
│   │                   │   └── cut_002.png
│   │                   ├── webtoon/
│   │                   │   ├── final.png
│   │                   │   └── thumbnail.jpg
│   │                   └── shorts/
│   │                       ├── short_01.mp4
│   │                       └── short_02.mp4
│   │
│   ├── supervisor/                  # Supervisor 설정
│   │   └── toonverse.conf
│   │
│   └── docs/                        # 문서
│       ├── API_SPEC.md
│       ├── ENGINE_SPEC.md
│       └── DEPLOYMENT.md
```

---

## 💾 데이터베이스 설계

### ERD 다이어그램
```
┌─────────────────┐         ┌─────────────────┐
│    projects     │1      N │    episodes     │
├─────────────────┤◄────────┤─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ title           │         │ project_id (FK) │
│ genre           │         │ episode_number  │
│ target_country  │         │ title           │
│ tone            │         │ script_text     │
│ target_audience │         │ storyboard_json │
│ keywords        │         │ status          │
│ created_at      │         │ created_at      │
│ updated_at      │         │ updated_at      │
└─────────────────┘         └─────────────────┘
                                     │
                                     │1
                                     │
                                     │N
┌─────────────────┐         ┌─────────────────┐
│   characters    │         │      jobs       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ project_id (FK) │         │ episode_id (FK) │
│ name            │         │ type            │
│ description     │         │ status          │
│ reference_images│         │ input_json      │
│ style_preset    │         │ output_json     │
│ created_at      │         │ error_message   │
│ updated_at      │         │ cost_units      │
└─────────────────┘         │ retry_count     │
                            │ started_at      │
                            │ completed_at    │
                            │ created_at      │
                            └─────────────────┘
                                     │
                                     │1
                                     │
                                     │N
                            ┌─────────────────┐
                            │     assets      │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ episode_id (FK) │
                            │ type            │
                            │ path            │
                            │ file_size       │
                            │ meta_json       │
                            │ created_at      │
                            └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   channels      │1      N │ publish_tasks   │
├─────────────────┤◄────────┤─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ platform        │         │ episode_id (FK) │
│ channel_name    │         │ channel_id (FK) │
│ country         │         │ asset_id (FK)   │
│ language        │         │ scheduled_at    │
│ api_token       │         │ published_at    │
│ status          │         │ status          │
│ created_at      │         │ post_url        │
│ updated_at      │         │ error_message   │
└─────────────────┘         │ created_at      │
                            └─────────────────┘

┌─────────────────┐
│    metrics      │
├─────────────────┤
│ id (PK)         │
│ episode_id (FK) │
│ channel_id (FK) │
│ metric_type     │
│ value           │
│ collected_at    │
│ created_at      │
└─────────────────┘
```

### 테이블 상세 설계

#### 1. projects (작품)
```sql
CREATE TABLE projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '작품 제목',
    genre VARCHAR(100) NOT NULL COMMENT '장르 (action, romance, fantasy, etc.)',
    target_country VARCHAR(10) DEFAULT 'KR' COMMENT '타겟 국가 코드',
    tone VARCHAR(50) DEFAULT 'serious' COMMENT '톤 (serious, comedy, dark, etc.)',
    target_audience VARCHAR(50) DEFAULT 'teen' COMMENT '타겟 독자층',
    keywords TEXT COMMENT '키워드 (JSON 배열)',
    world_setting TEXT COMMENT '세계관 설정',
    status VARCHAR(50) DEFAULT 'active' COMMENT '상태',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_genre (genre),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. episodes (에피소드)
```sql
CREATE TABLE episodes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    episode_number INT NOT NULL COMMENT '회차 번호',
    title VARCHAR(255) COMMENT '에피소드 제목',
    script_text LONGTEXT COMMENT '시나리오 전문',
    storyboard_json JSON COMMENT '콘티 데이터 (컷 정보)',
    status VARCHAR(50) DEFAULT 'draft' COMMENT 'draft, queued, running, done, failed',
    generation_metadata JSON COMMENT '생성 메타데이터',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY uk_project_episode (project_id, episode_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. jobs (작업 큐)
```sql
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    episode_id BIGINT UNSIGNED COMMENT '연관 에피소드 (nullable)',
    type VARCHAR(100) NOT NULL COMMENT 'text.script, director.storyboard, image.render, etc.',
    status VARCHAR(50) DEFAULT 'queued' COMMENT 'queued, running, done, failed',
    input_json JSON COMMENT '입력 데이터',
    output_json JSON COMMENT '출력 결과',
    error_message TEXT COMMENT '에러 메시지',
    cost_units DECIMAL(10,2) DEFAULT 0.00 COMMENT '비용 단위',
    retry_count INT DEFAULT 0 COMMENT '재시도 횟수',
    started_at TIMESTAMP NULL COMMENT '시작 시간',
    completed_at TIMESTAMP NULL COMMENT '완료 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 4. assets (결과물 파일)
```sql
CREATE TABLE assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    episode_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'cut, webtoon, thumbnail, short, audio',
    path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT COMMENT '파일 크기 (bytes)',
    meta_json JSON COMMENT '메타데이터',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_episode_type (episode_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 5. characters (캐릭터)
```sql
CREATE TABLE characters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL COMMENT '캐릭터 이름',
    description TEXT COMMENT '캐릭터 설명',
    reference_images JSON COMMENT '참조 이미지 경로 배열',
    style_preset VARCHAR(100) COMMENT '스타일 프리셋',
    appearance TEXT COMMENT '외형 상세 설명',
    personality TEXT COMMENT '성격 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 6. prompts (프롬프트 버전 관리)
```sql
CREATE TABLE prompts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    engine_type VARCHAR(100) NOT NULL COMMENT 'text, director, image, etc.',
    version VARCHAR(50) NOT NULL COMMENT '버전',
    prompt_template TEXT NOT NULL COMMENT '프롬프트 템플릿',
    parameters JSON COMMENT '파라미터 설정',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_engine_version (engine_type, version),
    INDEX idx_engine_active (engine_type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 7. channels (운영 채널)
```sql
CREATE TABLE channels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50) NOT NULL COMMENT 'tiktok, instagram, youtube, twitter, webtoon',
    channel_name VARCHAR(255) NOT NULL,
    country VARCHAR(10) COMMENT '타겟 국가',
    language VARCHAR(10) COMMENT '언어',
    api_token TEXT COMMENT 'API 인증 토큰 (암호화)',
    api_config JSON COMMENT 'API 설정',
    status VARCHAR(50) DEFAULT 'active' COMMENT 'active, inactive, error',
    last_published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_platform_channel (platform, channel_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 8. publish_tasks (예약 발행)
```sql
CREATE TABLE publish_tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    episode_id BIGINT UNSIGNED NOT NULL,
    channel_id BIGINT UNSIGNED NOT NULL,
    asset_id BIGINT UNSIGNED NOT NULL COMMENT '발행할 에셋',
    scheduled_at TIMESTAMP NOT NULL COMMENT '예약 시간',
    published_at TIMESTAMP NULL COMMENT '실제 발행 시간',
    status VARCHAR(50) DEFAULT 'scheduled' COMMENT 'scheduled, publishing, published, failed',
    post_url VARCHAR(500) COMMENT '발행된 URL',
    error_message TEXT,
    metadata JSON COMMENT '발행 메타데이터 (해시태그, 제목 등)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 9. metrics (성과 지표)
```sql
CREATE TABLE metrics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    episode_id BIGINT UNSIGNED,
    channel_id BIGINT UNSIGNED,
    metric_type VARCHAR(50) NOT NULL COMMENT 'views, likes, comments, shares, revenue',
    value DECIMAL(15,2) NOT NULL,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    INDEX idx_metric_type (metric_type),
    INDEX idx_collected_at (collected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔌 API 엔드포인트

### 기본 정보
- **Base URL**: `http://localhost:8000/api`
- **인증**: Bearer Token (추후 구현)
- **응답 형식**: JSON

### 1. 프로젝트 관리

#### 프로젝트 생성
```http
POST /api/projects
Content-Type: application/json

{
  "title": "무한 레벨업",
  "genre": "action",
  "target_country": "KR",
  "tone": "serious",
  "target_audience": "teen",
  "keywords": ["레벨업", "헌터", "던전", "회귀"],
  "world_setting": "현대 한국, 던전과 헌터가 존재하는 세계"
}

Response 201:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "무한 레벨업",
    "genre": "action",
    "status": "active",
    "created_at": "2026-01-13T00:00:00Z"
  }
}
```

#### 프로젝트 목록
```http
GET /api/projects?page=1&limit=20

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "무한 레벨업",
      "genre": "action",
      "episode_count": 10,
      "status": "active"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 50
  }
}
```

#### 프로젝트 상세
```http
GET /api/projects/{id}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "무한 레벨업",
    "genre": "action",
    "keywords": ["레벨업", "헌터"],
    "episodes": [
      {
        "episode_number": 1,
        "title": "각성",
        "status": "done"
      }
    ],
    "characters": [
      {
        "id": 1,
        "name": "강진우",
        "description": "주인공"
      }
    ]
  }
}
```

### 2. 에피소드 관리

#### 에피소드 생성
```http
POST /api/projects/{project_id}/episodes
Content-Type: application/json

{
  "episode_number": 1,
  "title": "각성",
  "keywords": ["첫 던전", "위기", "각성"]
}

Response 201:
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "episode_number": 1,
    "title": "각성",
    "status": "draft",
    "created_at": "2026-01-13T00:00:00Z"
  }
}
```

#### 에피소드 생성 시작 (핵심 API)
```http
POST /api/episodes/{episode_id}/generate
Content-Type: application/json

{
  "pipeline": ["text.script", "director.storyboard", "image.render"],
  "options": {
    "cut_count": 30,
    "style": "realistic",
    "language": "ko"
  }
}

Response 202:
{
  "success": true,
  "message": "Generation started",
  "data": {
    "episode_id": 1,
    "jobs": [
      {
        "id": 1,
        "type": "text.script",
        "status": "queued"
      },
      {
        "id": 2,
        "type": "director.storyboard",
        "status": "pending"
      }
    ]
  }
}
```

#### 에피소드 상세
```http
GET /api/episodes/{id}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "episode_number": 1,
    "title": "각성",
    "status": "done",
    "script_text": "...",
    "storyboard": {
      "cuts": [...]
    },
    "assets": [
      {
        "type": "webtoon",
        "path": "/storage/projects/1/episodes/1/webtoon/final.png"
      }
    ]
  }
}
```

### 3. 작업 관리

#### 작업 상태 조회
```http
GET /api/jobs/{id}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "episode_id": 1,
    "type": "text.script",
    "status": "done",
    "input_json": {...},
    "output_json": {
      "script_text": "...",
      "word_count": 1500
    },
    "cost_units": 0.50,
    "started_at": "2026-01-13T00:00:00Z",
    "completed_at": "2026-01-13T00:02:30Z"
  }
}
```

#### 작업 목록
```http
GET /api/jobs?episode_id=1&status=done

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "text.script",
      "status": "done",
      "cost_units": 0.50
    }
  ]
}
```

### 4. 캐릭터 관리

#### 캐릭터 생성
```http
POST /api/projects/{project_id}/characters
Content-Type: application/json

{
  "name": "강진우",
  "description": "주인공, 25세 남성 헌터",
  "appearance": "검은 머리, 날카로운 눈빛, 평범한 체격",
  "personality": "냉철하고 계산적, 하지만 동료를 소중히 여김",
  "style_preset": "realistic_kr"
}

Response 201:
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "name": "강진우",
    "reference_images": []
  }
}
```

### 5. 대시보드

#### 대시보드 통계
```http
GET /api/dashboard/stats?date=2026-01-13

Response 200:
{
  "success": true,
  "data": {
    "today": {
      "episodes_created": 15,
      "jobs_completed": 120,
      "success_rate": 96.5,
      "avg_cost": 2.50
    },
    "by_status": {
      "queued": 5,
      "running": 3,
      "done": 112,
      "failed": 2
    },
    "by_type": {
      "text.script": 15,
      "director.storyboard": 15,
      "image.render": 90
    }
  }
}
```

---

## 🤖 AI 엔진 사양

### 공통 인터페이스

모든 AI 엔진은 표준 요청/응답 형식을 따릅니다.

#### 요청 형식
```json
{
  "project": {
    "id": 1,
    "title": "무한 레벨업",
    "genre": "action",
    "tone": "serious",
    "world_setting": "..."
  },
  "episode": {
    "id": 1,
    "episode_number": 1,
    "title": "각성"
  },
  "inputs": {
    // 엔진별 특화 입력
  },
  "options": {
    // 엔진별 옵션
  }
}
```

#### 응답 형식
```json
{
  "success": true,
  "result": {
    // 엔진별 결과
  },
  "metadata": {
    "engine_version": "1.0.0",
    "cost_units": 0.50,
    "processing_time": 2.5,
    "model": "gpt-4",
    "warnings": []
  }
}
```

### 1. Text Engine (시나리오 생성)

**엔드포인트**: `POST http://localhost:8001/engine/text/script`

#### 기능
- 키워드 기반 시나리오 자동 생성
- 세계관/캐릭터/플롯 반영
- 클리프행어 자동 삽입
- 회차별 일관성 유지

#### 입력
```json
{
  "inputs": {
    "keywords": ["첫 던전", "위기", "각성"],
    "previous_episodes": [
      {
        "episode_number": 0,
        "summary": "프롤로그 요약"
      }
    ],
    "target_word_count": 2000
  },
  "options": {
    "language": "ko",
    "include_clifhanger": true,
    "tone": "serious"
  }
}
```

#### 출력
```json
{
  "result": {
    "script_text": "# 1화: 각성\n\n[씬 1 - 던전 입구]\n진우는 처음으로 던전 앞에 섰다...",
    "scenes": [
      {
        "scene_number": 1,
        "location": "던전 입구",
        "description": "진우가 던전 앞에 서 있다",
        "dialogue_count": 5
      }
    ],
    "word_count": 2050,
    "estimated_panels": 25
  }
}
```

### 2. Director Engine (콘티 생성)

**엔드포인트**: `POST http://localhost:8002/engine/director/storyboard`

#### 기능
- 시나리오를 컷 단위로 분할
- 구도/카메라 앵글 자동 배치
- 감정 흐름 분석 및 연출
- 대사 길이 기반 말풍선 힌트

#### 입력
```json
{
  "inputs": {
    "script_text": "...",
    "target_cut_count": 30,
    "aspect_ratio": "vertical",
    "platform": "webtoon"
  }
}
```

#### 출력
```json
{
  "result": {
    "cuts": [
      {
        "cut_number": 1,
        "scene": "던전 입구",
        "characters": ["강진우"],
        "background": "어두운 던전 입구, 안개가 자욱함",
        "camera": {
          "angle": "low_angle",
          "shot": "full_shot",
          "movement": "static"
        },
        "emotion": "tension",
        "dialogue": {
          "speaker": "강진우",
          "text": "드디어... 첫 던전이다.",
          "balloon_type": "thought",
          "estimated_size": "medium"
        },
        "sfx": ["바람 소리", "발소리"],
        "duration_estimate": 3.0
      }
    ],
    "total_cuts": 30,
    "estimated_scroll_length": 15000
  }
}
```

### 3. Image Engine (이미지 생성)

**엔드포인트**: `POST http://localhost:8003/engine/image/render`

#### 기능
- 캐릭터 일관성 유지 작화
- 배경 자동 생성
- 스타일 프리셋 적용
- 컷별 이미지 렌더링

#### 입력
```json
{
  "inputs": {
    "cuts": [
      {
        "cut_number": 1,
        "characters": [
          {
            "character_id": 1,
            "pose": "standing",
            "expression": "serious",
            "position": "center"
          }
        ],
        "background": "던전 입구",
        "lighting": "dark",
        "atmosphere": "tense"
      }
    ],
    "style": "realistic",
    "resolution": "1080x1920"
  }
}
```

#### 출력
```json
{
  "result": {
    "renders": [
      {
        "cut_number": 1,
        "image_path": "/storage/projects/1/episodes/1/cuts/cut_001.png",
        "character_consistency_score": 0.92,
        "file_size": 2048000,
        "generation_params": {
          "model": "stable-diffusion-xl",
          "seed": 42,
          "steps": 50
        }
      }
    ]
  }
}
```

### 4. Lettering Engine (식자)

**엔드포인트**: `POST http://localhost:8004/engine/lettering/apply`

#### 기능
- 말풍선 자동 배치 및 크기 조정
- 효과음 텍스트 디자인
- 장르별 폰트 스타일 자동 적용
- 가독성 최적화

#### 입력
```json
{
  "inputs": {
    "image_path": "/storage/.../cut_001.png",
    "dialogue": {
      "text": "드디어... 첫 던전이다.",
      "balloon_type": "thought",
      "position": "top_right"
    },
    "sfx": [
      {
        "text": "쿵쿵",
        "position": "center",
        "style": "impact"
      }
    ]
  },
  "options": {
    "font_family": "NanumGothic",
    "language": "ko"
  }
}
```

#### 출력
```json
{
  "result": {
    "lettered_image_path": "/storage/.../cut_001_lettered.png",
    "balloons": [
      {
        "type": "thought",
        "position": {"x": 850, "y": 200},
        "size": {"width": 300, "height": 100}
      }
    ],
    "sfx_elements": [
      {
        "text": "쿵쿵",
        "position": {"x": 540, "y": 960},
        "font_size": 72
      }
    ]
  }
}
```

### 5. Packaging Engine (패키징)

**엔드포인트**: `POST http://localhost:8005/engine/packaging/webtoon`

#### 기능
- 세로 스크롤 웹툰 합성
- 플랫폼별 규격 분할
- 썸네일 자동 생성
- 메타데이터 임베딩

#### 입력
```json
{
  "inputs": {
    "cut_images": [
      "/storage/.../cut_001_lettered.png",
      "/storage/.../cut_002_lettered.png"
    ],
    "platform": "naver_webtoon",
    "spacing": 50
  }
}
```

#### 출력
```json
{
  "result": {
    "webtoon_path": "/storage/.../final.png",
    "thumbnail_path": "/storage/.../thumbnail.jpg",
    "dimensions": {
      "width": 800,
      "height": 15000
    },
    "file_size": 5242880,
    "segments": [
      {
        "segment_number": 1,
        "path": "/storage/.../segment_01.png",
        "height": 7500
      }
    ]
  }
}
```

### 6. Video Engine (쇼츠 생성)

**엔드포인트**: `POST http://localhost:8006/engine/video/shorts`

#### 기능
- 9:16 세로 영상 자동 제작
- 컷 애니메이션 효과
- 자막 자동 배치
- TTS 음성 합성
- BGM 자동 선택

#### 입력
```json
{
  "inputs": {
    "cuts": [
      {
        "image_path": "/storage/.../cut_001.png",
        "duration": 3.0,
        "dialogue": "드디어... 첫 던전이다.",
        "animation": "zoom_in"
      }
    ],
    "template": "dramatic",
    "voice": {
      "language": "ko",
      "gender": "male",
      "age": "young"
    }
  }
}
```

#### 출력
```json
{
  "result": {
    "video_path": "/storage/.../short_01.mp4",
    "duration": 30.0,
    "resolution": "1080x1920",
    "file_size": 15728640,
    "audio_tracks": [
      {
        "type": "voice",
        "path": "/storage/.../voice.mp3"
      },
      {
        "type": "bgm",
        "path": "/storage/.../bgm.mp3"
      }
    ]
  }
}
```

### 7. I18N Engine (번역/현지화)

**엔드포인트**: `POST http://localhost:8007/engine/i18n/localize`

#### 기능
- 다국어 번역
- 문화적 맥락 적응
- 말투/호칭 현지화
- 국가별 검열 레벨 적용

#### 입력
```json
{
  "inputs": {
    "source_text": "형! 조심해!",
    "source_language": "ko",
    "target_language": "en",
    "context": {
      "relationship": "friends",
      "formality": "casual"
    }
  },
  "options": {
    "censorship_level": 0,
    "preserve_sfx": true
  }
}
```

#### 출력
```json
{
  "result": {
    "translated_text": "Bro! Watch out!",
    "alternatives": [
      "Hey! Be careful!",
      "Dude! Look out!"
    ],
    "cultural_notes": [
      "형(hyung) translated to 'Bro' for casual friend context"
    ]
  }
}
```

---

## ⚙️ 파이프라인 워크플로우

### MVP 파이프라인
```
[키워드 입력]
     ↓
[프로젝트 생성] → [에피소드 생성]
     ↓
[Generate API 호출]
     ↓
[Job 생성: text.script]
     ↓
[Redis Queue 등록]
     ↓
[Worker 처리]
     ↓
[Text Engine 호출]
     ↓
[결과 저장: episodes.script_text]
     ↓
[Job 완료 처리]
     ↓
[완료 알림]
```

### V1 전체 파이프라인
```
[Generate API 호출]
     ↓
┌────────────────────────────────────┐
│   Pipeline Orchestrator            │
├────────────────────────────────────┤
│                                    │
│  ① text.script (MVP)              │
│     ↓ output: script_text          │
│                                    │
│  ② director.storyboard             │
│     ↓ output: cuts[] JSON          │
│                                    │
│  ③ image.render (병렬)            │
│     ├─ cut_001.png                 │
│     ├─ cut_002.png                 │
│     └─ cut_N.png                   │
│     ↓                              │
│                                    │
│  ④ lettering.apply (병렬)         │
│     ├─ cut_001_lettered.png        │
│     ├─ cut_002_lettered.png        │
│     └─ cut_N_lettered.png          │
│     ↓                              │
│                                    │
│  ⑤ pack.webtoon                    │
│     ↓ output: final.png            │
│                                    │
│  ⑥ pack.thumbnail                  │
│     ↓ output: thumbnail.jpg        │
│                                    │
│  ⑦ text.meta                       │
│     ↓ output: tags, description    │
│                                    │
│  ⑧ i18n.localize (언어별 병렬)    │
│     ├─ script_en.txt               │
│     ├─ script_ja.txt               │
│     └─ script_zh.txt               │
│     ↓                              │
│                                    │
│  ⑨ video.shorts (템플릿별 병렬)   │
│     ├─ short_01.mp4                │
│     ├─ short_02.mp4                │
│     └─ short_20.mp4                │
│     ↓                              │
│                                    │
│  ⑩ sns.schedule                    │
│     ↓ output: publish_tasks[]      │
│                                    │
└────────────────────────────────────┘
     ↓
[에피소드 상태: done]
     ↓
[자동 발행 대기]
```

### 재시도 로직
```python
# 의사코드
def process_job(job):
    try:
        # 작업 시작
        job.status = 'running'
        job.started_at = now()
        job.save()
        
        # 엔진 호출
        result = call_engine(job.type, job.input_json)
        
        # 결과 저장
        job.output_json = result
        job.status = 'done'
        job.completed_at = now()
        job.save()
        
    except Exception as e:
        # 재시도 로직
        job.retry_count += 1
        if job.retry_count < MAX_RETRIES:
            job.status = 'queued'  # 재시도 대기
        else:
            job.status = 'failed'
            job.error_message = str(e)
        job.save()
```

### 부분 재개 로직
```python
# 의사코드
def resume_pipeline(episode_id):
    # 완료된 작업 확인
    completed_jobs = Job.where(episode_id=episode_id, status='done').get()
    completed_types = [job.type for job in completed_jobs]
    
    # 전체 파이프라인
    full_pipeline = [
        'text.script',
        'director.storyboard',
        'image.render',
        'lettering.apply',
        'pack.webtoon'
    ]
    
    # 미완료 작업만 실행
    remaining_pipeline = [
        job_type for job_type in full_pipeline 
        if job_type not in completed_types
    ]
    
    # 큐에 등록
    for job_type in remaining_pipeline:
        create_job(episode_id, job_type)
```

---

## 📅 개발 로드맵

### Phase 1: MVP 개발 (Week 1-2) ✅ 현재 단계

#### Week 1: 기반 구축
- [x] 개발 환경 설정 (PHP, MySQL, Redis, Python)
- [x] 프로그램 설치 (FFmpeg, ImageMagick, Supervisor)
- [ ] Laravel 프로젝트 생성
- [ ] 데이터베이스 마이그레이션
- [ ] 기본 API 구조 설계

#### Week 2: MVP 기능 구현
- [ ] Text Engine 구현 (더미 → LLM 연동)
- [ ] Queue Worker 구현
- [ ] API 엔드포인트 구현
- [ ] 테스트 및 디버깅
- [ ] MVP 배포 및 검증

### Phase 2: V1 개발 (Week 3-6)

#### Week 3: 콘티 및 이미지 생성
- [ ] Director Engine 구현
- [ ] Image Engine 구현
- [ ] 캐릭터 일관성 시스템
- [ ] 병렬 처리 최적화

#### Week 4: 후처리 및 패키징
- [ ] Lettering Engine 구현
- [ ] Packaging Engine 구현
- [ ] 품질 검증 시스템
- [ ] 파일 관리 최적화

#### Week 5: 다국어 및 쇼츠
- [ ] I18N Engine 구현
- [ ] Video Engine 구현
- [ ] 템플릿 시스템 구축
- [ ] TTS/BGM 통합

#### Week 6: SNS 유통
- [ ] SNS 커넥터 구현
- [ ] 예약 발행 시스템
- [ ] 해시태그 최적화
- [ ] 성과 추적 기초

### Phase 3: V2 개발 (Week 7-10)

#### Week 7-8: 플랫폼 통합
- [ ] 웹툰 플랫폼 API 연동
- [ ] 유튜브 API 연동
- [ ] 자동 업로드 시스템
- [ ] 인증/권한 관리

#### Week 9: 분석 및 최적화
- [ ] 실시간 성과 대시보드
- [ ] A/B 테스트 시스템
- [ ] 비용 최적화 도구
- [ ] 알림 시스템

#### Week 10: IP 확장 및 마무리
- [ ] IP 확장 도구 프로토타입
- [ ] 저작권 관리 시스템
- [ ] 최종 테스트 및 버그 수정
- [ ] 문서화 및 배포

---

## 🚀 설치 및 실행

### 1. 시스템 요구사항

#### 필수 프로그램 ✅
```bash
- PHP 8.1+ ✅
- Composer ✅
- MySQL 8.0+ ✅
- Redis 6.0+ ✅
- Python 3.10+ ✅
- pip3 ✅
- Git ✅
- Nginx/Apache ✅
```

#### 추가 프로그램 ✅
```bash
- FFmpeg 4.4+ ✅
- ImageMagick 6.9+ ✅
- Supervisor 4.2+ ✅
```

### 2. 프로젝트 생성

#### Step 1: Laravel 프로젝트 생성
```bash
cd /var/www/toonverse/webapp
composer create-project laravel/laravel backend-api
cd backend-api
```

#### Step 2: 환경변수 설정
```bash
cp .env.example .env
nano .env

# 다음 내용 수정:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=toonverse
DB_USERNAME=root
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

QUEUE_CONNECTION=redis

AI_TEXT_ENGINE_URL=http://localhost:8001
AI_DIRECTOR_ENGINE_URL=http://localhost:8002
AI_IMAGE_ENGINE_URL=http://localhost:8003
```

#### Step 3: 데이터베이스 생성
```bash
mysql -u root -p
CREATE DATABASE toonverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### Step 4: 마이그레이션 실행
```bash
php artisan migrate
```

### 3. AI 엔진 설치

#### Step 1: Text Engine 생성
```bash
cd /var/www/toonverse/webapp
mkdir -p ai-engines/text_engine
cd ai-engines/text_engine
```

#### Step 2: requirements.txt 생성
```bash
cat > requirements.txt << EOF
fastapi==0.128.0
uvicorn==0.40.0
pydantic==2.12.5
requests==2.31.0
EOF
```

#### Step 3: 패키지 설치
```bash
pip3 install -r requirements.txt
```

### 4. Supervisor 설정

#### Supervisor 설정 파일 생성
```bash
cat > /etc/supervisor/conf.d/toonverse.conf << EOF
[program:toonverse-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/toonverse/webapp/backend-api/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/toonverse/webapp/storage/logs/worker.log

[program:toonverse-text-engine]
command=uvicorn main:app --host 0.0.0.0 --port 8001
directory=/var/www/toonverse/webapp/ai-engines/text_engine
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/toonverse/webapp/storage/logs/text-engine.log
EOF

# Supervisor 재시작
supervisorctl reread
supervisorctl update
supervisorctl start all
```

### 5. 실행 및 테스트

#### 터미널 1: Laravel API 실행
```bash
cd /var/www/toonverse/webapp/backend-api
php artisan serve --host=0.0.0.0 --port=8000
```

#### 터미널 2: Queue Worker 실행 (Supervisor 사용 시 불필요)
```bash
cd /var/www/toonverse/webapp/backend-api
php artisan queue:work redis --verbose
```

#### 터미널 3: Text Engine 실행 (Supervisor 사용 시 불필요)
```bash
cd /var/www/toonverse/webapp/ai-engines/text_engine
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### 테스트 시나리오
```bash
# 1. 프로젝트 생성
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "무한 레벨업",
    "genre": "action",
    "keywords": ["레벨업", "헌터", "던전"]
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
  -d '{}'

# 4. 작업 상태 확인 (5초 후)
curl http://localhost:8000/api/jobs/1

# 5. 에피소드 조회 (완료 후)
curl http://localhost:8000/api/episodes/1
```

### 6. 문제 해결

#### 일반적인 오류

**1. Redis 연결 오류**
```bash
# Redis 상태 확인
redis-cli ping

# Redis 시작
sudo systemctl start redis
```

**2. 권한 오류**
```bash
# Laravel 권한 설정
cd /var/www/toonverse/webapp/backend-api
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

**3. MySQL 연결 오류**
```bash
# MySQL 상태 확인
sudo systemctl status mysql

# 데이터베이스 권한 확인
mysql -u root -p
GRANT ALL PRIVILEGES ON toonverse.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

**4. Supervisor 오류**
```bash
# Supervisor 로그 확인
sudo supervisorctl tail -f toonverse-queue stdout
sudo supervisorctl tail -f toonverse-text-engine stdout

# Supervisor 재시작
sudo supervisorctl restart all
```

---

## 📚 추가 문서

### 개발자 문서
- [API 상세 명세](./docs/API_SPEC.md)
- [AI 엔진 상세 사양](./docs/ENGINE_SPEC.md)
- [배포 가이드](./docs/DEPLOYMENT.md)
- [기여 가이드](./docs/CONTRIBUTING.md)

### 운영 문서
- [모니터링 가이드](./docs/MONITORING.md)
- [백업 및 복구](./docs/BACKUP.md)
- [성능 최적화](./docs/OPTIMIZATION.md)
- [보안 가이드](./docs/SECURITY.md)

---

## 📝 변경 이력

### v0.1.0 (2026-01-13) - MVP 기획
- ✅ 기획안 작성 완료
- ✅ 데이터베이스 설계 완료
- ✅ API 엔드포인트 정의 완료
- ✅ AI 엔진 사양 정의 완료
- ✅ 개발 환경 구축 완료
- 🔄 Laravel 프로젝트 생성 준비

---

## 🤝 기여자

- **Project Lead**: TOONVERSE Team
- **Architecture**: AI-Powered Design
- **Development**: In Progress

---

## 📄 라이센스

이 프로젝트는 비공개 소유권을 가집니다.

---

## 📞 연락처

문의사항이 있으시면 프로젝트 관리자에게 연락해주세요.

---

**TOONVERSE AI** - 아이디어에서 글로벌 히트작까지, 완전 자동화의 미래 🚀
