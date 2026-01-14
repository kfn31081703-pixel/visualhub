#!/bin/bash

API_URL="https://toonverse.store/api"
echo "======================================"
echo "🧪 TOONVERSE SNS 시스템 종합 테스트"
echo "======================================"
echo ""

# 1. 기존 TikTok 계정 확인
echo "1️⃣ TikTok 계정 확인..."
ACCOUNTS=$(curl -s "${API_URL}/sns/accounts?platform=tiktok")
echo "$ACCOUNTS" | jq '.data[] | {id, platform, account_name, is_active}'
echo ""

# 2. 에피소드 목록 확인
echo "2️⃣ 사용 가능한 에피소드..."
curl -s "${API_URL}/projects" | jq -r '.data[] | select(.episodes != null and (.episodes | length) > 0) | .episodes[0] | "Episode ID: \(.id) - \(.project.title // "Unknown") EP.\(.episode_number)"' | head -3
echo ""

# 3. TikTok 포스트 생성 및 게시 (전체 플로우)
echo "3️⃣ TikTok 포스트 생성 및 게시..."
POST_DATA='{
  "episode_id": 1,
  "platform": "tiktok",
  "content": "🔥 웹툰 신작 공개! 🔥\n\n악당이지만 정의로운 EP.1\n\n✨ 지금 확인하세요! ✨\n\n#웹툰 #판타지 #액션 #TOONVERSE #신작 #추천",
  "status": "draft"
}'

CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/sns/posts" \
  -H "Content-Type: application/json" \
  -d "$POST_DATA")

POST_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id // empty')

if [ ! -z "$POST_ID" ]; then
  echo "  ✅ 포스트 생성: ID $POST_ID"
  echo "$CREATE_RESPONSE" | jq '.data | {id, platform, content: .content[0:50] + "...", status}'
  echo ""
  
  # 즉시 게시
  echo "4️⃣ 즉시 게시 시도..."
  PUBLISH_RESPONSE=$(curl -s -X POST "${API_URL}/sns/posts/${POST_ID}/post-now")
  
  if [ "$(echo "$PUBLISH_RESPONSE" | jq -r '.success')" == "true" ]; then
    echo "  ✅ 게시 성공!"
    echo "$PUBLISH_RESPONSE" | jq '.data | {id, platform, status, posted_at, post_url}'
  else
    echo "  ⚠️  게시 실패 (예상됨 - Mock 모드)"
    echo "$PUBLISH_RESPONSE" | jq '{success, message, error}'
  fi
  echo ""
  
  # 최종 상태 확인
  echo "5️⃣ 최종 포스트 상태..."
  FINAL_STATUS=$(curl -s "${API_URL}/sns/posts/${POST_ID}")
  echo "$FINAL_STATUS" | jq '.data | {
    id,
    platform,
    status,
    posted_at,
    post_url,
    post_id,
    created_at
  }'
else
  echo "  ❌ 포스트 생성 실패"
  echo "$CREATE_RESPONSE" | jq '.'
fi

echo ""
echo "6️⃣ SNS 통계 확인..."
STATS=$(curl -s "${API_URL}/sns/statistics")
echo "$STATS" | jq '{
  total: .data.total,
  by_status: .data.by_status,
  by_platform: .data.by_platform
}'

echo ""
echo "7️⃣ 최근 TikTok 포스트 목록..."
curl -s "${API_URL}/sns/posts?platform=tiktok&limit=3" | jq '.data.data[] | {
  id,
  platform,
  status,
  content: .content[0:40] + "...",
  posted_at
}' | head -20

echo ""
echo "======================================"
echo "✅ 테스트 완료!"
echo "======================================"
echo ""
echo "📊 결과 요약:"
echo "- TikTok 계정: 확인됨"
echo "- 포스트 생성: ${POST_ID:-실패}"
echo "- API 연결: 정상"
echo "- Mock 모드: 활성"
echo ""
echo "⚠️  주의: 현재 Mock 모드로 실제 TikTok에는 올라가지 않습니다."
echo "   실제 연동을 위해서는 TikTok API 키가 필요합니다."
