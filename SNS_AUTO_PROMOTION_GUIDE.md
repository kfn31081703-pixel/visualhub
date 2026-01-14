# 🚀 ToonVerse SNS 자동 홍보 시스템

## 개요

웹툰 에피소드가 생성되면 자동으로 SNS(Twitter, Facebook, Instagram)에 홍보 게시물을 생성하고 예약/게시하는 시스템입니다.

## ✨ 주요 기능

### 1. 자동 포스트 생성
- ✅ 에피소드 활성화 시 자동으로 SNS 포스트 생성
- ✅ 플랫폼별 맞춤 텍스트 자동 생성 (Twitter, Facebook, Instagram)
- ✅ 에피소드 썸네일 자동 첨부
- ✅ 해시태그 자동 추가

### 2. 다중 플랫폼 지원
- 🐦 **Twitter/X**: 짧고 임팩트 있는 메시지
- 👍 **Facebook**: 상세한 설명과 함께
- 📷 **Instagram**: 시각적 콘텐츠 중심

### 3. 스케줄링
- ⏰ 자동 예약 (기본 5분 후)
- 📅 수동 예약 시간 설정 가능
- 🔄 매 5분마다 예약된 포스트 자동 게시

### 4. 관리자 대시보드
- 📊 실시간 통계 확인
- ✏️ 게시물 수정/삭제
- 🎯 즉시 게시 기능
- 🔍 플랫폼/상태별 필터링

## 📁 시스템 구조

### 데이터베이스
```
sns_posts
├── id
├── episode_id (외래키)
├── platform (twitter/facebook/instagram)
├── content (포스트 내용)
├── image_url (썸네일)
├── status (draft/scheduled/posted/failed)
├── scheduled_at (예약 시간)
├── posted_at (게시 시간)
└── metadata (JSON)

sns_accounts
├── id
├── platform
├── account_name
├── access_token (암호화)
├── is_active
└── settings (JSON)
```

### API 엔드포인트

#### SNS 포스트
- `GET /api/sns/posts` - 포스트 목록
- `POST /api/sns/posts` - 포스트 생성
- `POST /api/sns/posts/episode` - 에피소드용 자동 생성
- `GET /api/sns/posts/statistics` - 통계
- `PUT /api/sns/posts/{id}` - 포스트 수정
- `DELETE /api/sns/posts/{id}` - 포스트 삭제
- `POST /api/sns/posts/{id}/post-now` - 즉시 게시

#### SNS 계정
- `GET /api/sns/accounts` - 계정 목록
- `POST /api/sns/accounts` - 계정 추가
- `PUT /api/sns/accounts/{id}` - 계정 수정
- `DELETE /api/sns/accounts/{id}` - 계정 삭제
- `POST /api/sns/accounts/{id}/toggle-active` - 활성화 토글

## 🎯 사용 방법

### 1. SNS 계정 연결

관리자 페이지에서 SNS 계정을 추가합니다:

```
https://www.toonverse.store/admin/sns/accounts
```

**계정 추가 예시:**
```json
{
  "platform": "twitter",
  "account_name": "@ToonverseOfficial",
  "account_id": "toonverse_twitter",
  "is_active": true
}
```

### 2. 자동 포스트 생성

에피소드가 **활성화(active)** 또는 **완료(completed)** 상태로 변경되면 자동으로 SNS 포스트가 생성됩니다.

**자동 트리거:**
```php
// Episode 모델에서 자동 실행
Episode::updated(function ($episode) {
    if (in_array($episode->status, ['active', 'completed'])) {
        $snsService->createPostsForEpisode($episode, true);
    }
});
```

### 3. 수동 포스트 생성

API를 통해 수동으로 생성할 수도 있습니다:

```bash
curl -X POST http://localhost:8000/api/sns/posts/episode \
  -H "Content-Type: application/json" \
  -d '{
    "episode_id": 1,
    "auto_schedule": true
  }'
```

### 4. 스케줄러 설정

Laravel 스케줄러가 매 5분마다 예약된 포스트를 처리합니다:

```bash
# Crontab 설정 필요
* * * * * cd /var/www/toonverse/webapp/backend-api && php artisan schedule:run >> /dev/null 2>&1
```

**또는 수동 실행:**
```bash
php artisan sns:process-scheduled
```

## 🎨 포스트 템플릿

### Twitter
```
🎨 새로운 에피소드 공개!

📖 {title} - {episode_number}화
{genre} | {tone}

✨ {description}

👉 지금 바로 확인하세요!

#{genre} #웹툰 #TOONVERSE
```

### Facebook
```
🎉 새로운 에피소드가 공개되었습니다!

📖 제목: {title} - {episode_number}화
🎭 장르: {genre}
🎨 톤: {tone}

{description}

지금 바로 ToonVerse에서 확인해보세요! 🚀

#웹툰 #{genre} #TOONVERSE #AI웹툰
```

### Instagram
```
✨ NEW EPISODE ALERT! ✨

{title} - Episode {episode_number}

{description}

📱 Read now on ToonVerse!

#{genre} #webtoon #TOONVERSE #comics #manga #manhwa #{tone}
```

## 📊 통계 및 모니터링

관리자 페이지에서 실시간 통계를 확인할 수 있습니다:

```
https://www.toonverse.store/admin/sns
```

**확인 가능한 통계:**
- 전체 게시물 수
- 상태별 게시물 수 (초안/예약/게시/실패)
- 플랫폼별 게시물 수
- 최근 게시된 포스트

## 🔧 고급 설정

### 1. 포스트 템플릿 커스터마이징

`backend-api/app/Services/SnsService.php`에서 템플릿을 수정할 수 있습니다:

```php
public function generatePostContent(Episode $episode, string $platform): string
{
    $templates = [
        'twitter' => '...',  // 여기서 수정
        'facebook' => '...', // 여기서 수정
        'instagram' => '...', // 여기서 수정
    ];
    // ...
}
```

### 2. 예약 시간 변경

기본 예약 시간은 5분 후입니다. 변경하려면:

```php
// SnsService.php
$post = SnsPost::create([
    'scheduled_at' => $autoSchedule ? now()->addMinutes(5) : null, // 여기서 변경
]);
```

### 3. 스케줄러 주기 변경

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('sns:process-scheduled')
             ->everyFiveMinutes() // 여기서 변경 (everyMinute, everyTenMinutes 등)
             ->withoutOverlapping();
}
```

## 🔐 보안

### 토큰 암호화
SNS 계정의 액세스 토큰은 자동으로 암호화됩니다:

```php
// SnsAccount 모델
public function setAccessTokenAttribute($value)
{
    if ($value) {
        $this->attributes['access_token'] = Crypt::encryptString($value);
    }
}
```

## 🚨 트러블슈팅

### 1. 포스트가 생성되지 않을 때
- SNS 계정이 활성화되어 있는지 확인
- 에피소드 상태가 'active' 또는 'completed'인지 확인
- Laravel 로그 확인: `storage/logs/laravel.log`

### 2. 예약된 포스트가 게시되지 않을 때
- 스케줄러가 실행되고 있는지 확인
- Crontab 설정 확인
- 수동 실행: `php artisan sns:process-scheduled`

### 3. API 오류
```bash
# 마이그레이션 확인
php artisan migrate:status

# 캐시 클리어
php artisan cache:clear
php artisan config:clear
```

## 📱 실제 SNS 플랫폼 연동

현재는 Mock 모드로 작동합니다. 실제 SNS API 연동을 위해서는:

### Twitter API v2
```php
// composer.json에 추가
"noweh/twitter-api-v2-php": "^3.0"

// SnsService.php
private function postToTwitter(SnsPost $post, SnsAccount $account): array
{
    $client = new \Noweh\TwitterApi\Client([
        'consumer_key' => env('TWITTER_API_KEY'),
        'consumer_secret' => env('TWITTER_API_SECRET'),
        'bearer_token' => $account->access_token,
    ]);
    
    $tweet = $client->tweet()->create()
        ->performRequest(['text' => $post->content]);
    
    return [
        'success' => true,
        'post_id' => $tweet['data']['id'],
        'post_url' => "https://twitter.com/i/web/status/{$tweet['data']['id']}",
    ];
}
```

### Facebook Graph API
```php
// SnsService.php
private function postToFacebook(SnsPost $post, SnsAccount $account): array
{
    $response = Http::post("https://graph.facebook.com/v18.0/me/feed", [
        'message' => $post->content,
        'access_token' => $account->access_token,
    ]);
    
    $data = $response->json();
    
    return [
        'success' => true,
        'post_id' => $data['id'],
        'post_url' => "https://facebook.com/{$data['id']}",
    ];
}
```

### Instagram Graph API
```php
// SnsService.php
private function postToInstagram(SnsPost $post, SnsAccount $account): array
{
    // Step 1: Create container
    $container = Http::post("https://graph.facebook.com/v18.0/{$account->account_id}/media", [
        'image_url' => $post->image_url,
        'caption' => $post->content,
        'access_token' => $account->access_token,
    ]);
    
    // Step 2: Publish container
    $publish = Http::post("https://graph.facebook.com/v18.0/{$account->account_id}/media_publish", [
        'creation_id' => $container['id'],
        'access_token' => $account->access_token,
    ]);
    
    return [
        'success' => true,
        'post_id' => $publish['id'],
        'post_url' => "https://instagram.com/p/{$publish['id']}",
    ];
}
```

## 📝 테스트

```bash
# 테스트 스크립트 실행
./test_sns_system.sh
```

## 🎉 완료!

이제 웹툰 에피소드가 자동으로 SNS에 홍보됩니다!

**관리 페이지:**
- SNS 포스트 관리: https://www.toonverse.store/admin/sns
- SNS 계정 관리: https://www.toonverse.store/admin/sns/accounts

**다음 단계:**
1. 실제 SNS API 키 발급 및 연동
2. 포스트 템플릿 커스터마이징
3. 스케줄러 설정 (Crontab)
4. 모니터링 및 분석 시스템 추가

---

문의사항이나 도움이 필요하시면 언제든 연락주세요! 🚀
