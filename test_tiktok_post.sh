#!/bin/bash

API_URL="https://toonverse.store/api"

echo "=== TikTok SNS 포스트 생성 테스트 ==="
echo ""

# 1. 에피소드 목록 확인
echo "1. 사용 가능한 에피소드 확인..."
curl -s "${API_URL}/projects" | jq -r '.data[] | select(.episodes != null) | .episodes[] | "\(.id) - \(.project.title // "Unknown") 에피소드 \(.episode_number)화"' | head -5
echo ""

# 2. TikTok 포스트 생성 (Episode ID 1 사용)
echo "2. TikTok 포스트 생성 중..."
RESPONSE=$(curl -s -X POST "${API_URL}/sns/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "episode_id": 1,
    "platform": "tiktok",
    "content": "🔥 새로운 에피소드 공개! 🔥\n\n악당이지만 정의로운 - 1화\n\n지금 바로 확인하세요! ✨\n\n#액션 #웹툰 #TOONVERSE #추천",
    "scheduled_at": null,
    "status": "draft"
  }')

echo "$RESPONSE" | jq '.'
echo ""

# 3. 생성된 포스트 확인
POST_ID=$(echo "$RESPONSE" | jq -r '.data.id // empty')

if [ ! -z "$POST_ID" ]; then
  echo "3. 생성된 포스트 (ID: $POST_ID) 확인..."
  curl -s "${API_URL}/sns/posts/${POST_ID}" | jq '.data | {id, episode_id, platform, content, status, scheduled_at}'
  echo ""
  
  echo "4. 즉시 게시 테스트..."
  curl -s -X POST "${API_URL}/sns/posts/${POST_ID}/post-now" | jq '.'
  echo ""
  
  echo "5. 게시 후 상태 확인..."
  curl -s "${API_URL}/sns/posts/${POST_ID}" | jq '.data | {id, platform, status, posted_at, post_url}'
else
  echo "❌ 포스트 생성 실패"
fi

echo ""
echo "=== 테스트 완료 ==="
