#!/bin/bash

API_URL="https://toonverse.store/api"

echo "=== 전체 TikTok 워크플로우 테스트 ==="
echo ""

# 1. TikTok 계정 추가
echo "1. TikTok 계정 추가..."
ACCOUNT_RESPONSE=$(curl -s -X POST "${API_URL}/sns/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "account_name": "@toonverse_official",
    "account_id": "toonverse_tiktok",
    "access_token": "mock_tiktok_token_12345",
    "is_active": true
  }')

echo "$ACCOUNT_RESPONSE" | jq '.'
ACCOUNT_ID=$(echo "$ACCOUNT_RESPONSE" | jq -r '.data.id // empty')
echo ""

# 2. TikTok 포스트 생성
echo "2. TikTok 포스트 생성..."
POST_RESPONSE=$(curl -s -X POST "${API_URL}/sns/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "episode_id": 1,
    "platform": "tiktok",
    "content": "🔥 악당이지만 정의로운 EP.1 🔥\n\n새로운 이야기가 시작됩니다!\n\n✨ 지금 바로 확인! ✨\n\n#판타지액션 #웹툰 #TOONVERSE #추천 #꿀잼",
    "scheduled_at": null,
    "status": "draft"
  }')

echo "$POST_RESPONSE" | jq '.'
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.data.id // empty')
echo ""

# 3. 즉시 게시
if [ ! -z "$POST_ID" ]; then
  echo "3. TikTok 포스트 즉시 게시 (Mock 모드)..."
  PUBLISH_RESPONSE=$(curl -s -X POST "${API_URL}/sns/posts/${POST_ID}/post-now")
  echo "$PUBLISH_RESPONSE" | jq '.'
  echo ""
  
  echo "4. 게시 후 포스트 상태..."
  curl -s "${API_URL}/sns/posts/${POST_ID}" | jq '.data | {
    id,
    platform,
    status,
    posted_at,
    post_url,
    post_id
  }'
  echo ""
fi

# 5. TikTok 통계 확인
echo "5. SNS 통계 확인..."
curl -s "${API_URL}/sns/statistics" | jq '.data.by_platform'
echo ""

echo "=== 테스트 완료 ==="
echo ""
echo "📝 결과 요약:"
echo "- TikTok 계정: ${ACCOUNT_ID:-생성 실패}"
echo "- TikTok 포스트: ${POST_ID:-생성 실패}"
echo "- 게시 상태: $(curl -s "${API_URL}/sns/posts/${POST_ID}" | jq -r '.data.status')"
echo ""
echo "⚠️  참고: 현재는 Mock 모드로 실제 TikTok에 올라가지 않습니다."
echo "   실제 연동을 위해서는 TikTok API 키가 필요합니다."
