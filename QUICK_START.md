# ⚡ TOONVERSE 빠른 시작 가이드

**60초 안에 당신의 첫 웹툰을 만들어보세요!**

---

## 📋 준비 사항

- **API URL**: `http://localhost:8000/api/` (로컬) 또는 `http://toonverse.store/api/` (프로덕션)
- **도구**: `curl` (터미널)
- **소요 시간**: 약 90초 (생성 60초 + 대기 30초)

---

## 🚀 3단계로 웹툰 만들기

### Step 1: 프로젝트 생성 (5초)

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "나의 첫 웹툰",
    "genre": "판타지",
    "target_country": "KR",
    "tone": "흥미진진한",
    "target_audience": "10-20대",
    "keywords": ["모험", "성장", "마법"],
    "world_setting": "마법이 존재하는 현대 세계"
  }'
```

**응답에서 `id` 확인** (예: `"id": 1`)

---

### Step 2: 에피소드 생성 및 웹툰 자동 생성 (60초)

프로젝트 ID를 1로 가정:

```bash
# 에피소드 생성
curl -X POST http://localhost:8000/api/projects/1/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "시작",
    "synopsis": "평범한 학생이 마법의 힘을 얻게 된다"
  }'

# 웹툰 자동 생성 (60초 소요)
curl -X POST http://localhost:8000/api/episodes/1/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["마법", "각성", "시작"],
    "target_word_count": 1000,
    "target_panels": 4
  }'
```

**응답에서 `job_id` 확인** (예: `"job_id": 1`)

---

### Step 3: 결과 확인 (30초 후)

```bash
# 30초 대기
sleep 30

# Job 상태 확인
curl http://localhost:8000/api/jobs/1

# 완료 확인
curl http://localhost:8000/api/episodes/1
```

**최종 웹툰 경로**:
```
http://localhost:8000/storage/images/final/episode_001_final.png
```

또는 프로덕션:
```
http://toonverse.store/storage/images/final/episode_001_final.png
```

---

## 💡 원스텝 스크립트 (모든 단계 자동화)

```bash
#!/bin/bash

API_URL="http://localhost:8000/api"

echo "🚀 TOONVERSE 자동 웹툰 생성 시작..."

# 1. 프로젝트 생성
echo "📝 프로젝트 생성 중..."
PROJECT_ID=$(curl -s -X POST $API_URL/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "자동 생성 웹툰",
    "genre": "SF",
    "target_country": "KR",
    "tone": "신비로운",
    "target_audience": "전연령",
    "keywords": ["미래", "기술", "AI"],
    "world_setting": "AI가 지배하는 2050년"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo "✅ 프로젝트 생성 완료 (ID: $PROJECT_ID)"

# 2. 에피소드 생성
echo "📖 에피소드 생성 중..."
EPISODE_ID=$(curl -s -X POST $API_URL/projects/$PROJECT_ID/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "첫 에피소드",
    "synopsis": "AI의 각성"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

echo "✅ 에피소드 생성 완료 (ID: $EPISODE_ID)"

# 3. 웹툰 생성
echo "🎨 웹툰 자동 생성 중... (60초 소요)"
JOB_ID=$(curl -s -X POST $API_URL/episodes/$EPISODE_ID/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["AI", "각성", "미래"],
    "target_word_count": 1000,
    "target_panels": 4
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['job_id'])")

echo "⏳ Job 시작 (ID: $JOB_ID)"

# 4. 완료 대기
echo "⏰ 생성 완료 대기 중..."
for i in {1..120}; do
  STATUS=$(curl -s $API_URL/jobs/$JOB_ID | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['status'])")
  
  if [ "$STATUS" = "done" ]; then
    echo "✅ 웹툰 생성 완료!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ 생성 실패"
    exit 1
  fi
  
  if [ $(($i % 10)) -eq 0 ]; then
    echo "   진행 중... ($i/120초)"
  fi
  
  sleep 1
done

# 5. 결과 출력
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎊 웹툰 생성 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 프로젝트: $PROJECT_ID"
echo "📖 에피소드: $EPISODE_ID"
echo "🎯 Job: $JOB_ID"
echo ""
echo "🌐 웹툰 확인:"
echo "   http://localhost:8000/storage/images/final/episode_$(printf "%03d" $EPISODE_ID)_final.png"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
