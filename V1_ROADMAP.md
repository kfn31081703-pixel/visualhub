# 🚀 TOONVERSE AI - V1 개발 로드맵

**작성 날짜**: 2026-01-13  
**현재 단계**: MVP 완료 → V1 개발 시작  
**목표**: 완전 자동화 웹툰 생성 + 글로벌 유통

---

## 📊 현재 상태 (MVP 완성)

### ✅ 완료된 기능
- **시나리오 자동 생성**: 키워드 → AI 시나리오 생성
- **Laravel API**: RESTful API 완성
- **Queue 시스템**: Redis 기반 비동기 처리
- **Text Engine**: FastAPI 기반 AI 엔진
- **Supervisor**: 프로세스 자동 관리 및 재시작

### 🎯 MVP 성과
- ✅ E2E 파이프라인 검증 완료
- ✅ Job 추적 및 재시도 메커니즘
- ✅ 3개 서비스 Supervisor 관리
- ✅ 자동 재시작 테스트 통과

---

## 🎯 V1 개발 목표

### 핵심 목표
**"키워드 입력 → 완성된 웹툰 이미지 + 다국어 유통"**

### V1에서 추가될 기능
1. **Director Engine** - 시나리오 → 컷 리스트 (JSON)
2. **Image Engine** - 캐릭터 일관성 유지 이미지 생성
3. **Lettering Engine** - 말풍선 + 대사 합성
4. **Packaging Engine** - 최종 웹툰 이미지 패키징
5. **번역/현지화** - 다국어 자동 번역
6. **Video Engine** - 쇼츠 영상 자동 생성
7. **SNS Scheduler** - YouTube, Instagram, TikTok 예약 업로드

---

## 📋 개발 단계 (Phase별 구성)

### 🔴 Phase 1: 이미지 생성 파이프라인 (우선순위 최고)
**예상 기간**: 5-7일  
**목표**: 시나리오 → 완성된 웹툰 이미지

#### 1.1 Director Engine (2일)
**역할**: 시나리오를 패널 단위로 분할하고 각 패널의 비주얼 지시서 생성

**입력**:
```json
{
  "script_text": "# 악당이지만 정의로운 - 1화\n\n## 씬 1 - 오프닝...",
  "target_panels": 15
}
```

**출력**:
```json
{
  "panels": [
    {
      "panel_number": 1,
      "scene": "오프닝",
      "location": "도시의 거리, 이른 아침",
      "characters": ["주인공"],
      "action": "주인공이 결의에 찬 눈빛으로 앞을 바라본다",
      "dialogue": "이제 시작이야... 돌아갈 수 없어.",
      "camera_angle": "medium shot",
      "mood": "진지하고 긴장감 넘치는",
      "visual_prompt": "A determined young man standing on a city street at dawn, looking forward with resolute eyes, serious atmosphere, cinematic lighting"
    },
    ...
  ]
}
```

**구현 작업**:
- [ ] `ai-engines/director_engine/` 디렉토리 생성
- [ ] FastAPI 엔드포인트: `POST /engine/director/storyboard`
- [ ] LLM 연동 (GPT-4 또는 Claude)
- [ ] 시나리오 → JSON 변환 로직
- [ ] 마이그레이션: `storyboard_json` 컬럼 활용
- [ ] Queue Job: `RunDirectorJob` 생성
- [ ] 테스트: 시나리오 → 컷 리스트 변환

#### 1.2 Character Design System (1일)
**역할**: 캐릭터 일관성 유지를 위한 캐릭터 DB 구축

**데이터베이스**:
```sql
-- characters 테이블 (이미 존재)
ALTER TABLE characters ADD COLUMN reference_image_url VARCHAR(255);
ALTER TABLE characters ADD COLUMN visual_description TEXT;
ALTER TABLE characters ADD COLUMN style_seed VARCHAR(100);
```

**구현 작업**:
- [ ] Character 모델 업데이트
- [ ] 캐릭터 등록 API 구현
- [ ] 참고 이미지 저장 로직

#### 1.3 Image Engine (2일)
**역할**: AI 이미지 생성 (DALL-E 3, Midjourney, Stable Diffusion 등)

**입력** (Director Engine 출력):
```json
{
  "panel_number": 1,
  "visual_prompt": "...",
  "characters": ["주인공"],
  "character_refs": [
    {
      "name": "주인공",
      "reference_image_url": "...",
      "style_seed": "abc123"
    }
  ]
}
```

**출력**:
```json
{
  "image_url": "https://storage.../panel_001.png",
  "width": 1024,
  "height": 1448,
  "generation_metadata": {
    "model": "dall-e-3",
    "prompt": "...",
    "cost_units": 0.04
  }
}
```

**구현 작업**:
- [ ] `ai-engines/image_engine/` 디렉토리 생성
- [ ] FastAPI 엔드포인트: `POST /engine/image/generate`
- [ ] 이미지 생성 API 연동 (OpenAI DALL-E 3 권장)
- [ ] 캐릭터 일관성 로직 (IP-Adapter 또는 ControlNet)
- [ ] 이미지 저장 (로컬 또는 S3)
- [ ] Queue Job: `RunImageJob` 생성
- [ ] 마이그레이션: `assets` 테이블 활용
- [ ] 테스트: 컷 리스트 → 이미지 생성

#### 1.4 Lettering Engine (1일)
**역할**: 이미지 + 대사 합성 (말풍선, 텍스트 오버레이)

**입력**:
```json
{
  "image_url": "https://storage.../panel_001.png",
  "dialogue": "이제 시작이야... 돌아갈 수 없어.",
  "speaker": "주인공",
  "bubble_position": "top-right",
  "font_size": 24
}
```

**출력**:
```json
{
  "lettered_image_url": "https://storage.../panel_001_lettered.png"
}
```

**구현 작업**:
- [ ] `ai-engines/lettering_engine/` 디렉토리 생성
- [ ] FastAPI 엔드포인트: `POST /engine/lettering/apply`
- [ ] PIL/OpenCV 기반 텍스트 오버레이
- [ ] 말풍선 생성 (SVG 템플릿 또는 동적 생성)
- [ ] 폰트 설정 (한글, 영어 등)
- [ ] Queue Job: `RunLetteringJob` 생성
- [ ] 테스트: 이미지 + 대사 → 완성본

#### 1.5 Packaging Engine (1일)
**역할**: 여러 패널을 하나의 웹툰 이미지로 병합

**입력**:
```json
{
  "episode_id": 1,
  "panels": [
    {
      "panel_number": 1,
      "lettered_image_url": "..."
    },
    ...
  ],
  "layout": "vertical"
}
```

**출력**:
```json
{
  "final_webtoon_url": "https://storage.../episode_001_final.png",
  "width": 1024,
  "height": 21720  // 15 패널 × 1448px
}
```

**구현 작업**:
- [ ] `ai-engines/packaging_engine/` 디렉토리 생성
- [ ] FastAPI 엔드포인트: `POST /engine/pack/webtoon`
- [ ] 이미지 병합 로직 (PIL)
- [ ] 레이아웃 옵션 (vertical, grid 등)
- [ ] Queue Job: `RunPackagingJob` 생성
- [ ] 테스트: 여러 패널 → 최종 웹툰

---

### 🟡 Phase 2: 글로벌 유통 (번역 + SNS) (5-7일)

#### 2.1 번역/현지화 엔진 (2일)
**역할**: 시나리오 다국어 번역

**지원 언어**: 한국어, 영어, 일본어, 중국어(간체/번체), 스페인어, 프랑스어 등

**구현 작업**:
- [ ] `ai-engines/i18n_engine/` 디렉토리 생성
- [ ] FastAPI 엔드포인트: `POST /engine/i18n/translate`
- [ ] 번역 API 연동 (Google Translate 또는 DeepL)
- [ ] 마이그레이션: `translated_scripts` 테이블 생성
- [ ] Queue Job: `RunTranslationJob` 생성

#### 2.2 Video Engine (2일)
**역할**: 웹툰 → 쇼츠 영상 (YouTube Shorts, Instagram Reels, TikTok)

**구현 작업**:
- [ ] `ai-engines/video_engine/` 디렉토리 생성
- [ ] FastAPI 엔드포인트: `POST /engine/video/shorts`
- [ ] FFmpeg 기반 영상 생성
- [ ] 패널 애니메이션 효과 (pan, zoom)
- [ ] BGM 추가 (저작권 무료 음원)
- [ ] Queue Job: `RunVideoJob` 생성

#### 2.3 SNS Scheduler (2-3일)
**역할**: SNS 플랫폼 예약 업로드

**지원 플랫폼**:
- YouTube (API)
- Instagram (Meta API)
- TikTok (API)
- Twitter/X (API)

**구현 작업**:
- [ ] `channels` 테이블 활용 (OAuth 토큰 저장)
- [ ] `publish_tasks` 테이블 활용 (예약 업로드)
- [ ] SNS API 연동
- [ ] Queue Job: `RunPublishJob` 생성
- [ ] 스케줄러 (Laravel Task Scheduling)

---

### 🟢 Phase 3: 관리자 대시보드 + 모니터링 (3-5일)

#### 3.1 관리자 대시보드 (3일)
**화면 구성**:
1. **생성 현황 대시보드**
   - 진행 중인 작업 (Jobs)
   - 성공률, 실패율
   - 평균 생성 시간
   - 평균 비용

2. **글로벌 성과 대시보드**
   - 국가별 조회수
   - 플랫폼별 성과
   - 인기 에피소드 TOP 10

3. **비용/수익 추적**
   - AI 비용 (Text, Image, Video)
   - 수익 (광고, 플랫폼 수익)
   - ROI 분석

**구현 작업**:
- [ ] Vue.js 또는 React 프론트엔드
- [ ] Dashboard API 엔드포인트
- [ ] Chart.js 또는 Recharts 연동
- [ ] `metrics` 테이블 활용

#### 3.2 로깅 및 모니터링 (1-2일)
**구현 작업**:
- [ ] Sentry 연동 (에러 추적)
- [ ] Slack 알림 (중요 이벤트)
- [ ] Prometheus + Grafana (메트릭)

---

## 🗂️ 데이터베이스 확장 (V1용)

### 새로운 테이블
```sql
-- 번역된 스크립트
CREATE TABLE translated_scripts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    episode_id BIGINT UNSIGNED NOT NULL,
    language_code VARCHAR(10) NOT NULL,  -- 'en', 'ja', 'zh-CN' 등
    translated_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    UNIQUE KEY (episode_id, language_code)
);

-- 수익 추적
CREATE TABLE revenue (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    episode_id BIGINT UNSIGNED NOT NULL,
    platform VARCHAR(50) NOT NULL,  -- 'youtube', 'instagram', 'naver_webtoon' 등
    revenue_amount DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    recorded_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- IP 라이센싱 기록
CREATE TABLE rights_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    licensee_name VARCHAR(255) NOT NULL,  -- 라이센시 이름
    rights_type VARCHAR(100) NOT NULL,    -- 'animation', 'merchandise', 'game' 등
    contract_amount DECIMAL(12, 2),
    contract_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

---

## 🛠️ 개발 환경 추가 요구사항

### AI API 키 필요
```bash
# .env 파일에 추가
OPENAI_API_KEY=sk-...           # GPT-4, DALL-E 3
CLAUDE_API_KEY=...              # Claude (선택)
MIDJOURNEY_API_KEY=...          # Midjourney (선택)
DEEPL_API_KEY=...               # DeepL 번역
YOUTUBE_CLIENT_ID=...           # YouTube API
INSTAGRAM_ACCESS_TOKEN=...      # Instagram API
TIKTOK_CLIENT_KEY=...           # TikTok API
```

### 추가 Python 패키지
```bash
pip install openai pillow opencv-python moviepy deepl youtube-upload
```

---

## 📊 V1 완성 기준

### 필수 기능 (Must Have)
- [x] Text Engine (시나리오 생성)
- [ ] Director Engine (컷 리스트)
- [ ] Image Engine (이미지 생성)
- [ ] Lettering Engine (대사 합성)
- [ ] Packaging Engine (최종 웹툰)
- [ ] 번역 엔진 (1개 언어 이상)
- [ ] SNS 업로드 (1개 플랫폼 이상)

### 선택 기능 (Nice to Have)
- [ ] Video Engine (쇼츠)
- [ ] 관리자 대시보드
- [ ] 실시간 모니터링
- [ ] 다중 캐릭터 일관성
- [ ] 고급 레이아웃 (grid, splash page 등)

---

## 🚀 즉시 시작 가이드

### 1단계: Director Engine 구현
```bash
cd /var/www/toonverse/webapp/ai-engines
mkdir director_engine
cd director_engine
touch main.py requirements.txt
```

**requirements.txt**:
```
fastapi==0.128.0
uvicorn[standard]==0.40.0
pydantic==2.12.5
openai==1.54.0
```

**main.py** (기본 구조):
```python
from fastapi import FastAPI
from pydantic import BaseModel
import openai
import os

app = FastAPI(title="TOONVERSE Director Engine")

class DirectorRequest(BaseModel):
    script_text: str
    target_panels: int = 15

class DirectorResponse(BaseModel):
    success: bool
    panels: list

@app.post("/engine/director/storyboard")
async def create_storyboard(request: DirectorRequest):
    # TODO: OpenAI GPT-4 호출하여 컷 리스트 생성
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

### 2단계: Supervisor에 추가
```bash
sudo nano /etc/supervisor/conf.d/toonverse.conf
```

**추가 내용**:
```ini
[program:toonverse-director-engine]
command=python3 main.py
directory=/var/www/toonverse/webapp/ai-engines/director_engine
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/www/toonverse/webapp/logs/director-engine.log
```

**재시작**:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

---

## 📅 예상 일정

| Phase | 작업 | 예상 기간 |
|-------|------|----------|
| Phase 1 | Director Engine | 2일 |
| Phase 1 | Character System | 1일 |
| Phase 1 | Image Engine | 2일 |
| Phase 1 | Lettering Engine | 1일 |
| Phase 1 | Packaging Engine | 1일 |
| **Phase 1 합계** | | **7일** |
| Phase 2 | 번역 엔진 | 2일 |
| Phase 2 | Video Engine | 2일 |
| Phase 2 | SNS Scheduler | 3일 |
| **Phase 2 합계** | | **7일** |
| Phase 3 | 관리자 대시보드 | 3일 |
| Phase 3 | 모니터링 | 2일 |
| **Phase 3 합계** | | **5일** |
| **전체 V1** | | **19일 (약 3-4주)** |

---

## 🎯 V1 성공 지표

### 기능적 지표
- ✅ 키워드 → 완성된 웹툰 이미지 (15 패널)
- ✅ 1개 이상의 언어로 번역
- ✅ 1개 이상의 SNS 플랫폼 자동 업로드
- ✅ 캐릭터 일관성 유지 (같은 캐릭터 인식)

### 성능 지표
- 평균 생성 시간: < 10분 (1화 기준)
- 이미지 품질: 1024×1448px 이상
- 성공률: > 90%
- 캐릭터 일관성: > 80%

---

## 💡 다음 작업

**즉시 시작할 수 있는 작업**:
1. Director Engine 구현
2. OpenAI API 키 설정
3. Image Engine 설계
4. 캐릭터 데이터베이스 확장

**참고 문서**:
- `TOONVERSE_MASTER_PLAN.md` - 전체 아키텍처
- `MVP_TEST_RESULTS.md` - MVP 테스트 결과
- `PROJECT_STATUS.md` - 현재 상태

---

**V1 개발 시작일**: 2026-01-13  
**예상 완료일**: 2026-02-10 (약 4주)  
**현재 진행률**: 5% (Supervisor 완성)

🚀 **TOONVERSE AI V1 개발을 시작합니다!**
