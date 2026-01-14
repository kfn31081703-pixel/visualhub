# 🌐 TOONVERSE 도메인 연결 완료 보고서

**날짜**: 2026-01-13 06:00 UTC  
**도메인**: `toonverse.store` / `www.toonverse.store`  
**서버 IP**: `1.234.91.116`  
**상태**: ✅ Nginx 설정 완료 (DNS 설정 대기 중)

---

## ✅ 완료된 작업

### 1. Nginx 설정 파일 생성 및 활성화
```bash
# 설정 파일 경로
/etc/nginx/sites-available/toonverse.store

# 활성화 (심볼릭 링크)
/etc/nginx/sites-enabled/toonverse.store -> /etc/nginx/sites-available/toonverse.store

# Nginx 재시작
sudo systemctl reload nginx

# 상태: ✅ Active (running)
```

### 2. 서버 구성 매핑
| 서비스 | 내부 포트 | 외부 경로 |
|--------|----------|-----------|
| **Laravel API** | 8000 | `/api/*` |
| **Health Check** | 8000 | `/health` |
| **Storage** | - | `/storage/*` |
| **Text Engine Docs** | 8001 | `/docs/text/` |
| **Director Engine Docs** | 8002 | `/docs/director/` |
| **Image Engine Docs** | 8003 | `/docs/image/` |
| **Lettering Engine Docs** | 8004 | `/docs/lettering/` |
| **Packaging Engine Docs** | 8005 | `/docs/packaging/` |

### 3. 로컬 테스트 성공
```bash
# Health Check
curl -H "Host: toonverse.store" http://localhost/api/health

# 응답 결과
✅ HTTP/1.1 200 OK
✅ {"success": true, "message": "TOONVERSE AI API is running"}
```

---

## 📋 DNS 설정 가이드 (필수)

### 도메인 등록 업체 (예: Cafe24, GoDaddy, Cloudflare)에서 설정

#### A 레코드 추가
```
Type: A
Host: @
Value: 1.234.91.116
TTL: 3600 (1시간)
```

#### WWW 서브도메인 추가
```
Type: A
Host: www
Value: 1.234.91.116
TTL: 3600
```

### DNS 전파 확인 (15분~24시간)
```bash
# 확인 명령어
nslookup toonverse.store
dig +short toonverse.store A

# 예상 결과
1.234.91.116
```

---

## 🔒 SSL 인증서 설치 (DNS 설정 후 실행)

### Certbot으로 자동 설치
```bash
# Let's Encrypt SSL 인증서 발급 및 Nginx 자동 설정
sudo certbot --nginx -d toonverse.store -d www.toonverse.store

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 예상 결과
- ✅ HTTP (80) → HTTPS (443) 자동 리다이렉트
- ✅ SSL 인증서 유효기간: 90일
- ✅ 자동 갱신 Cron 등록 완료

---

## 🌍 접속 엔드포인트

### DNS 설정 전 (현재)
- **IP 직접 접속**: `http://1.234.91.116/api/health`
- **로컬 테스트**: `curl -H "Host: toonverse.store" http://localhost/api/health`

### DNS 설정 후
| 엔드포인트 | URL |
|-----------|-----|
| **API Health** | `http://toonverse.store/health` |
| **API Base** | `http://toonverse.store/api/` |
| **프로젝트 목록** | `http://toonverse.store/api/projects` |
| **에피소드 목록** | `http://toonverse.store/api/episodes` |
| **Job 상태** | `http://toonverse.store/api/jobs/{id}` |
| **Storage** | `http://toonverse.store/storage/images/` |
| **Text Engine Docs** | `http://toonverse.store/docs/text/` |
| **Director Engine Docs** | `http://toonverse.store/docs/director/` |
| **Image Engine Docs** | `http://toonverse.store/docs/image/` |
| **Lettering Engine Docs** | `http://toonverse.store/docs/lettering/` |
| **Packaging Engine Docs** | `http://toonverse.store/docs/packaging/` |

### SSL 설치 후 (권장)
| 엔드포인트 | URL |
|-----------|-----|
| **HTTPS Health** | `https://toonverse.store/health` |
| **HTTPS API** | `https://toonverse.store/api/` |
| **HTTPS Storage** | `https://toonverse.store/storage/images/` |

---

## 🧪 API 테스트 시나리오

### 1. Health Check
```bash
curl https://toonverse.store/health
```

### 2. 프로젝트 생성
```bash
curl -X POST https://toonverse.store/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "도메인 테스트 프로젝트",
    "genre": "SF",
    "target_country": "KR",
    "tone": "흥미진진한",
    "target_audience": "10-30대",
    "keywords": ["도메인", "연결", "테스트"],
    "world_setting": "2026년 웹툰 자동 생성 시스템"
  }'
```

### 3. 에피소드 생성
```bash
curl -X POST https://toonverse.store/api/projects/{project_id}/episodes \
  -H "Content-Type: application/json" \
  -d '{
    "episode_number": 1,
    "title": "첫 에피소드",
    "synopsis": "TOONVERSE의 첫 웹툰"
  }'
```

### 4. 전체 파이프라인 실행 (5단계)
```bash
curl -X POST https://toonverse.store/api/episodes/{episode_id}/generate-full \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": ["도메인", "연결", "성공"],
    "target_word_count": 1000,
    "target_panels": 3
  }'

# 응답: Job ID 반환
```

### 5. Job 상태 확인
```bash
curl https://toonverse.store/api/jobs/{job_id}

# 진행 상태
# - queued: 대기 중
# - processing: 처리 중
# - done: 완료
# - failed: 실패
```

### 6. 최종 웹툰 이미지 다운로드
```bash
curl -O https://toonverse.store/storage/images/final/episode_{episode_number}_final.png
```

---

## 📊 서비스 상태 모니터링

### Nginx
```bash
# 상태 확인
sudo systemctl status nginx

# 로그 확인
sudo tail -f /var/log/nginx/toonverse-access.log
sudo tail -f /var/log/nginx/toonverse-error.log
```

### Laravel API
```bash
# 상태 확인
sudo supervisorctl status toonverse-laravel

# 재시작
sudo supervisorctl restart toonverse-laravel

# 로그 확인
tail -f /var/www/toonverse/webapp/backend-api/storage/logs/laravel.log
```

### AI Engines
```bash
# 전체 상태 확인
sudo supervisorctl status toonverse:*

# 개별 재시작
sudo supervisorctl restart toonverse:toonverse-text-engine
sudo supervisorctl restart toonverse:toonverse-director-engine
sudo supervisorctl restart toonverse:toonverse-image-engine
sudo supervisorctl restart toonverse:toonverse-lettering-engine
sudo supervisorctl restart toonverse:toonverse-packaging-engine

# 로그 확인
tail -f /var/www/toonverse/webapp/logs/text-engine.log
tail -f /var/www/toonverse/webapp/logs/director-engine.log
tail -f /var/www/toonverse/webapp/logs/image-engine.log
tail -f /var/www/toonverse/webapp/logs/lettering-engine.log
tail -f /var/www/toonverse/webapp/logs/packaging-engine.log
```

### Queue Worker
```bash
# 상태 확인
sudo supervisorctl status toonverse-queue

# 재시작
sudo supervisorctl restart toonverse-queue

# 로그 확인
tail -f /var/www/toonverse/webapp/logs/queue.log
```

---

## 🚨 트러블슈팅

### 1. DNS가 전파되지 않는 경우
```bash
# 현재 DNS 상태 확인
nslookup toonverse.store
dig +short toonverse.store A

# 여러 DNS 서버에서 확인
dig @8.8.8.8 toonverse.store        # Google DNS
dig @1.1.1.1 toonverse.store        # Cloudflare DNS
dig @208.67.222.222 toonverse.store # OpenDNS

# 해결: DNS 전파는 최대 24시간 소요될 수 있음
```

### 2. 502 Bad Gateway
```bash
# Laravel API가 실행 중인지 확인
sudo supervisorctl status toonverse-laravel

# 재시작
sudo supervisorctl restart toonverse-laravel

# Nginx 설정 확인
nginx -t
```

### 3. 504 Gateway Timeout
```bash
# Nginx timeout 설정 확인
grep proxy_read_timeout /etc/nginx/sites-available/toonverse.store

# 현재: 300s (5분)
# 필요시 증가: proxy_read_timeout 600s;

# Nginx 재시작
sudo systemctl reload nginx
```

### 4. SSL 인증서 발급 실패
```bash
# Certbot 로그 확인
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# DNS가 제대로 설정되었는지 확인
nslookup toonverse.store

# 80 포트가 열려 있는지 확인
sudo netstat -tuln | grep :80

# 재시도
sudo certbot --nginx -d toonverse.store -d www.toonverse.store
```

### 5. Storage 경로 403 Forbidden
```bash
# 권한 확인
ls -la /var/www/toonverse/webapp/storage/images/

# 권한 수정
sudo chown -R www-data:www-data /var/www/toonverse/webapp/storage/
sudo chmod -R 755 /var/www/toonverse/webapp/storage/
```

---

## 📝 체크리스트

### 완료 항목 ✅
- [x] Nginx 설정 파일 생성
- [x] Nginx 사이트 활성화 (심볼릭 링크)
- [x] Nginx 재시작 및 상태 확인
- [x] 로컬 Health Check 테스트
- [x] API 프록시 설정 (포트 8000 → /api/)
- [x] Storage 경로 설정 (/storage/)
- [x] 최대 업로드 크기 설정 (100MB)
- [x] AI Engine Docs 프록시 설정
- [x] 서버 IP 확인 (1.234.91.116)

### 대기 항목 ⏳
- [ ] **DNS 설정** (도메인 등록 업체에서 A 레코드 추가)
- [ ] **DNS 전파 확인** (15분~24시간)
- [ ] **SSL 인증서 설치** (Certbot)
- [ ] **HTTPS 테스트**
- [ ] **프로덕션 API 테스트**

---

## 🎯 다음 단계

1. **DNS 설정** (최우선)
   - 도메인 등록 업체 로그인
   - A 레코드 추가: `@ → 1.234.91.116`
   - A 레코드 추가: `www → 1.234.91.116`

2. **DNS 전파 확인** (15분~24시간 후)
   ```bash
   nslookup toonverse.store
   # 결과: 1.234.91.116
   ```

3. **SSL 인증서 설치**
   ```bash
   sudo certbot --nginx -d toonverse.store -d www.toonverse.store
   ```

4. **HTTPS 테스트**
   ```bash
   curl https://toonverse.store/health
   ```

5. **프로덕션 테스트**
   - 프로젝트 생성
   - 에피소드 생성
   - 전체 파이프라인 실행
   - 최종 웹툰 이미지 확인

---

## 📞 지원 정보

- **서버 IP**: `1.234.91.116`
- **도메인**: `toonverse.store` / `www.toonverse.store`
- **Nginx 설정**: `/etc/nginx/sites-available/toonverse.store`
- **Laravel API**: `http://127.0.0.1:8000`
- **AI Engines**: `http://127.0.0.1:8001~8005`

### 로그 경로
- **Nginx Access**: `/var/log/nginx/toonverse-access.log`
- **Nginx Error**: `/var/log/nginx/toonverse-error.log`
- **Laravel**: `/var/www/toonverse/webapp/backend-api/storage/logs/laravel.log`
- **Queue**: `/var/www/toonverse/webapp/logs/queue.log`
- **AI Engines**: `/var/www/toonverse/webapp/logs/{engine}-engine.log`

---

**🎉 도메인 연결 준비 완료!**  
DNS 설정 후 `http://toonverse.store`로 접속 가능합니다!

**📅 예상 일정**
- DNS 설정: 즉시
- DNS 전파: 15분~24시간
- SSL 설치: DNS 전파 후 5분
- 프로덕션 준비: SSL 설치 후 즉시

**🚀 최종 목표**: `https://toonverse.store` 에서 안전하게 웹툰 자동 생성!
