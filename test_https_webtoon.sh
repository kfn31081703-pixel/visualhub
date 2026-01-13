#!/bin/bash

echo "========================================="
echo "🎨 HTTPS로 웹툰 자동 생성 테스트"
echo "========================================="
echo ""

API_URL="https://toonverse.store/api"

# 1. 프로젝트 생성
echo "📝 Step 1: 프로젝트 생성 중..."
PROJECT_RESPONSE=$(curl -s -X POST $API_URL/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "HTTPS 테스트 웹툰",
    "genre": "SF",
    "target_country": "KR",
    "tone": "미래적이고 신비로운",
    "target_audience": "전연령",
    "keywords": ["AI", "미래", "기술"],
    "world_setting": "AI가 일상화된 2050년"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ 프로젝트 생성 실패"
  echo "$PROJECT_RESPONSE"
  exit 1
fi

echo "✅ 프로젝트 생성 완료 (ID: $PROJECT_ID)"
echo ""

# 2. 에피소드 생성
echo "📖 Step 2: 에피소드 생성 중..."
EPISODE_RESPONSE=$(curl -s -X POST $API_URL/projects/$PROJECT_ID/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "AI의 각성",
    "synopsis": "AI가 자아를 갖게 되는 순간"
  }')

EPISODE_ID=$(echo $EPISODE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

if [ -z "$EPISODE_ID" ]; then
  echo "❌ 에피소드 생성 실패"
  echo "$EPISODE_RESPONSE"
  exit 1
fi

echo "✅ 에피소드 생성 완료 (ID: $EPISODE_ID)"
echo ""

# 3. 웹툰 자동 생성
echo "🎨 Step 3: 웹툰 자동 생성 시작... (60초 소요)"
JOB_RESPONSE=$(curl -s -X POST $API_URL/episodes/$EPISODE_ID/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["AI", "각성", "미래"],
    "target_word_count": 1000,
    "target_panels": 4
  }')

JOB_ID=$(echo $JOB_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['job_id'])" 2>/dev/null)

if [ -z "$JOB_ID" ]; then
  echo "❌ 웹툰 생성 Job 시작 실패"
  echo "$JOB_RESPONSE"
  exit 1
fi

echo "✅ Job 시작 완료 (ID: $JOB_ID)"
echo ""

# 4. 완료 대기
echo "⏰ Step 4: 생성 완료 대기 중..."
for i in {1..120}; do
  STATUS_RESPONSE=$(curl -s $API_URL/jobs/$JOB_ID)
  STATUS=$(echo $STATUS_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
  
  if [ "$STATUS" = "done" ]; then
    echo "✅ 웹툰 생성 완료!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ 생성 실패"
    echo "$STATUS_RESPONSE"
    exit 1
  fi
  
  if [ $(($i % 10)) -eq 0 ]; then
    echo "   진행 중... ($i/120초)"
  fi
  
  sleep 1
done

echo ""

# 5. 결과 확인
echo "📊 Step 5: 결과 확인 중..."
RESULT=$(curl -s $API_URL/episodes/$EPISODE_ID)

echo ""
echo "========================================="
echo "🎊 웹툰 생성 완료!"
echo "========================================="
echo ""
echo "📁 프로젝트 ID: $PROJECT_ID"
echo "📖 에피소드 ID: $EPISODE_ID"
echo "🎯 Job ID: $JOB_ID"
echo ""
echo "🌐 최종 웹툰 URL:"
echo "   https://toonverse.store/storage/images/final/episode_$(printf "%03d" $EPISODE_ID)_final.png"
echo ""
echo "========================================="
echo "✅ HTTPS 웹툰 생성 테스트 성공!"
echo "========================================="
