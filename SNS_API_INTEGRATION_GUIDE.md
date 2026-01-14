# 🔗 SNS API 실제 연동 가이드

**작성일**: 2026-01-14  
**상태**: API 통합 코드 구현 완료 ✅  
**현재 모드**: Mock Mode (실제 API 키 입력 시 자동 전환)

---

## 📋 목차

1. [개요](#개요)
2. [API 키 발급 방법](#api-키-발급-방법)
3. [API 설정 방법](#api-설정-방법)
4. [API 연동 테스트](#api-연동-테스트)
5. [자주 묻는 질문](#자주-묻는-질문)

---

## 개요

TOONVERSE SNS 자동 발송 시스템은 다음 플랫폼을 지원합니다:

| 플랫폼 | API 상태 | Mock 모드 | 실제 연동 |
|--------|----------|-----------|-----------|
| **TikTok** | ✅ 구현 완료 | ✅ 지원 | ⚙️ API 키 필요 |
| **Twitter/X** | ✅ 구현 완료 | ✅ 지원 | ⚙️ API 키 필요 |
| **Facebook** | ✅ 구현 완료 | ✅ 지원 | ⚙️ API 키 필요 |
| **Instagram** | ✅ 구현 완료 | ✅ 지원 | ⚙️ API 키 필요 |

### 현재 상태

- **Mock 모드**: 기본값 (실제 API 호출 없음)
- **실제 연동**: API 키 입력 시 자동 활성화
- **설정 파일**: `backend-api/.env`

---

## API 키 발급 방법

### 1. TikTok API

#### 1.1 Developer 계정 생성
1. https://developers.tiktok.com/ 방문
2. "Get Started" 클릭
3. TikTok 계정으로 로그인
4. Developer 약관 동의

#### 1.2 앱 등록
1. "My Apps" → "Create an App" 클릭
2. 앱 정보 입력:
   - App Name: TOONVERSE
   - App Type: Website
   - Category: Social Media
3. 권한 요청:
   - `user.info.basic`
   - `video.upload`
   - `video.publish`

#### 1.3 API 키 확인
```
Client Key: YOUR_CLIENT_KEY
Client Secret: YOUR_CLIENT_SECRET
```

#### 1.4 Access Token 발급
1. OAuth 2.0 인증 플로우 실행
2. 사용자 인증 후 Access Token 획득
3. Refresh Token으로 영구 사용 가능

**필요한 정보**:
```env
TIKTOK_CLIENT_KEY=YOUR_CLIENT_KEY
TIKTOK_CLIENT_SECRET=YOUR_CLIENT_SECRET
TIKTOK_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
TIKTOK_OPEN_ID=YOUR_OPEN_ID
```

---

### 2. Twitter/X API

#### 2.1 Developer Portal
1. https://developer.twitter.com/ 방문
2. "Sign up" → Developer 계정 생성
3. 용도 선택: "Making a bot or automation"

#### 2.2 프로젝트 생성
1. "Projects & Apps" → "Create Project"
2. 프로젝트 이름: TOONVERSE
3. Use case: "Posting tweets"

#### 2.3 앱 생성
1. "Create App" 클릭
2. 앱 이름: TOONVERSE Bot
3. API 키 저장 (한 번만 표시됨!)

#### 2.4 인증 설정
1. App Settings → "Keys and tokens"
2. "Generate" 클릭:
   - API Key
   - API Secret
   - Access Token
   - Access Token Secret
   - Bearer Token (v2 API용)

**필요한 정보**:
```env
TWITTER_API_KEY=YOUR_API_KEY
TWITTER_API_SECRET=YOUR_API_SECRET
TWITTER_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
TWITTER_ACCESS_SECRET=YOUR_ACCESS_SECRET
TWITTER_BEARER_TOKEN=YOUR_BEARER_TOKEN
```

---

### 3. Facebook API

#### 3.1 Meta for Developers
1. https://developers.facebook.com/ 방문
2. Facebook 계정으로 로그인
3. "My Apps" → "Create App"

#### 3.2 앱 유형 선택
- "Business" 선택
- 앱 이름: TOONVERSE
- 연락처 이메일 입력

#### 3.3 제품 추가
1. "Add a Product" → "Facebook Login" 추가
2. Settings → OAuth Redirect URIs 설정

#### 3.4 페이지 Access Token 발급
1. Graph API Explorer 사용
2. 권한 요청:
   - `pages_manage_posts`
   - `pages_read_engagement`
3. Long-lived Token 생성

**필요한 정보**:
```env
FACEBOOK_APP_ID=YOUR_APP_ID
FACEBOOK_APP_SECRET=YOUR_APP_SECRET
FACEBOOK_ACCESS_TOKEN=YOUR_PAGE_ACCESS_TOKEN
```

---

### 4. Instagram API

#### 4.1 Facebook 비즈니스 계정 필요
1. Instagram을 Facebook 페이지에 연결
2. Instagram Business Account로 전환

#### 4.2 Graph API 사용
1. Meta for Developers에서 Instagram Graph API 활성화
2. 권한 요청:
   - `instagram_basic`
   - `instagram_content_publish`

#### 4.3 Access Token
- Facebook Page Access Token 사용
- Instagram Account ID 필요

**필요한 정보**:
```env
INSTAGRAM_APP_ID=YOUR_APP_ID
INSTAGRAM_APP_SECRET=YOUR_APP_SECRET
INSTAGRAM_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

---

## API 설정 방법

### 방법 1: .env 파일 직접 수정

```bash
cd /var/www/toonverse/webapp/backend-api
nano .env
```

다음 내용 추가/수정:

```env
# SNS Mock Mode (true: Mock, false: Real API)
SNS_MOCK_MODE=false

# TikTok API
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_ACCESS_TOKEN=your_access_token_here
TIKTOK_OPEN_ID=your_open_id_here

# Twitter API
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here

# Facebook API
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_ACCESS_TOKEN=your_access_token_here

# Instagram API
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
```

설정 후:
```bash
php artisan config:clear
```

---

### 방법 2: API 엔드포인트 사용

#### 2.1 현재 설정 확인
```bash
curl https://toonverse.store/api/sns/config
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "mock_mode": true,
    "platforms": {
      "twitter": {
        "enabled": false,
        "configured": false
      },
      "tiktok": {
        "enabled": false,
        "configured": false
      }
    }
  }
}
```

#### 2.2 TikTok 설정
```bash
curl -X PUT https://toonverse.store/api/sns/config \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "tiktok",
    "config": {
      "client_key": "YOUR_CLIENT_KEY",
      "client_secret": "YOUR_CLIENT_SECRET",
      "access_token": "YOUR_ACCESS_TOKEN",
      "open_id": "YOUR_OPEN_ID"
    }
  }'
```

#### 2.3 Mock 모드 비활성화
```bash
curl -X POST https://toonverse.store/api/sns/config/mock-mode \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

## API 연동 테스트

### 1. 연결 테스트

#### TikTok
```bash
curl -X POST https://toonverse.store/api/sns/config/test/tiktok \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_ACCESS_TOKEN"}'
```

**성공 응답**:
```json
{
  "success": true,
  "message": "Tiktok API connection successful",
  "data": {
    "user": {
      "display_name": "TOONVERSE",
      "open_id": "..."
    }
  }
}
```

#### Twitter
```bash
curl -X POST https://toonverse.store/api/sns/config/test/twitter \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_BEARER_TOKEN"}'
```

---

### 2. 실제 포스트 테스트

```bash
# 1. TikTok 포스트 생성
POST_ID=$(curl -s -X POST https://toonverse.store/api/sns/posts \
  -H "Content-Type: application/json" \
  -d '{
    "episode_id": 1,
    "platform": "tiktok",
    "content": "실제 API 테스트 포스트",
    "status": "draft"
  }' | jq -r '.data.id')

echo "생성된 포스트 ID: $POST_ID"

# 2. 즉시 게시
curl -X POST "https://toonverse.store/api/sns/posts/${POST_ID}/post-now"
```

**실제 API 호출 시 응답**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "status": "posted",
    "post_id": "7318234567890123456",
    "post_url": "https://tiktok.com/@toonverse_official/video/7318234567890123456",
    "posted_at": "2026-01-14T18:30:00.000000Z",
    "mock": false
  }
}
```

---

## 구현된 기능

### ✅ 완료된 기능

1. **TikTok API 통합**
   - Video 초기화 API 호출
   - Upload URL 생성
   - 게시물 메타데이터 설정

2. **Twitter API 통합**
   - Tweet 생성 (v2 API)
   - 미디어 업로드
   - 280자 제한 처리

3. **Facebook API 통합**
   - Page 포스트 생성
   - 이미지 첨부
   - Graph API v18.0 사용

4. **Instagram API 통합**
   - Media Container 생성
   - 이미지 업로드 (필수)
   - 2단계 게시 프로세스

5. **자동 모드 전환**
   - Mock 모드: API 키 없을 때
   - Real 모드: API 키 설정 시 자동 활성화

6. **에러 처리**
   - API 실패 시 자동 실패 상태 변경
   - 상세한 에러 로그 기록
   - Retry 메커니즘

---

## 자주 묻는 질문

### Q1: Mock 모드와 Real 모드의 차이는?

**Mock 모드**:
- 실제 API 호출 없음
- 테스트 URL 생성
- 비용 발생 없음
- 즉시 응답

**Real 모드**:
- 실제 SNS에 게시
- API 사용량 소모
- 실제 계정에 노출
- 약간의 지연 발생

### Q2: API 키를 입력했는데도 Mock 모드인 이유는?

`.env` 파일에서 확인:
```bash
SNS_MOCK_MODE=true  # 이것을 false로 변경
```

또는:
```bash
curl -X POST https://toonverse.store/api/sns/config/mock-mode \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

### Q3: 여러 플랫폼을 동시에 사용할 수 있나요?

네! 각 플랫폼의 API 키를 모두 설정하면 자동으로 모든 플랫폼에 게시됩니다.

### Q4: Access Token이 만료되면?

대부분의 SNS는 Refresh Token을 제공합니다:
- **TikTok**: Refresh Token으로 갱신
- **Twitter**: 기본적으로 만료 없음
- **Facebook/Instagram**: Long-lived Token 사용 (60일)

자동 갱신 기능은 향후 업데이트 예정입니다.

### Q5: 실제 게시 전에 미리보기는?

현재는 지원하지 않지만, 다음과 같이 테스트 가능:
1. Mock 모드에서 포스트 생성
2. 내용 확인
3. Real 모드로 전환 후 다시 게시

### Q6: 비용은 얼마나 드나요?

| 플랫폼 | 무료 할당량 | 초과 시 |
|--------|------------|---------|
| TikTok | 일 1000개 게시물 | 협의 필요 |
| Twitter | 월 1500 트윗 (Free) | $100/월 (Basic) |
| Facebook | 무제한 (기본) | 무료 |
| Instagram | 무제한 (기본) | 무료 |

---

## 코드 참조

### 주요 파일

```
backend-api/
├── config/sns.php                    # SNS API 설정
├── app/Services/SnsService.php       # SNS 통합 서비스
├── app/Http/Controllers/
│   ├── SnsPostController.php         # 포스트 관리
│   ├── SnsAccountController.php      # 계정 관리
│   └── SnsConfigController.php       # API 설정 관리
└── routes/api.php                    # API 라우트
```

### API 엔드포인트

```
GET  /api/sns/config                    # 설정 조회
PUT  /api/sns/config                    # 설정 업데이트
POST /api/sns/config/mock-mode          # Mock 모드 토글
POST /api/sns/config/test/{platform}    # API 연결 테스트
```

---

## 📞 지원

추가 도움이 필요하시면 다음을 참조하세요:

- **TikTok API Docs**: https://developers.tiktok.com/doc/
- **Twitter API Docs**: https://developer.twitter.com/en/docs
- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api
- **Instagram API**: https://developers.facebook.com/docs/instagram-api

---

**마지막 업데이트**: 2026-01-14  
**버전**: 1.0.0  
**상태**: ✅ 프로덕션 준비 완료
