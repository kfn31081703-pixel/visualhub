# 🎬 TOONVERSE AI

> **From Idea to Global Hit** - 키워드 입력만으로 웹툰 제작부터 글로벌 유통까지 완전 자동화

[![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?logo=laravel)](https://laravel.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com)
[![Redis](https://img.shields.io/badge/Redis-6.0-DC382D?logo=redis)](https://redis.io)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?logo=python)](https://www.python.org)

---

## 📖 프로젝트 개요

TOONVERSE AI는 AI 기반 **완전 자동화 웹툰 제작 및 글로벌 유통 플랫폼**입니다.

### 핵심 가치
- 🤖 **AI 자동 제작**: 시나리오 → 콘티 → 작화 → 식자 → 패키징 완전 자동화
- 🌍 **글로벌 배포**: 다국어 번역 및 현지화 자동 지원
- 📱 **SNS 최적화**: 쇼츠/릴스 자동 생성 및 예약 발행
- 💰 **수익 추적**: 플랫폼별 실시간 성과 모니터링
- 🏭 **IP 공장화**: 1명의 운영자가 수천 개 채널 동시 관리

---

## 🏗️ 시스템 아키텍처

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
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ 현재 상태 (2026-01-13)

### 완료된 작업

#### 1. 개발 환경 설정 ✅
- PHP 8.1+, Composer
- MySQL 8.0+
- Redis 6.0+
- Python 3.10+, FastAPI
- FFmpeg, ImageMagick, Supervisor

#### 2. Laravel 프로젝트 설정 ✅
- Laravel 10.x 프로젝트 생성
- `.env` 설정 완료
- 데이터베이스 마이그레이션 13개 완료

#### 3. 데이터베이스 구조 ✅
```
✅ projects (작품)
✅ episodes (에피소드)
✅ jobs (작업 큐)
✅ assets (결과물)
✅ characters (캐릭터)
✅ prompts (프롬프트 관리)
✅ channels (SNS 채널)
✅ publish_tasks (예약 발행)
✅ metrics (성과 지표)
```

#### 4. Laravel 구조 생성 ✅
- **모델 9개**: Project, Episode, Job, Asset, Character, Prompt, Channel, PublishTask, Metric
- **API 컨트롤러 4개**: ProjectController, EpisodeController, JobController, DashboardController
- **Queue Job 1개**: RunTextScriptJob

---

## 🚧 다음 단계

### MVP (v0.1) - 현재 진행 중
**목표**: 키워드 입력 → 시나리오 자동 생성 시스템 구축

#### 구현 필요 사항
1. [ ] Laravel 모델 관계 설정
2. [ ] API 컨트롤러 로직 구현
3. [ ] API 라우트 설정
4. [ ] Queue Job 구현
5. [ ] Text Engine (FastAPI) 구현
6. [ ] 통합 테스트

**예상 완료 시간**: 1-2일

**성공 기준**:
- API 호출로 프로젝트/에피소드 생성 가능
- Generate API 호출 시 백그라운드 작업 실행
- Text Engine이 시나리오 생성하여 DB에 저장
- 평균 생성 시간 < 5분

### V1 (v1.0) - 완전 자동화
**목표**: 제작부터 유통까지 End-to-End 자동화

#### 추가 기능
- Director Engine (콘티 자동 생성)
- Image Engine (캐릭터 일관 작화)
- Lettering Engine (말풍선 자동 식자)
- Packaging Engine (웹툰 패키징)
- I18N Engine (다국어 번역)
- Video Engine (쇼츠 자동 생성)
- SNS Scheduler (자동 발행)

**예상 완료 시간**: 4-6주

---

## 📁 디렉토리 구조

```
/var/www/toonverse/webapp/
├── backend-api/              # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/    # API 컨트롤러
│   │   ├── Models/                  # Eloquent 모델
│   │   └── Jobs/                    # Queue 작업
│   ├── database/migrations/         # 데이터베이스 마이그레이션
│   ├── routes/api.php               # API 라우트
│   └── .env                         # 환경변수
│
├── ai-engines/               # FastAPI AI 엔진
│   ├── text_engine/          # [MVP] 시나리오 생성
│   ├── director_engine/      # [V1] 콘티 생성
│   ├── image_engine/         # [V1] 이미지 생성
│   ├── lettering_engine/     # [V1] 식자 처리
│   ├── packaging_engine/     # [V1] 패키징
│   ├── video_engine/         # [V1] 쇼츠 생성
│   └── i18n_engine/          # [V1] 번역/현지화
│
├── storage/                  # 생성된 파일 저장소
│   └── projects/
│
├── TOONVERSE_MASTER_PLAN.md  # 📋 완전한 기획안
├── NEXT_STEPS.md             # 📝 다음 단계 가이드
└── README.md                 # 📖 현재 문서
```

---

## 🚀 빠른 시작 (MVP 구현 후)

### 1. 서버 실행

#### 터미널 1: Laravel API
```bash
cd /var/www/toonverse/webapp/backend-api
php artisan serve --host=0.0.0.0 --port=8000
```

#### 터미널 2: Queue Worker
```bash
cd /var/www/toonverse/webapp/backend-api
php artisan queue:work redis --verbose
```

#### 터미널 3: Text Engine
```bash
cd /var/www/toonverse/webapp/ai-engines/text_engine
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. 테스트 시나리오

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
curl -X POST http://localhost:8000/api/episodes/1/generate

# 4. 결과 확인 (완료 후)
curl http://localhost:8000/api/episodes/1
```

---

## 📊 API 엔드포인트

### Projects
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects` - 프로젝트 목록
- `GET /api/projects/{id}` - 프로젝트 상세

### Episodes
- `POST /api/projects/{project}/episodes` - 에피소드 생성
- `POST /api/episodes/{episode}/generate` - 생성 시작
- `GET /api/episodes/{id}` - 에피소드 조회

### Jobs
- `GET /api/jobs` - 작업 목록
- `GET /api/jobs/{id}` - 작업 상세

### Dashboard
- `GET /api/dashboard/stats` - 대시보드 통계

---

## 🛠️ 기술 스택

### Backend
- **Framework**: Laravel 10.x
- **Database**: MySQL 8.0+
- **Cache/Queue**: Redis 6.0+
- **Web Server**: Nginx / Apache
- **Process Manager**: Supervisor

### AI Engines
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **AI Models**: GPT-4, Stable Diffusion (V1)
- **Image Processing**: Pillow, FFmpeg, ImageMagick

### Infrastructure
- **Server**: Ubuntu 22.04 LTS
- **Deployment**: Manual / CI/CD (추후)
- **Monitoring**: Laravel Telescope (추후)

---

## 📚 문서

- 📋 **[TOONVERSE_MASTER_PLAN.md](./TOONVERSE_MASTER_PLAN.md)** - 완전한 시스템 기획안
  - 프로젝트 개요
  - 시스템 아키텍처
  - 데이터베이스 설계 (상세 ERD)
  - API 엔드포인트 명세
  - AI 엔진 사양
  - 파이프라인 워크플로우
  - 개발 로드맵
  - 설치 및 실행 가이드

- 📝 **[NEXT_STEPS.md](./NEXT_STEPS.md)** - 다음 개발 단계 가이드
  - 완료된 작업 체크리스트
  - MVP 구현 가이드 (코드 포함)
  - 실행 및 테스트 방법
  - V1 개발 계획
  - 운영 최적화 (Supervisor)
  - 문제 해결 가이드

---

## 🏆 마일스톤

### Phase 1: MVP (Week 1-2) - 🔄 진행 중
- [x] 개발 환경 설정
- [x] Laravel 프로젝트 생성
- [x] 데이터베이스 마이그레이션
- [x] 모델 및 컨트롤러 생성
- [ ] API 로직 구현
- [ ] Text Engine 구현
- [ ] 통합 테스트

### Phase 2: V1 (Week 3-6)
- [ ] Director Engine
- [ ] Image Engine
- [ ] Lettering Engine
- [ ] Packaging Engine
- [ ] I18N Engine
- [ ] Video Engine
- [ ] SNS 자동 발행

### Phase 3: V2 (Week 7-10)
- [ ] 플랫폼 자동 업로드
- [ ] 실시간 성과 분석
- [ ] A/B 테스트 시스템
- [ ] IP 확장 도구

---

## 🤝 기여 가이드

이 프로젝트는 현재 초기 개발 단계입니다. 
기여를 원하시면 다음 순서로 진행해주세요:

1. 프로젝트 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

---

## 📄 라이센스

이 프로젝트는 비공개 소유권을 가집니다.

---

## 📞 연락처

프로젝트 관리자: TOONVERSE Team

---

## 🎯 비전

**TOONVERSE AI**는 단순한 웹툰 제작 도구를 넘어, **IP 생산 공장**이자 **글로벌 자동 유통 엔진**입니다.

우리의 목표:
- 🎨 **창작 민주화**: 누구나 쉽게 고품질 웹툰 제작
- 🌍 **글로벌 진출**: 언어와 문화의 장벽 제거
- 💰 **수익 극대화**: 자동화된 다채널 유통
- 🚀 **IP 확장**: 웹툰 → 쇼츠 → 애니 → 굿즈

---

**TOONVERSE AI** - 아이디어에서 글로벌 히트작까지 🚀

*Made with ❤️ by TOONVERSE Team*
