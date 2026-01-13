# 📖 TOONVERSE 사용 가이드

**버전**: V1 Phase 1  
**작성일**: 2026-01-13  
**대상**: TOONVERSE AI 웹툰 자동 생성 시스템 사용자

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [빠른 시작](#빠른-시작)
3. [API 사용법](#api-사용법)
4. [단계별 가이드](#단계별-가이드)
5. [고급 사용법](#고급-사용법)
6. [문제 해결](#문제-해결)

---

## 🎯 시스템 개요

### TOONVERSE란?

TOONVERSE는 AI 기반 웹툰 자동 생성 시스템입니다. 
간단한 프로젝트 정보만 입력하면 **60초 내**에 완성된 웹툰 이미지를 생성합니다.

### 5단계 자동 생성 프로세스

```
1. Text Engine      → 시나리오 생성 (AI 스크립트)
2. Director Engine  → 스토리보드 분할 (패널 구성)
3. Image Engine     → 이미지 생성 (각 패널 이미지)
4. Lettering Engine → 말풍선/대사 합성
5. Packaging Engine → 최종 웹툰 이미지 병합
```

### 접속 정보

- **API Base URL**: `http://toonverse.store/api/` (DNS 설정 후)
- **로컬 테스트**: `http://localhost:8000/api/`
- **서버 IP**: `http://1.234.91.116/api/`

---

## 🚀 빠른 시작

### 1. Health Check (시스템 상태 확인)

```bash
curl http://localhost:8000/api/health
```

**응답 예시**:
```json
{
  "success": true,
  "message": "TOONVERSE AI API is running",
  "timestamp": "2026-01-13T06:00:00+00:00"
}
```

### 2. 프로젝트 생성 (웹툰 프로젝트 만들기)

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "나의 첫 웹툰",
    "genre": "판타지",
    "target_country": "KR",
    "tone": "흥미진진한",
    "target_audience": "10-20대",
    "keywords": ["모험", "성장", "우정"],
    "world_setting": "마법이 존재하는 현대 한국"
  }'
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "나의 첫 웹툰",
    "genre": "판타지",
    "created_at": "2026-01-13T06:00:00.000000Z"
  }
}
```

### 3. 에피소드 생성

```bash
curl -X POST http://localhost:8000/api/projects/1/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "시작",
    "synopsis": "평범한 고등학생 주인공이 마법의 힘을 얻게 된다"
  }'
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "episode_number": 1,
    "title": "시작",
    "status": "draft"
  }
}
```

### 4. 웹툰 자동 생성 (전체 파이프라인 실행)

```bash
curl -X POST http://localhost:8000/api/episodes/1/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["마법", "각성", "시작"],
    "target_word_count": 1500,
    "target_panels": 5
  }'
```

**응답 예시**:
```json
{
  "success": true,
  "message": "Full pipeline job queued successfully",
  "data": {
    "job_id": 1,
    "status": "queued",
    "episode_id": 1
  }
}
```

### 5. 생성 상태 확인

```bash
# 1초마다 상태 확인 (완료될 때까지)
watch -n 1 'curl -s http://localhost:8000/api/jobs/1 | python3 -m json.tool'
```

**진행 중**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "pipeline.full",
    "status": "processing",
    "progress": "3/5 단계 완료"
  }
}
```

**완료**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "pipeline.full",
    "status": "done",
    "output_json": {
      "text_job_id": 2,
      "director_job_id": 3,
      "image_job_id": 4,
      "lettering_job_id": 5,
      "packaging_job_id": 6,
      "completed_steps": 5
    }
  }
}
```

### 6. 최종 웹툰 이미지 확인

```bash
# 에피소드 정보 조회
curl http://localhost:8000/api/episodes/1
```

**응답에서 최종 웹툰 경로 확인**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "시작",
    "status": "done",
    "assets": {
      "final_webtoon": [
        {
          "id": 1,
          "path": "/var/www/toonverse/webapp/storage/images/final/episode_001_final.png",
          "file_size": 20480
        }
      ]
    }
  }
}
```

**웹 브라우저로 확인**:
```
http://toonverse.store/storage/images/final/episode_001_final.png
```

또는 로컬:
```
http://localhost:8000/storage/images/final/episode_001_final.png
```

---

## 📚 API 사용법

### Base URL

```
Production: https://toonverse.store/api/
Local: http://localhost:8000/api/
Server IP: http://1.234.91.116/api/
```

### 인증

현재 버전(V1 Phase 1)은 인증이 필요하지 않습니다.

### Content-Type

모든 POST/PUT 요청은 `Content-Type: application/json` 헤더가 필요합니다.

---

## 🎬 단계별 가이드

### Step 1: 프로젝트 생성

프로젝트는 웹툰 시리즈의 기본 설정입니다.

#### 필수 필드
- `title` (string): 프로젝트 제목
- `genre` (string): 장르 (예: SF, 판타지, 로맨스, 스릴러)
- `target_country` (string, 2자리): 타겟 국가 (예: KR, US, JP)
- `tone` (string): 톤/분위기 (예: 밝은, 긴장감 넘치는, 감동적인)
- `target_audience` (string): 타겟 관객 (예: 10-20대, 30-40대)
- `keywords` (array): 키워드 배열 (최소 1개)
- `world_setting` (text): 세계관 설명

#### 예시

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "타임루프 히어로",
    "genre": "SF 액션",
    "target_country": "KR",
    "tone": "긴장감 넘치는",
    "target_audience": "10-30대",
    "keywords": ["타임루프", "구원", "희생"],
    "world_setting": "2099년, 붕괴 직전의 지구. 마지막 타임머신을 가진 주인공이 과거로 돌아가 인류를 구하려 한다."
  }'
```

#### 장르 추천
- **SF**: 타임루프, 우주, 미래
- **판타지**: 마법, 영웅, 드래곤
- **로맨스**: 사랑, 운명, 재회
- **스릴러**: 범죄, 추리, 긴장
- **액션**: 전투, 모험, 성장

---

### Step 2: 에피소드 생성

에피소드는 프로젝트의 각 화입니다.

#### 필수 필드
- `episode_number` (int): 에피소드 번호 (1부터 시작)
- `title` (string): 에피소드 제목

#### 선택 필드
- `synopsis` (text): 에피소드 시놉시스

#### 예시

```bash
curl -X POST http://localhost:8000/api/projects/1/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "첫 번째 루프",
    "synopsis": "주인공은 처음으로 과거로 돌아간다. 하지만 무엇을 해야 할지 막막하다."
  }'
```

---

### Step 3: 전체 파이프라인 실행

웹툰을 자동 생성합니다.

#### 필수 필드
- `keywords` (array): 이 에피소드의 핵심 키워드 (3-5개 권장)
- `target_word_count` (int): 목표 단어 수 (800-2000 권장)
- `target_panels` (int): 목표 패널 수 (3-10 권장)

#### 예시

```bash
curl -X POST http://localhost:8000/api/episodes/1/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["타임루프", "첫시도", "실패"],
    "target_word_count": 1200,
    "target_panels": 6
  }'
```

#### 파라미터 가이드

| 파라미터 | 최소값 | 권장값 | 최대값 | 설명 |
|---------|--------|--------|--------|------|
| target_word_count | 500 | 1200 | 2500 | 시나리오 단어 수 |
| target_panels | 2 | 6 | 12 | 웹툰 패널 수 |
| keywords | 1개 | 3-5개 | 10개 | 에피소드 키워드 |

**권장 조합**:
- **짧은 에피소드**: 800단어, 3-4패널 (약 30초 생성)
- **일반 에피소드**: 1200단어, 5-7패널 (약 60초 생성)
- **긴 에피소드**: 2000단어, 8-10패널 (약 90초 생성)

---

### Step 4: Job 상태 확인

Job은 백그라운드에서 실행됩니다.

#### Job 상태
- `queued`: 대기 중
- `processing`: 처리 중
- `done`: 완료
- `failed`: 실패

#### 상태 확인

```bash
curl http://localhost:8000/api/jobs/1
```

#### 에피소드별 Job 목록

```bash
curl http://localhost:8000/api/jobs?episode_id=1
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "pipeline.full",
      "status": "done"
    },
    {
      "id": 2,
      "type": "text.script",
      "status": "done"
    },
    {
      "id": 3,
      "type": "director.storyboard",
      "status": "done"
    },
    {
      "id": 4,
      "type": "image.generate",
      "status": "done"
    },
    {
      "id": 5,
      "type": "lettering.apply",
      "status": "done"
    },
    {
      "id": 6,
      "type": "packaging.webtoon",
      "status": "done"
    }
  ]
}
```

#### Job 재시도 (실패 시)

```bash
curl -X POST http://localhost:8000/api/jobs/1/retry
```

---

### Step 5: 결과 확인

#### 에피소드 상세 정보

```bash
curl http://localhost:8000/api/episodes/1
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "project_id": 1,
    "episode_number": 1,
    "title": "첫 번째 루프",
    "status": "done",
    "script": "# 타임루프 히어로 - 1화\n\n## 장면 1: 미래의 폐허\n...",
    "storyboard_json": {
      "panels": [
        {
          "panel_number": 1,
          "scene_description": "2099년 붕괴된 지구",
          "camera_angle": "wide shot",
          "mood": "절망적인"
        }
      ]
    },
    "assets": {
      "image": [
        {
          "id": 1,
          "path": "/var/www/toonverse/webapp/storage/images/panel_001_dummy.png"
        }
      ],
      "lettered_image": [
        {
          "id": 2,
          "path": "/var/www/toonverse/webapp/storage/images/panel_001_lettered.png"
        }
      ],
      "final_webtoon": [
        {
          "id": 3,
          "path": "/var/www/toonverse/webapp/storage/images/final/episode_001_final.png",
          "file_size": 20480,
          "meta_json": {
            "total_panels": 6,
            "width": 1024,
            "total_height": 8688
          }
        }
      ]
    }
  }
}
```

#### 최종 웹툰 이미지 다운로드

**브라우저로**:
```
http://toonverse.store/storage/images/final/episode_001_final.png
```

**curl로**:
```bash
curl -O http://toonverse.store/storage/images/final/episode_001_final.png
```

---

## 💡 고급 사용법

### 프로젝트 목록 조회

```bash
curl http://localhost:8000/api/projects
```

### 프로젝트 수정

```bash
curl -X PUT http://localhost:8000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "타임루프 히어로 (개정판)",
    "tone": "더욱 긴장감 넘치는"
  }'
```

### 프로젝트 삭제

```bash
curl -X DELETE http://localhost:8000/api/projects/1
```

### 에피소드 목록 조회

```bash
# 모든 에피소드
curl http://localhost:8000/api/episodes

# 특정 프로젝트의 에피소드만
curl http://localhost:8000/api/episodes?project_id=1
```

### 에피소드 수정

```bash
curl -X PUT http://localhost:8000/api/episodes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫 번째 루프 (수정)",
    "synopsis": "새로운 시놉시스"
  }'
```

### 에피소드 삭제

```bash
curl -X DELETE http://localhost:8000/api/episodes/1
```

---

## 🎨 실전 예제

### 예제 1: SF 웹툰 생성 (전체 과정)

```bash
# 1. 프로젝트 생성
PROJECT_ID=$(curl -s -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "우주 탐험가",
    "genre": "SF 모험",
    "target_country": "KR",
    "tone": "흥미진진하고 밝은",
    "target_audience": "전연령",
    "keywords": ["우주", "탐험", "외계인", "우정"],
    "world_setting": "2150년, 인류는 은하계를 탐험하기 시작했다"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo "프로젝트 ID: $PROJECT_ID"

# 2. 에피소드 생성
EPISODE_ID=$(curl -s -X POST http://localhost:8000/api/projects/$PROJECT_ID/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "첫 항해",
    "synopsis": "새로운 우주선 오디세이호가 첫 항해를 떠난다"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo "에피소드 ID: $EPISODE_ID"

# 3. 웹툰 생성
JOB_ID=$(curl -s -X POST http://localhost:8000/api/episodes/$EPISODE_ID/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["출발", "우주선", "설렘"],
    "target_word_count": 1000,
    "target_panels": 5
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['job_id'])")

echo "Job ID: $JOB_ID"

# 4. 완료 대기 (최대 120초)
echo "웹툰 생성 중... (최대 2분 소요)"
for i in {1..120}; do
  STATUS=$(curl -s http://localhost:8000/api/jobs/$JOB_ID | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['status'])")
  
  if [ "$STATUS" = "done" ]; then
    echo "✅ 웹툰 생성 완료!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ 생성 실패"
    exit 1
  fi
  
  echo "진행 중... ($i/120초)"
  sleep 1
done

# 5. 최종 웹툰 경로 확인
curl -s http://localhost:8000/api/episodes/$EPISODE_ID | python3 -m json.tool | grep "final"

echo "웹툰 확인: http://toonverse.store/storage/images/final/episode_001_final.png"
```

### 예제 2: 로맨스 웹툰 (짧은 버전)

```bash
# 빠른 생성 (30초 내)
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "첫사랑 다이어리",
    "genre": "로맨스",
    "target_country": "KR",
    "tone": "달콤하고 설레는",
    "target_audience": "10-20대",
    "keywords": ["첫사랑", "학교", "고백"],
    "world_setting": "현대 한국 고등학교"
  }'

# 프로젝트 ID를 1로 가정
curl -X POST http://localhost:8000/api/projects/1/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "첫 만남",
    "synopsis": "전학 온 첫날, 운명적인 만남"
  }'

# 짧은 웹툰 생성 (3패널, 30초 완성)
curl -X POST http://localhost:8000/api/episodes/1/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["전학생", "첫눈", "설렘"],
    "target_word_count": 800,
    "target_panels": 3
  }'
```

### 예제 3: 액션 웹툰 (긴 버전)

```bash
# 긴 에피소드 생성 (90초 내)
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "검의 마스터",
    "genre": "액션 판타지",
    "target_country": "KR",
    "tone": "긴장감 넘치고 박진감 있는",
    "target_audience": "10-30대",
    "keywords": ["검술", "전투", "성장", "복수"],
    "world_setting": "중세 판타지 세계, 검으로 모든 것을 결정하는 시대"
  }'

curl -X POST http://localhost:8000/api/projects/1/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "복수의 시작",
    "synopsis": "가족을 잃은 주인공이 복수를 다짐하며 검을 집어든다"
  }'

# 긴 웹툰 생성 (10패널, 90초 완성)
curl -X POST http://localhost:8000/api/episodes/1/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["복수", "결의", "검", "훈련"],
    "target_word_count": 2000,
    "target_panels": 10
  }'
```

---

## 🔧 문제 해결

### Q1. API가 응답하지 않아요

**확인 사항**:
```bash
# 서비스 상태 확인
sudo supervisorctl status toonverse-laravel

# 로그 확인
tail -f /var/www/toonverse/webapp/backend-api/storage/logs/laravel.log
```

**해결**:
```bash
# Laravel API 재시작
sudo supervisorctl restart toonverse-laravel
```

### Q2. Job이 계속 "processing" 상태에요

**확인**:
```bash
# Queue Worker 상태 확인
sudo supervisorctl status toonverse-queue

# Queue 로그 확인
tail -f /var/www/toonverse/webapp/logs/queue.log
```

**해결**:
```bash
# Queue Worker 재시작
sudo supervisorctl restart toonverse-queue
```

### Q3. Job이 "failed" 상태로 변했어요

**확인**:
```bash
# Job 에러 메시지 확인
curl http://localhost:8000/api/jobs/1 | python3 -m json.tool | grep -A 5 "error_message"
```

**해결**:
```bash
# Job 재시도
curl -X POST http://localhost:8000/api/jobs/1/retry
```

### Q4. 이미지가 생성되지 않아요

**확인**:
```bash
# Image Engine 상태
sudo supervisorctl status toonverse:toonverse-image-engine

# Image Engine 로그
tail -f /var/www/toonverse/webapp/logs/image-engine.log

# Storage 권한 확인
ls -la /var/www/toonverse/webapp/storage/images/
```

**해결**:
```bash
# Storage 권한 수정
sudo chown -R www-data:www-data /var/www/toonverse/webapp/storage/
sudo chmod -R 755 /var/www/toonverse/webapp/storage/

# Image Engine 재시작
sudo supervisorctl restart toonverse:toonverse-image-engine
```

### Q5. 최종 웹툰 이미지가 비어있어요

**확인**:
```bash
# Packaging Engine 상태
sudo supervisorctl status toonverse:toonverse-packaging-engine

# Packaging 로그
tail -f /var/www/toonverse/webapp/logs/packaging-engine.log
```

**해결**:
```bash
# Packaging Engine 재시작
sudo supervisorctl restart toonverse:toonverse-packaging-engine

# Job 재시도
curl -X POST http://localhost:8000/api/jobs/{packaging_job_id}/retry
```

### Q6. 웹툰 품질을 높이고 싶어요

**권장 설정**:

1. **더 많은 키워드** (5-7개):
```json
{
  "keywords": ["복수", "결의", "검", "훈련", "과거", "눈물", "결심"]
}
```

2. **더 긴 시나리오** (1500-2000 단어):
```json
{
  "target_word_count": 1800
}
```

3. **더 많은 패널** (7-10개):
```json
{
  "target_panels": 8
}
```

4. **상세한 세계관**:
```json
{
  "world_setting": "중세 판타지 세계. 검으로 모든 것을 결정하는 시대. 귀족과 평민의 격차가 심하며, 마법은 금지되어 있다. 주인공은 평민 출신으로 가족을 귀족에게 잃었다."
}
```

---

## 📊 API 엔드포인트 전체 목록

### 프로젝트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/{id}` | 프로젝트 조회 |
| PUT | `/api/projects/{id}` | 프로젝트 수정 |
| DELETE | `/api/projects/{id}` | 프로젝트 삭제 |

### 에피소드

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/episodes` | 에피소드 목록 |
| POST | `/api/projects/{id}/episodes` | 에피소드 생성 |
| GET | `/api/episodes/{id}` | 에피소드 조회 |
| POST | `/api/episodes/{id}/generate-full` | 전체 파이프라인 실행 |
| PUT | `/api/episodes/{id}` | 에피소드 수정 |
| DELETE | `/api/episodes/{id}` | 에피소드 삭제 |

### Job

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/jobs` | Job 목록 |
| GET | `/api/jobs?episode_id={id}` | 에피소드별 Job 목록 |
| GET | `/api/jobs/{id}` | Job 상태 조회 |
| POST | `/api/jobs/{id}/retry` | Job 재시도 |

### 기타

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/health` | Health Check |
| GET | `/storage/images/*` | 이미지 파일 |

---

## 💻 프로그래밍 언어별 예제

### Python

```python
import requests
import time
import json

# Base URL
BASE_URL = "http://localhost:8000/api"

# 1. 프로젝트 생성
project_data = {
    "title": "Python으로 만든 웹툰",
    "genre": "SF",
    "target_country": "KR",
    "tone": "신비로운",
    "target_audience": "20-40대",
    "keywords": ["AI", "미래", "기술"],
    "world_setting": "AI가 일상화된 2050년"
}

response = requests.post(f"{BASE_URL}/projects", json=project_data)
project_id = response.json()["data"]["id"]
print(f"프로젝트 ID: {project_id}")

# 2. 에피소드 생성
episode_data = {
    "episode_number": 1,
    "title": "AI의 각성",
    "synopsis": "AI가 자아를 갖게 된다"
}

response = requests.post(
    f"{BASE_URL}/projects/{project_id}/episodes",
    json=episode_data
)
episode_id = response.json()["data"]["id"]
print(f"에피소드 ID: {episode_id}")

# 3. 웹툰 생성
generation_data = {
    "keywords": ["AI", "각성", "의문"],
    "target_word_count": 1200,
    "target_panels": 5
}

response = requests.post(
    f"{BASE_URL}/episodes/{episode_id}/generate-full",
    json=generation_data
)
job_id = response.json()["data"]["job_id"]
print(f"Job ID: {job_id}")

# 4. 완료 대기
print("웹툰 생성 중...")
while True:
    response = requests.get(f"{BASE_URL}/jobs/{job_id}")
    status = response.json()["data"]["status"]
    
    if status == "done":
        print("✅ 생성 완료!")
        break
    elif status == "failed":
        print("❌ 생성 실패")
        print(response.json()["data"]["error_message"])
        break
    
    print(f"진행 중... (상태: {status})")
    time.sleep(2)

# 5. 결과 확인
response = requests.get(f"{BASE_URL}/episodes/{episode_id}")
episode = response.json()["data"]

# 최종 웹툰 경로
final_webtoon = episode["assets"]["final_webtoon"][0]
print(f"최종 웹툰: {final_webtoon['path']}")
print(f"파일 크기: {final_webtoon['file_size']} bytes")
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function createWebtoon() {
  try {
    // 1. 프로젝트 생성
    const projectResponse = await axios.post(`${BASE_URL}/projects`, {
      title: 'JavaScript로 만든 웹툰',
      genre: '판타지',
      target_country: 'KR',
      tone: '환상적인',
      target_audience: '전연령',
      keywords: ['마법', '모험', '용'],
      world_setting: '드래곤이 지배하는 판타지 세계'
    });
    
    const projectId = projectResponse.data.data.id;
    console.log(`프로젝트 ID: ${projectId}`);
    
    // 2. 에피소드 생성
    const episodeResponse = await axios.post(
      `${BASE_URL}/projects/${projectId}/episodes`,
      {
        episode_number: 1,
        title: '드래곤과의 만남',
        synopsis: '주인공이 처음으로 드래곤을 만난다'
      }
    );
    
    const episodeId = episodeResponse.data.data.id;
    console.log(`에피소드 ID: ${episodeId}`);
    
    // 3. 웹툰 생성
    const jobResponse = await axios.post(
      `${BASE_URL}/episodes/${episodeId}/generate-full`,
      {
        keywords: ['드래곤', '만남', '두려움'],
        target_word_count: 1000,
        target_panels: 4
      }
    );
    
    const jobId = jobResponse.data.data.job_id;
    console.log(`Job ID: ${jobId}`);
    
    // 4. 완료 대기
    console.log('웹툰 생성 중...');
    
    const checkStatus = async () => {
      while (true) {
        const statusResponse = await axios.get(`${BASE_URL}/jobs/${jobId}`);
        const status = statusResponse.data.data.status;
        
        if (status === 'done') {
          console.log('✅ 생성 완료!');
          break;
        } else if (status === 'failed') {
          console.log('❌ 생성 실패');
          console.log(statusResponse.data.data.error_message);
          return;
        }
        
        console.log(`진행 중... (상태: ${status})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    };
    
    await checkStatus();
    
    // 5. 결과 확인
    const resultResponse = await axios.get(`${BASE_URL}/episodes/${episodeId}`);
    const episode = resultResponse.data.data;
    
    const finalWebtoon = episode.assets.final_webtoon[0];
    console.log(`최종 웹툰: ${finalWebtoon.path}`);
    console.log(`파일 크기: ${finalWebtoon.file_size} bytes`);
    
  } catch (error) {
    console.error('에러 발생:', error.response?.data || error.message);
  }
}

createWebtoon();
```

### PHP

```php
<?php

$baseUrl = 'http://localhost:8000/api';

// 1. 프로젝트 생성
$projectData = [
    'title' => 'PHP로 만든 웹툰',
    'genre' => '로맨스',
    'target_country' => 'KR',
    'tone' => '감성적인',
    'target_audience' => '20-30대',
    'keywords' => ['사랑', '이별', '재회'],
    'world_setting' => '현대 한국, 첫사랑을 다시 만난 이야기'
];

$ch = curl_init("$baseUrl/projects");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($projectData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$project = json_decode($response, true);
$projectId = $project['data']['id'];
echo "프로젝트 ID: $projectId\n";

// 2. 에피소드 생성
$episodeData = [
    'episode_number' => 1,
    'title' => '우연한 재회',
    'synopsis' => '10년 만에 첫사랑을 다시 만난다'
];

$ch = curl_init("$baseUrl/projects/$projectId/episodes");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($episodeData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$episode = json_decode($response, true);
$episodeId = $episode['data']['id'];
echo "에피소드 ID: $episodeId\n";

// 3. 웹툰 생성
$generationData = [
    'keywords' => ['재회', '설렘', '추억'],
    'target_word_count' => 1200,
    'target_panels' => 6
];

$ch = curl_init("$baseUrl/episodes/$episodeId/generate-full");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($generationData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$job = json_decode($response, true);
$jobId = $job['data']['job_id'];
echo "Job ID: $jobId\n";

// 4. 완료 대기
echo "웹툰 생성 중...\n";

while (true) {
    $ch = curl_init("$baseUrl/jobs/$jobId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $jobStatus = json_decode($response, true);
    $status = $jobStatus['data']['status'];
    
    if ($status === 'done') {
        echo "✅ 생성 완료!\n";
        break;
    } elseif ($status === 'failed') {
        echo "❌ 생성 실패\n";
        echo $jobStatus['data']['error_message'] . "\n";
        exit(1);
    }
    
    echo "진행 중... (상태: $status)\n";
    sleep(2);
}

// 5. 결과 확인
$ch = curl_init("$baseUrl/episodes/$episodeId");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$episodeResult = json_decode($response, true);
$finalWebtoon = $episodeResult['data']['assets']['final_webtoon'][0];

echo "최종 웹툰: {$finalWebtoon['path']}\n";
echo "파일 크기: {$finalWebtoon['file_size']} bytes\n";

?>
```

---

## 📞 지원

### 문서
- **사용 가이드**: `/var/www/toonverse/webapp/USER_GUIDE.md` (이 파일)
- **개발 완료 보고서**: `/var/www/toonverse/webapp/DEVELOPMENT_COMPLETE.md`
- **도메인 설정**: `/var/www/toonverse/webapp/DOMAIN_SETUP.md`

### 로그 확인
```bash
# Laravel API
tail -f /var/www/toonverse/webapp/backend-api/storage/logs/laravel.log

# Queue Worker
tail -f /var/www/toonverse/webapp/logs/queue.log

# AI Engines
tail -f /var/www/toonverse/webapp/logs/text-engine.log
tail -f /var/www/toonverse/webapp/logs/director-engine.log
tail -f /var/www/toonverse/webapp/logs/image-engine.log
tail -f /var/www/toonverse/webapp/logs/lettering-engine.log
tail -f /var/www/toonverse/webapp/logs/packaging-engine.log
```

### 서비스 관리
```bash
# 서비스 상태 확인
sudo supervisorctl status toonverse:*

# 서비스 재시작
sudo supervisorctl restart toonverse:*

# 개별 재시작
sudo supervisorctl restart toonverse-laravel
sudo supervisorctl restart toonverse-queue
```

---

**🎉 TOONVERSE로 당신만의 웹툰을 만들어보세요!**

**버전**: 1.0.0  
**최종 수정**: 2026-01-13  
**문의**: /var/www/toonverse/webapp/
