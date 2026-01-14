# 🌐 TOONVERSE 도메인 연결 가이드

**도메인**: `toonverse.store`  
**서버 IP**: `1.234.91.116`  
**날짜**: 2026-01-13

---

## ✅ 완료된 작업

### 1. Nginx 설정 완료
```bash
# Nginx 설정 파일 생성
/etc/nginx/sites-available/toonverse.store

# 심볼릭 링크 생성
/etc/nginx/sites-enabled/toonverse.store -> /etc/nginx/sites-available/toonverse.store

# Nginx 재시작
sudo systemctl reload nginx
```

### 2. 서버 구성
- **Laravel API**: `http://127.0.0.1:8000` → Nginx reverse proxy → `http://toonverse.store/api/`
- **Text Engine**: `http://127.0.0.1:8001` → `/docs/text/`
- **Director Engine**: `http://127.0.0.1:8002` → `/docs/director/`
- **Image Engine**: `http://127.0.0.1:8003` → `/docs/image/`
- **Lettering Engine**: `http://127.0.0.1:8004` → `/docs/lettering/`
- **Packaging Engine**: `http://127.0.0.1:8005` → `/docs/packaging/`

### 3. 접속 테스트 완료
```bash
# 로컬 테스트
curl -H "Host: toonverse.store" http://localhost/api/health

# 응답
{
    "success": true,
    "message": "TOONVERSE AI API is running",
    "timestamp": "2026-01-12T21:00:21+00:00"
}
```

---

## 📝 필요한 작업: DNS 설정

### 도메인 DNS 설정 (도메인 등록 업체에서 설정 필요)

1. **A 레코드 추가**
   ```
   Type: A
   Host: @
   Value: 1.234.91.116
   TTL: 3600 (1시간)
   ```

2. **www 서브도메인 추가**
   ```
   Type: A
   Host: www
   Value: 1.234.91.116
   TTL: 3600
   ```

### DNS 전파 확인 (15분~24시간 소요)
```bash
# DNS 전파 확인
nslookup toonverse.store
dig +short toonverse.store A

# 예상 결과
1.234.91.116
```

---

## 🔒 SSL 인증서 설치 (DNS 설정 후)

### Let's Encrypt SSL 자동 설치
```bash
# Certbot으로 SSL 인증서 발급 및 설치
sudo certbot --nginx -d toonverse.store -d www.toonverse.store

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 수동 설치 (대화형)
```bash
# Certbot 실행
sudo certbot --nginx

# 프롬프트에서:
# 1. 이메일 입력
# 2. 약관 동의: Y
# 3. 도메인 선택: toonverse.store www.toonverse.store
# 4. HTTP → HTTPS 리다이렉트: 2 (권장)
```

---

## 🌍 접속 엔드포인트

### DNS 설정 전 (현재)
- **로컬 테스트**: `curl -H "Host: toonverse.store" http://localhost/api/health`
- **IP 직접 접속**: `http://1.234.91.116/api/health`

### DNS 설정 후 (예정)
- **API 베이스**: `http://toonverse.store/api/`
- **Health Check**: `http://toonverse.store/health`
- **저장소 경로**: `http://toonverse.store/storage/images/`
- **Text Engine API 문서**: `http://toonverse.store/docs/text/`
- **Director Engine API 문서**: `http://toonverse.store/docs/director/`
- **Image Engine API 문서**: `http://toonverse.store/docs/image/`
- **Lettering Engine API 문서**: `http://toonverse.store/docs/lettering/`
- **Packaging Engine API 문서**: `http://toonverse.store/docs/packaging/`

### SSL 설치 후 (권장)
- **HTTPS API**: `https://toonverse.store/api/`
- **HTTPS Health**: `https://toonverse.store/health`
- **HTTPS Storage**: `https://toonverse.store/storage/images/`

---

## 🧪 테스트 API 호출 예시

### 1. Health Check
```bash
curl https://toonverse.store/health
```

### 2. 프로젝트 목록
```bash
curl https://toonverse.store/api/projects
```

### 3. 에피소드 생성
```bash
curl -X POST https://toonverse.store/api/projects/2/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 13,
    "title": "도메인 연결 테스트",
    "synopsis": "DNS 설정 후 첫 에피소드"
  }'
```

### 4. 전체 파이프라인 실행
```bash
curl -X POST https://toonverse.store/api/episodes/13/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["도메인", "연결", "성공"],
    "target_word_count": 1000,
    "target_panels": 3
  }'
```

### 5. Job 상태 확인
```bash
curl https://toonverse.store/api/jobs/39
```

---

## 🔧 Nginx 설정 상세

```nginx
# /etc/nginx/sites-available/toonverse.store
server {
    listen 80;
    server_name toonverse.store www.toonverse.store;

    # 로그 설정
    access_log /var/log/nginx/toonverse-access.log;
    error_log /var/log/nginx/toonverse-error.log;

    # 최대 업로드 크기 (웹툰 이미지용)
    client_max_body_size 100M;

    # Laravel API (백엔드)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # Storage 경로 (이미지)
    location /storage/ {
        alias /var/www/toonverse/webapp/storage/;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:8000/api/health;
    }

    # FastAPI Engines 문서 (Text, Director, Image, Lettering, Packaging)
    location /docs/text/ {
        proxy_pass http://127.0.0.1:8001/docs;
    }
    location /docs/director/ {
        proxy_pass http://127.0.0.1:8002/docs;
    }
    location /docs/image/ {
        proxy_pass http://127.0.0.1:8003/docs;
    }
    location /docs/lettering/ {
        proxy_pass http://127.0.0.1:8004/docs;
    }
    location /docs/packaging/ {
        proxy_pass http://127.0.0.1:8005/docs;
    }
}
```

---

## 📊 서비스 상태 확인

```bash
# Nginx 상태
sudo systemctl status nginx

# Laravel API (Supervisor)
sudo supervisorctl status toonverse-laravel

# 모든 AI 엔진
sudo supervisorctl status toonverse:*

# Queue Worker
sudo supervisorctl status toonverse-queue
```

---

## 🚨 트러블슈팅

### 1. 502 Bad Gateway
```bash
# Laravel API 상태 확인
sudo supervisorctl status toonverse-laravel

# 재시작
sudo supervisorctl restart toonverse-laravel
```

### 2. 504 Gateway Timeout
```bash
# Nginx timeout 설정 확인
grep -r "proxy_read_timeout" /etc/nginx/sites-available/toonverse.store

# 현재: 300s (5분) - 충분함
```

### 3. SSL 인증서 갱신 실패
```bash
# Certbot 로그 확인
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# 수동 갱신
sudo certbot renew --force-renewal
```

### 4. DNS 전파 확인
```bash
# 여러 DNS 서버에서 확인
dig @8.8.8.8 toonverse.store        # Google DNS
dig @1.1.1.1 toonverse.store        # Cloudflare DNS
dig @208.67.222.222 toonverse.store # OpenDNS
```

---

## 📝 다음 단계 체크리스트

- [ ] **DNS 설정**: 도메인 등록 업체에서 A 레코드 추가 (1.234.91.116)
- [ ] **DNS 전파 확인**: `nslookup toonverse.store` 또는 `dig toonverse.store`
- [ ] **SSL 인증서 설치**: `sudo certbot --nginx -d toonverse.store -d www.toonverse.store`
- [ ] **HTTPS 테스트**: `curl https://toonverse.store/health`
- [ ] **API 테스트**: `curl https://toonverse.store/api/projects`
- [ ] **전체 파이프라인 테스트**: Episode 13 생성 및 실행

---

## 📞 지원

- **서버 IP**: `1.234.91.116`
- **Nginx 설정**: `/etc/nginx/sites-available/toonverse.store`
- **로그 확인**: 
  - Access Log: `/var/log/nginx/toonverse-access.log`
  - Error Log: `/var/log/nginx/toonverse-error.log`
- **Laravel API 로그**: `/var/www/toonverse/webapp/backend-api/storage/logs/laravel.log`

---

**🎉 도메인 연결 준비 완료!**  
DNS 설정만 하면 `http://toonverse.store`로 접속 가능합니다!
