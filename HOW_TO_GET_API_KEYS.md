# 🔑 SNS API 키 발급 완벽 가이드

**최종 업데이트**: 2026-01-14  
**난이도**: 초보자도 가능 ⭐⭐⭐  
**소요 시간**: 플랫폼당 약 15-30분

---

## 📋 목차

1. [TikTok API 키 발급](#1-tiktok-api-키-발급) ⭐ 가장 많이 찾는 정보
2. [Twitter/X API 키 발급](#2-twitterx-api-키-발급)
3. [Facebook API 키 발급](#3-facebook-api-키-발급)
4. [Instagram API 키 발급](#4-instagram-api-키-발급)
5. [발급 후 설정 방법](#5-발급-후-설정-방법)

---

## 1. TikTok API 키 발급

### 🎯 필요한 것
- TikTok 계정 (개인 또는 비즈니스)
- 이메일 주소
- 웹사이트 또는 앱 정보

### 📝 단계별 가이드

#### Step 1: TikTok for Developers 가입

1. **웹사이트 접속**
   ```
   https://developers.tiktok.com/
   ```

2. **"Get Started" 또는 "Sign Up" 클릭**
   
   ![TikTok Developer Portal](https://developers.tiktok.com/)

3. **TikTok 계정으로 로그인**
   - 기존 TikTok 계정 사용
   - 없으면 새로 생성

4. **Developer 약관 동의**
   - Terms of Service 읽기
   - Privacy Policy 동의
   - "I Agree" 클릭

---

#### Step 2: 앱 생성

1. **"My Apps" 메뉴로 이동**
   ```
   https://developers.tiktok.com/apps
   ```

2. **"Create an App" 버튼 클릭**

3. **앱 정보 입력**
   ```
   App Name: TOONVERSE
   App Category: Entertainment & Performance
   Description: AI-powered webtoon creation and social media automation platform
   ```

4. **앱 아이콘 업로드** (선택사항)
   - 512x512 PNG 이미지
   - TOONVERSE 로고 사용

5. **Platform 선택**
   - ✅ **Web** (필수 선택)
   - Website URL: `https://www.toonverse.store`
   - Redirect URI: `https://www.toonverse.store/callback`

---

#### Step 3: API 권한 요청

1. **"Add Products" 클릭**

2. **필요한 권한 선택**
   ```
   ✅ Login Kit (사용자 인증)
   ✅ Content Posting API (비디오 업로드)
   ```

3. **Scopes (권한 범위) 선택**
   ```
   ✅ user.info.basic - 기본 사용자 정보
   ✅ video.upload - 비디오 업로드
   ✅ video.publish - 비디오 게시
   ```

4. **Use Case 설명 작성**
   ```
   We are building an AI-powered webtoon creation platform that automatically 
   posts new episodes to TikTok. Our system will:
   - Upload webtoon episode previews as videos
   - Post promotional content for new releases
   - Schedule posts for optimal engagement times
   ```

5. **"Submit for Review" 클릭**
   - 승인까지 1-3일 소요
   - 이메일로 승인 알림

---

#### Step 4: API 키 확인

1. **"My Apps" → 생성한 앱 클릭**

2. **"Basic Information" 탭에서 확인**
   ```
   Client Key: awxxxxxxxxxxxxxxxxxx
   Client Secret: yyyyyyyyyyyyyyyyyyyy
   ```

3. **📋 복사해서 안전한 곳에 저장**
   - ⚠️ Client Secret은 한 번만 표시됨!
   - 메모장이나 비밀번호 관리자에 저장

---

#### Step 5: Access Token 발급

**방법 A: OAuth 2.0 인증 플로우 (권장)**

1. **인증 URL 생성**
   ```
   https://www.tiktok.com/v2/auth/authorize/
   ?client_key=YOUR_CLIENT_KEY
   &scope=user.info.basic,video.upload,video.publish
   &response_type=code
   &redirect_uri=https://www.toonverse.store/callback
   &state=random_string
   ```

2. **브라우저에서 URL 접속**
   - TikTok 로그인
   - 권한 승인
   - Redirect URI로 이동 (Authorization Code 획득)

3. **Authorization Code로 Access Token 교환**
   ```bash
   curl -X POST "https://open.tiktokapis.com/v2/oauth/token/" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_key=YOUR_CLIENT_KEY" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=AUTHORIZATION_CODE" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=https://www.toonverse.store/callback"
   ```

4. **응답에서 Access Token 확인**
   ```json
   {
     "access_token": "act.example_access_token",
     "refresh_token": "rft.example_refresh_token",
     "expires_in": 86400,
     "open_id": "example_open_id",
     "scope": "user.info.basic,video.upload,video.publish"
   }
   ```

**방법 B: Sandbox 테스트 계정 (개발용)**

1. **Developer Portal → "Sandbox" 메뉴**
2. **"Create Test Account" 클릭**
3. **테스트 Access Token 즉시 발급**
   - 실제 게시는 안 되지만 API 테스트 가능

---

#### 🎯 최종 확인

다음 4가지 정보를 확보했는지 확인:

```
✅ Client Key: awxxxxxxxxxxxxxxxxxx
✅ Client Secret: yyyyyyyyyyyyyyyyyyyy
✅ Access Token: act.example_access_token
✅ Open ID: example_open_id
```

---

## 2. Twitter/X API 키 발급

### 🎯 필요한 것
- Twitter 계정
- 전화번호 인증
- 이메일 주소

### 📝 단계별 가이드

#### Step 1: Developer Portal 가입

1. **웹사이트 접속**
   ```
   https://developer.twitter.com/
   ```

2. **"Sign up" 클릭**
   - Twitter 계정으로 로그인
   - 아직 없으면 계정 생성

3. **개발자 계정 유형 선택**
   ```
   ✅ Hobbyist (무료)
   → Making a bot (봇 만들기)
   ```

4. **기본 정보 입력**
   ```
   Country: South Korea
   Use Case: Building a social media automation tool
   Will you make Twitter content available to government entities: No
   ```

5. **상세 설명 작성** (최소 200자)
   ```
   I am developing TOONVERSE, an AI-powered webtoon creation platform. 
   The bot will automatically post new webtoon episodes and promotional 
   content to our Twitter account. Features include:
   
   1. Automated posting of new episode releases
   2. Scheduled promotional tweets with episode thumbnails
   3. Engagement with followers through automated responses
   4. Analytics tracking for post performance
   
   The bot will only post to our own account (@ToonverseOfficial) 
   and will not spam or violate Twitter's automation rules.
   ```

6. **약관 동의 후 "Submit" 클릭**

7. **이메일 인증**
   - 받은 편지함 확인
   - 인증 링크 클릭

---

#### Step 2: 앱 생성

1. **Developer Portal 대시보드**
   ```
   https://developer.twitter.com/en/portal/dashboard
   ```

2. **"Projects & Apps" → "Create Project"**

3. **프로젝트 정보 입력**
   ```
   Project Name: TOONVERSE Social Media
   Use Case: Posting tweets
   Project Description: Automated webtoon episode posting
   ```

4. **"Create App" 클릭**
   ```
   App Name: TOONVERSE Bot
   ```

5. **API 키 저장** (⚠️ 한 번만 표시!)
   ```
   API Key: xxxxxxxxxxxxxxxxxxxx
   API Secret Key: yyyyyyyyyyyyyyyyyyyy
   Bearer Token: zzzzzzzzzzzzzzzzzzz
   ```
   - 📋 즉시 복사해서 안전한 곳에 저장!

---

#### Step 3: Access Token 생성

1. **앱 설정 페이지**
   ```
   Projects & Apps → Your App → "Keys and tokens"
   ```

2. **"Access Token and Secret" 섹션**
   - "Generate" 버튼 클릭

3. **권한 레벨 선택**
   ```
   ✅ Read and Write
   (또는 Read, Write, and Direct Messages)
   ```

4. **Access Token 저장**
   ```
   Access Token: 1234567890-xxxxxxxxxxxxxxxxxxxxx
   Access Token Secret: yyyyyyyyyyyyyyyyyyyy
   ```

---

#### Step 4: API v2 활성화

1. **App Settings → "User authentication settings"**

2. **"Set up" 클릭**

3. **OAuth 2.0 설정**
   ```
   Type of App: Web App
   Callback URI: https://www.toonverse.store/callback
   Website URL: https://www.toonverse.store
   ```

4. **"Save" 클릭**

---

#### 🎯 최종 확인

```
✅ API Key: xxxxxxxxxxxxxxxxxxxx
✅ API Secret: yyyyyyyyyyyyyyyyyyyy
✅ Bearer Token: zzzzzzzzzzzzzzzzzzz
✅ Access Token: 1234567890-xxxxxxxxxxxxxxxxxxxxx
✅ Access Token Secret: yyyyyyyyyyyyyyyyyyyy
```

---

## 3. Facebook API 키 발급

### 🎯 필요한 것
- Facebook 계정
- Facebook 페이지 (필수!)
- 이메일 주소

### 📝 단계별 가이드

#### Step 1: Facebook 페이지 생성 (없는 경우)

1. **Facebook 페이지 만들기**
   ```
   https://www.facebook.com/pages/create
   ```

2. **페이지 정보 입력**
   ```
   Page Name: TOONVERSE
   Category: Entertainment Website
   Description: AI-powered webtoon creation platform
   ```

3. **페이지 ID 확인**
   - 페이지 설정 → "About" → Page ID 복사
   - 예: `123456789012345`

---

#### Step 2: Meta for Developers 가입

1. **웹사이트 접속**
   ```
   https://developers.facebook.com/
   ```

2. **"Get Started" 클릭**
   - Facebook 계정으로 로그인

3. **개발자 등록**
   - 이름 확인
   - 이메일 인증
   - 전화번호 인증 (선택)

---

#### Step 3: 앱 생성

1. **"My Apps" → "Create App"**

2. **앱 유형 선택**
   ```
   ✅ Business (비즈니스)
   ```

3. **앱 정보 입력**
   ```
   App Display Name: TOONVERSE
   App Contact Email: your-email@example.com
   Business Account: (선택사항)
   ```

4. **"Create App" 클릭**

5. **App ID & App Secret 확인**
   ```
   Settings → Basic
   App ID: 1234567890123456
   App Secret: [Show] 클릭하여 확인
   ```

---

#### Step 4: Facebook Login 추가

1. **"Add a Product" → "Facebook Login" 선택**

2. **"Settings" 클릭**

3. **OAuth 설정**
   ```
   Valid OAuth Redirect URIs:
   https://www.toonverse.store/callback
   https://www.toonverse.store/auth/facebook/callback
   ```

4. **"Save Changes"**

---

#### Step 5: Page Access Token 발급

**방법 A: Graph API Explorer 사용 (간단)**

1. **Graph API Explorer 접속**
   ```
   https://developers.facebook.com/tools/explorer/
   ```

2. **앱 선택**
   - 드롭다운에서 "TOONVERSE" 선택

3. **권한 추가**
   - "Add a Permission" 클릭
   ```
   ✅ pages_manage_posts
   ✅ pages_read_engagement
   ✅ pages_read_user_content
   ```

4. **"Generate Access Token" 클릭**
   - Facebook 로그인
   - 권한 승인

5. **User Access Token → Page Access Token 변환**
   ```
   GET /me/accounts
   ```
   - "Submit" 클릭
   - 페이지 목록에서 TOONVERSE 페이지의 `access_token` 복사

**방법 B: Access Token Tool 사용**

1. **Access Token Tool 접속**
   ```
   https://developers.facebook.com/tools/accesstoken/
   ```

2. **User Token → Page Token**
   - "Get Page Access Token" 클릭
   - 페이지 선택
   - 권한 승인

3. **Long-Lived Token으로 변환**
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token" \
     -d "grant_type=fb_exchange_token" \
     -d "client_id=YOUR_APP_ID" \
     -d "client_secret=YOUR_APP_SECRET" \
     -d "fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

---

#### 🎯 최종 확인

```
✅ App ID: 1234567890123456
✅ App Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
✅ Page Access Token: EAAxxxxxxxxxxxxxxxxxxxxxx (60일 유효)
✅ Page ID: 123456789012345
```

---

## 4. Instagram API 키 발급

### 🎯 필요한 것
- Instagram 계정 (비즈니스 계정으로 전환 필요)
- Facebook 페이지 연결
- Facebook 앱 (위 Step 3에서 생성)

### 📝 단계별 가이드

#### Step 1: Instagram 비즈니스 계정 전환

1. **Instagram 앱에서**
   ```
   Settings → Account → Switch to Professional Account
   ```

2. **계정 유형 선택**
   ```
   ✅ Business
   Category: Publisher
   ```

3. **Facebook 페이지 연결**
   - "Connect to Facebook Page" 선택
   - TOONVERSE 페이지 선택

---

#### Step 2: Instagram Graph API 활성화

1. **Meta for Developers → 생성한 앱**
   ```
   https://developers.facebook.com/apps/YOUR_APP_ID/
   ```

2. **"Add a Product" → "Instagram" 추가**

3. **Instagram Basic Display 설정**
   - "Create New App" 클릭
   - OAuth Redirect URI 입력:
   ```
   https://www.toonverse.store/callback
   ```

---

#### Step 3: Instagram Account ID 확인

1. **Graph API Explorer**
   ```
   https://developers.facebook.com/tools/explorer/
   ```

2. **쿼리 실행**
   ```
   GET /me/accounts?fields=instagram_business_account
   ```

3. **응답에서 Instagram Account ID 확인**
   ```json
   {
     "data": [
       {
         "instagram_business_account": {
           "id": "17841400000000000"
         },
         "id": "123456789012345"
       }
     ]
   }
   ```

---

#### Step 4: Access Token 설정

Instagram은 **Facebook Page Access Token**을 사용합니다!

- 위 Facebook 섹션에서 발급한 Page Access Token 사용
- 추가 토큰 발급 불필요

---

#### 🎯 최종 확인

```
✅ App ID: (Facebook App ID와 동일)
✅ App Secret: (Facebook App Secret과 동일)
✅ Access Token: (Facebook Page Access Token 사용)
✅ Instagram Account ID: 17841400000000000
```

---

## 5. 발급 후 설정 방법

### 방법 A: 관리자 페이지에서 설정 (추천)

1. **API 설정 페이지 접속**
   ```
   https://www.toonverse.store/admin/sns/config
   ```

2. **TikTok 설정**
   ```
   Client Key: [발급받은 Client Key 입력]
   Client Secret: [발급받은 Client Secret 입력]
   Access Token: [발급받은 Access Token 입력]
   Open ID: [발급받은 Open ID 입력]
   ```
   - "설정 저장" 클릭

3. **연결 테스트**
   - "연결 테스트" 버튼 클릭
   - ✅ 성공 메시지 확인

4. **다른 플랫폼도 동일하게 설정**
   - Twitter
   - Facebook
   - Instagram

5. **Mock 모드 비활성화**
   - "Real 모드 (실제)" 버튼 클릭
   - 확인 메시지: "Mock mode disabled"

---

### 방법 B: .env 파일 직접 수정

```bash
# 서버 접속
cd /var/www/toonverse/webapp/backend-api

# .env 파일 편집
nano .env
```

**추가/수정할 내용:**

```env
# Mock 모드 비활성화 (실제 API 사용)
SNS_MOCK_MODE=false

# TikTok API
TIKTOK_CLIENT_KEY=awxxxxxxxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyy
TIKTOK_ACCESS_TOKEN=act.example_access_token
TIKTOK_OPEN_ID=example_open_id

# Twitter API
TWITTER_API_KEY=xxxxxxxxxxxxxxxxxxxx
TWITTER_API_SECRET=yyyyyyyyyyyyyyyyyyyy
TWITTER_ACCESS_TOKEN=1234567890-xxxxxxxxxxxxxxxxxxxxx
TWITTER_ACCESS_SECRET=yyyyyyyyyyyyyyyyyyyy
TWITTER_BEARER_TOKEN=zzzzzzzzzzzzzzzzzzz

# Facebook API
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxx

# Instagram API
INSTAGRAM_APP_ID=1234567890123456
INSTAGRAM_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxx
```

**저장 및 설정 적용:**

```bash
# Ctrl+X → Y → Enter로 저장

# 설정 캐시 클리어
php artisan config:clear

# 설정 확인
php artisan config:cache
```

---

### 🧪 연결 테스트

#### 방법 A: 관리자 페이지에서

```
https://www.toonverse.store/admin/sns/config
→ "연결 테스트" 버튼 클릭
```

#### 방법 B: API 직접 호출

```bash
# TikTok 테스트
curl -X POST https://www.toonverse.store/api/sns/config/test/tiktok \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_ACCESS_TOKEN"}'

# Twitter 테스트
curl -X POST https://www.toonverse.store/api/sns/config/test/twitter \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_BEARER_TOKEN"}'

# Facebook 테스트
curl -X POST https://www.toonverse.store/api/sns/config/test/facebook \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_PAGE_ACCESS_TOKEN"}'

# Instagram 테스트
curl -X POST https://www.toonverse.store/api/sns/config/test/instagram \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_PAGE_ACCESS_TOKEN"}'
```

**성공 응답 예시:**
```json
{
  "success": true,
  "message": "Tiktok API connection successful",
  "data": {
    "username": "toonverse_official",
    "display_name": "TOONVERSE"
  }
}
```

---

### 🚀 실제 포스트 게시 테스트

```bash
# 1. TikTok 포스트 생성
curl -X POST https://www.toonverse.store/api/sns/posts \
  -H "Content-Type: application/json" \
  -d '{
    "episode_id": 1,
    "platform": "tiktok",
    "content": "🎉 실제 API 연동 테스트 포스트입니다!",
    "status": "draft"
  }'

# 응답에서 post_id 확인
# "data": {"id": 10, ...}

# 2. 즉시 게시
curl -X POST https://www.toonverse.store/api/sns/posts/10/post-now
```

**성공 시 실제 TikTok에 게시됨!** 🎊

---

## 📊 요약 표

| 플랫폼 | Developer Portal | 필요 정보 | 승인 시간 | 비용 |
|--------|-----------------|----------|----------|------|
| **TikTok** | [developers.tiktok.com](https://developers.tiktok.com) | Client Key, Secret, Access Token, Open ID | 1-3일 | 무료 (일 1000개) |
| **Twitter** | [developer.twitter.com](https://developer.twitter.com) | API Key, Secret, Bearer Token, Access Token | 즉시 | 무료 (월 1500개) |
| **Facebook** | [developers.facebook.com](https://developers.facebook.com) | App ID, Secret, Page Access Token | 즉시 | 무료 |
| **Instagram** | [developers.facebook.com](https://developers.facebook.com) | App ID, Secret, Access Token, Account ID | 즉시 | 무료 |

---

## ❓ 자주 묻는 질문

### Q1: API 키 발급이 너무 복잡해요!

**A**: 플랫폼 하나씩 차근차근 진행하세요:
1. 먼저 **Twitter**부터 (가장 쉬움)
2. 다음 **Facebook**
3. Facebook 완료 후 **Instagram** (거의 자동)
4. 마지막 **TikTok** (승인 대기 있음)

---

### Q2: TikTok 승인이 거부되었어요

**A**: 다음을 확인하세요:
- Use Case 설명이 충분히 상세한가?
- 웹사이트가 실제로 작동하는가?
- 약관 위반 내용이 없는가?

재신청 가능하며, 거부 사유를 참고해서 다시 작성하세요.

---

### Q3: Access Token이 만료되었어요

**A**: 토큰 갱신 방법:

**TikTok**: Refresh Token 사용
```bash
curl -X POST "https://open.tiktokapis.com/v2/oauth/token/" \
  -d "client_key=YOUR_CLIENT_KEY" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN"
```

**Facebook/Instagram**: Long-Lived Token 재발급
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

**Twitter**: 기본적으로 만료 없음 (재발급 불필요)

---

### Q4: 여러 계정을 동시에 사용할 수 있나요?

**A**: 네! 다음과 같이 설정:

1. `/admin/sns/accounts`에서 계정 추가
2. 각 계정마다 Access Token 입력
3. 포스트 생성 시 계정 선택

---

### Q5: API 사용량을 확인하고 싶어요

**A**: 각 플랫폼 Developer Portal에서 확인:

- **TikTok**: Dashboard → Analytics
- **Twitter**: Portal → Usage
- **Facebook**: App Dashboard → Analytics
- **Instagram**: Facebook Insights

---

## 🆘 도움이 더 필요하세요?

### 공식 문서
- TikTok: https://developers.tiktok.com/doc/
- Twitter: https://developer.twitter.com/en/docs
- Facebook: https://developers.facebook.com/docs/
- Instagram: https://developers.facebook.com/docs/instagram-api

### TOONVERSE 문서
- 시스템 가이드: `/var/www/toonverse/webapp/SNS_API_INTEGRATION_GUIDE.md`
- API 설정 페이지: `https://www.toonverse.store/admin/sns/config`

---

**마지막 업데이트**: 2026-01-14  
**작성자**: TOONVERSE Dev Team  
**난이도**: ⭐⭐⭐ (초보자 가능)

🎉 **이 가이드를 따라하면 누구나 API 키를 발급받을 수 있습니다!**
