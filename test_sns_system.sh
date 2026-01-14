#!/bin/bash

API_URL="http://localhost:8000/api"

echo "==================================="
echo "SNS 자동 홍보 시스템 테스트"
echo "==================================="
echo ""

# 1. SNS 계정 추가
echo "1. SNS 계정 추가 중..."
echo "   - Twitter 계정 추가"
curl -s -X POST "$API_URL/sns/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "account_name": "@ToonverseOfficial",
    "account_id": "toonverse_twitter",
    "is_active": true
  }' | jq '.'

echo ""
echo "   - Facebook 계정 추가"
curl -s -X POST "$API_URL/sns/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "facebook",
    "account_name": "Toonverse Official",
    "account_id": "toonverse_fb",
    "is_active": true
  }' | jq '.'

echo ""
echo "   - Instagram 계정 추가"
curl -s -X POST "$API_URL/sns/accounts" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "account_name": "@toonverse_official",
    "account_id": "toonverse_ig",
    "is_active": true
  }' | jq '.'

echo ""
echo "2. SNS 계정 목록 확인"
curl -s "$API_URL/sns/accounts" | jq '.data[] | {id, platform, account_name, is_active}'

echo ""
echo ""
echo "3. 에피소드 #1에 대한 SNS 포스트 생성 중..."
curl -s -X POST "$API_URL/sns/posts/episode" \
  -H "Content-Type: application/json" \
  -d '{
    "episode_id": 1,
    "auto_schedule": true
  }' | jq '.'

echo ""
echo ""
echo "4. SNS 포스트 목록 확인"
curl -s "$API_URL/sns/posts" | jq '.data.data[] | {id, platform, status, episode: .episode.episode_number, scheduled_at}'

echo ""
echo ""
echo "5. SNS 통계 확인"
curl -s "$API_URL/sns/posts/statistics" | jq '.data'

echo ""
echo ""
echo "==================================="
echo "테스트 완료!"
echo "==================================="
echo ""
echo "다음 URL에서 확인하세요:"
echo "- SNS 관리: https://www.toonverse.store/admin/sns"
echo "- SNS 계정: https://www.toonverse.store/admin/sns/accounts"
echo ""
