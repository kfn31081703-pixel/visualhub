# OpenAI API 설정 가이드 🔑

## 📋 개요

TOONVERSE 이미지 생성 엔진은 현재 **Dummy Mode**로 작동 중입니다.  
실제 AI 이미지를 생성하려면 OpenAI API 키를 설정해야 합니다.

---

## 🎯 현재 상태

### Dummy Mode (현재)
```json
{
  "status": "healthy",
  "service": "image_engine",
  "openai_api": "not_configured",  ❌
  "storage_writable": true
}
```

**특징:**
- ✅ 테스트용 더미 이미지 생성
- ✅ 개발/디버깅에 적합
- ❌ 실제 AI 이미지 생성 불가
- ✅ 비용 무료

### Real AI Mode (설정 후)
```json
{
  "status": "healthy",
  "service": "image_engine",
  "openai_api": "configured",  ✅
  "storage_writable": true
}
```

**특징:**
- ✅ 실제 AI 이미지 생성
- ✅ 프로덕션 품질
- ⚠️ API 사용료 발생
- ✅ DALL-E 3 사용

---

## 🔑 OpenAI API 키 발급

### 1. OpenAI 계정 생성
1. https://platform.openai.com/ 접속
2. 회원가입 또는 로그인
3. 결제 수단 등록 (API 사용을 위해 필수)

### 2. API 키 생성
1. https://platform.openai.com/api-keys 접속
2. **"Create new secret key"** 클릭
3. 키 이름 입력 (예: "TOONVERSE Production")
4. **API 키 복사** (한 번만 표시됨!)
   ```
   sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 3. 사용량 제한 설정 (권장)
1. https://platform.openai.com/account/limits 접속
2. Monthly budget limit 설정 (예: $50)
3. Email alerts 활성화

---

## ⚙️ TOONVERSE 설정

### 방법 1: 환경변수 파일 수정

#### Backend API 설정
```bash
# 1. backend-api/.env 파일 편집
sudo nano /var/www/toonverse/webapp/backend-api/.env

# 2. 파일 끝에 추가
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. 저장 (Ctrl+O, Enter, Ctrl+X)
```

#### 이미지 엔진 재시작
```bash
cd /var/www/toonverse/webapp

# Supervisor를 통해 재시작
supervisorctl restart toonverse:toonverse-image-engine

# 또는 전체 재시작
supervisorctl restart toonverse:*
```

### 방법 2: 시스템 환경변수 설정

```bash
# 1. Supervisor 환경변수 추가
sudo nano /etc/supervisor/conf.d/toonverse.conf

# 2. image-engine 섹션에 추가
[program:toonverse-image-engine]
command=python3 main.py
directory=/var/www/toonverse/webapp/ai-engines/image_engine
environment=OPENAI_API_KEY="sk-proj-xxxxxxxx"  # 이 줄 추가
...

# 3. Supervisor 재시작
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart toonverse:toonverse-image-engine
```

---

## ✅ 설정 확인

### 1. Health Check
```bash
curl http://localhost:8003/health | python3 -m json.tool
```

**기대 결과:**
```json
{
  "status": "healthy",
  "service": "image_engine",
  "openai_api": "configured",  ✅ 이것이 중요!
  "storage_writable": true
}
```

### 2. 테스트 이미지 생성
```bash
curl -X POST "http://localhost:8003/engine/image/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "panel_number": 1,
    "visual_prompt": "A hero standing on a mountain peak at sunset",
    "style": "webtoon"
  }'
```

**성공 응답:**
```json
{
  "success": true,
  "panel_number": 1,
  "image_path": "/var/www/toonverse/webapp/storage/images/panel_001_xxxx.png",
  "image_url": "https://www.toonverse.store/storage/images/panel_001_xxxx.png",
  "generation_time": 8.5
}
```

### 3. 로그 확인
```bash
tail -f /var/www/toonverse/webapp/logs/image-engine.log
```

**성공 메시지 확인:**
```
🔑 OpenAI API: ✅ Configured
🎨 Generating image with DALL-E 3...
✅ Image generated successfully
```

---

## 💰 비용 안내

### DALL-E 3 가격 (2024년 기준)
| 해상도 | 품질 | 가격 |
|--------|------|------|
| 1024x1024 | Standard | $0.040/image |
| 1024x1792 | Standard | $0.080/image |
| 1024x1024 | HD | $0.080/image |

### 예상 비용 계산
```
에피소드 1개 = 10컷 (패널)
10 패널 × $0.04 = $0.40/에피소드

프로젝트 10 에피소드 = $4.00
```

### 비용 절감 팁
1. **Standard 품질 사용** (HD 대신)
2. **Batch 생성 최적화**
3. **캐싱 활용** (동일한 프롬프트 재사용)
4. **Monthly limit 설정**

---

## 🔒 보안 주의사항

### ⚠️ API 키 보호
```bash
# ❌ 절대 하지 말 것
git add backend-api/.env  # .env 파일을 Git에 커밋
echo $OPENAI_API_KEY      # 키를 로그에 출력

# ✅ 해야 할 것
chmod 600 backend-api/.env  # 파일 권한 제한
.gitignore에 .env 추가     # Git에서 제외
환경변수로 관리            # 직접 하드코딩 금지
```

### 키 노출 시 대응
1. 즉시 https://platform.openai.com/api-keys 에서 키 삭제
2. 새 키 발급
3. 사용 내역 확인 (이상 거래 여부)

---

## 🐛 문제 해결

### 1. "OpenAI API: not_configured" 계속 표시
```bash
# 원인: 환경변수가 제대로 로드되지 않음

# 해결 1: 이미지 엔진 재시작
supervisorctl restart toonverse:toonverse-image-engine

# 해결 2: .env 파일 권한 확인
ls -la /var/www/toonverse/webapp/backend-api/.env
# -rw------- 1 www-data www-data 여야 함

# 해결 3: 환경변수 직접 확인
sudo -u www-data printenv | grep OPENAI
```

### 2. "Rate limit exceeded" 에러
```bash
# 원인: API 사용량 초과

# 해결: 사용량 확인
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 대기 후 재시도 또는 플랜 업그레이드
```

### 3. "Invalid API key" 에러
```bash
# 원인: 키가 잘못되었거나 만료됨

# 해결: 키 재확인
# 1. OpenAI 대시보드에서 키 상태 확인
# 2. 새 키 발급
# 3. .env 파일 업데이트
# 4. 서비스 재시작
```

---

## 📊 모니터링

### 사용량 추적
```bash
# OpenAI 대시보드
https://platform.openai.com/usage

# 일별/월별 비용 확인
# Alert 설정 권장
```

### 로그 모니터링
```bash
# 실시간 로그
tail -f /var/www/toonverse/webapp/logs/image-engine.log

# 에러 필터링
grep "ERROR" /var/www/toonverse/webapp/logs/image-engine.log

# 생성 통계
grep "generated successfully" logs/image-engine.log | wc -l
```

---

## ✅ 체크리스트

설정 완료 전 확인사항:

- [ ] OpenAI 계정 생성 및 결제 수단 등록
- [ ] API 키 발급 및 안전하게 저장
- [ ] Monthly budget limit 설정
- [ ] backend-api/.env에 OPENAI_API_KEY 추가
- [ ] 이미지 엔진 재시작
- [ ] Health check로 "configured" 확인
- [ ] 테스트 이미지 생성 성공
- [ ] 비용 모니터링 설정

---

## 🎯 다음 단계

API 설정 완료 후:

1. **테스트 프로젝트 생성**
   - Admin 페이지에서 새 프로젝트 생성
   - 에피소드 추가
   - 실제 AI 이미지 생성 확인

2. **성능 최적화**
   - Batch 생성 설정
   - 캐싱 전략 구현
   - 비용 최적화

3. **프로덕션 배포**
   - Next.js Production 빌드
   - CDN 설정
   - 모니터링 구성

---

## 📞 지원

문제가 계속되면:
1. 로그 확인: `tail -f logs/image-engine.log`
2. Health check: `curl localhost:8003/health`
3. OpenAI 상태 페이지: https://status.openai.com/

---

**작성일**: 2026-01-13  
**상태**: Ready for Production  
**문서 버전**: 1.0
