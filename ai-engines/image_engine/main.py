from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import time
import base64
import requests
from datetime import datetime
from openai import OpenAI
from PIL import Image
from io import BytesIO
from pathlib import Path

# Load .env file from backend-api
def load_env_file():
    env_path = Path(__file__).parent.parent.parent / "backend-api" / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    if not os.getenv(key):
                        os.environ[key] = value
load_env_file()

app = FastAPI(
    title="TOONVERSE Image Engine",
    version="1.0.0",
    description="AI-powered image generation for webtoon panels"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI 클라이언트 초기화
api_key = os.getenv("OPENAI_API_KEY")
client = None
if api_key:
    print(f"🔑 OpenAI API Key found (length: {len(api_key)})")
    client = OpenAI(api_key=api_key)
    print("✅ OpenAI Client initialized successfully")
else:
    print("❌ OPENAI_API_KEY not found in environment")

# 이미지 저장 디렉토리
STORAGE_DIR = os.getenv("IMAGE_STORAGE_DIR", "/var/www/toonverse/webapp/storage/images")
os.makedirs(STORAGE_DIR, exist_ok=True)

class CharacterRef(BaseModel):
    name: str
    reference_image_url: Optional[str] = None
    style_seed: Optional[str] = None
    description: Optional[str] = None

class ImageRequest(BaseModel):
    panel_number: int
    visual_prompt: str
    characters: List[str] = []
    character_refs: List[CharacterRef] = []
    style: str = "webtoon"
    width: int = 1024
    height: int = 1448

class ImageEngineRequest(BaseModel):
    episode_id: int
    panels: List[ImageRequest]
    options: Optional[Dict[str, Any]] = {}

class ImageResult(BaseModel):
    panel_number: int
    image_url: str
    width: int
    height: int
    generation_metadata: Dict[str, Any]

class ImageEngineResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "TOONVERSE Image Engine",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    openai_status = "configured" if client else "not_configured"
    storage_writable = os.access(STORAGE_DIR, os.W_OK)
    
    return {
        "status": "healthy",
        "service": "image_engine",
        "openai_api": openai_status,
        "storage_dir": STORAGE_DIR,
        "storage_writable": storage_writable,
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "/",
            "/health",
            "/engine/image/generate",
            "/engine/image/generate-batch"
        ]
    }

@app.post("/engine/image/generate", response_model=ImageEngineResponse)
def generate_single_image(request: ImageRequest):
    """
    단일 패널 이미지 생성
    """
    start_time = time.time()
    
    try:
        if not client:
            # MVP: 더미 이미지 (OpenAI API 키 없을 때)
            result = generate_dummy_image(request)
        else:
            # Production: DALL-E 3 호출
            result = generate_image_with_dalle3(request)
        
        processing_time = time.time() - start_time
        
        return ImageEngineResponse(
            success=True,
            result=result,
            metadata={
                "engine_version": "1.0.0",
                "cost_units": 0.04 if client else 0.0,  # DALL-E 3 비용
                "processing_time": round(processing_time, 2),
                "model": "dall-e-3" if client else "dummy"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/engine/image/generate-batch", response_model=ImageEngineResponse)
def generate_batch_images(request: ImageEngineRequest):
    """
    여러 패널 이미지 일괄 생성
    """
    start_time = time.time()
    
    try:
        results = []
        total_cost = 0.0
        
        for panel_request in request.panels:
            if not client:
                # MVP: 더미 이미지
                result = generate_dummy_image(panel_request)
            else:
                # Production: DALL-E 3 호출
                result = generate_image_with_dalle3(panel_request)
            
            results.append(result)
            total_cost += result.get('generation_metadata', {}).get('cost', 0.04)
        
        processing_time = time.time() - start_time
        
        return ImageEngineResponse(
            success=True,
            result={
                "episode_id": request.episode_id,
                "images": results,
                "total_panels": len(results),
                "total_size_mb": sum(r.get('size_mb', 0) for r in results)
            },
            metadata={
                "engine_version": "1.0.0",
                "cost_units": total_cost,
                "processing_time": round(processing_time, 2),
                "model": "dall-e-3" if client else "dummy",
                "warnings": [] if client else ["Using dummy images - OPENAI_API_KEY not configured"]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_image_with_dalle3(request: ImageRequest) -> Dict[str, Any]:
    """
    DALL-E 3를 사용하여 이미지 생성
    """
    try:
        # DALL-E 3는 1024x1024, 1792x1024, 1024x1792만 지원
        # 웹툰 비율에 맞춰 1024x1792 사용
        size = "1024x1792"
        
        # 프롬프트 강화
        enhanced_prompt = enhance_prompt(request.visual_prompt, request.style)
        
        # DALL-E 3 API 호출
        response = client.images.generate(
            model="dall-e-3",
            prompt=enhanced_prompt,
            size=size,
            quality="standard",  # "hd" for higher quality
            n=1
        )
        
        image_url = response.data[0].url
        
        # 이미지 다운로드 및 저장
        local_path = save_image_from_url(image_url, request.panel_number)
        
        return {
            "panel_number": request.panel_number,
            "image_url": local_path,
            "width": 1024,
            "height": 1792,
            "size_mb": get_file_size_mb(local_path),
            "generation_metadata": {
                "model": "dall-e-3",
                "prompt": enhanced_prompt,
                "original_url": image_url,
                "cost": 0.04,
                "size": size,
                "quality": "standard"
            }
        }
        
    except Exception as e:
        print(f"DALL-E 3 API Error: {e}")
        # 에러 발생 시 더미 이미지로 폴백
        return generate_dummy_image(request)

def generate_dummy_image(request: ImageRequest) -> Dict[str, Any]:
    """
    더미 이미지 생성 (MVP용)
    """
    # 간단한 색상 이미지 생성
    width = min(request.width, 1024)
    height = min(request.height, 1792)
    
    # PIL로 단색 이미지 생성
    from PIL import Image, ImageDraw, ImageFont
    
    # 패널 번호에 따라 색상 변경
    colors = [
        (255, 200, 200),  # 연한 빨강
        (200, 255, 200),  # 연한 초록
        (200, 200, 255),  # 연한 파랑
        (255, 255, 200),  # 연한 노랑
        (255, 200, 255),  # 연한 보라
    ]
    color = colors[request.panel_number % len(colors)]
    
    img = Image.new('RGB', (width, height), color=color)
    draw = ImageDraw.Draw(img)
    
    # 텍스트 추가
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    text = f"Panel {request.panel_number}"
    
    # 텍스트 위치 계산 (중앙)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text, fill=(0, 0, 0), font=font)
    
    # 파일 저장
    filename = f"panel_{request.panel_number:03d}_dummy.png"
    filepath = os.path.join(STORAGE_DIR, filename)
    img.save(filepath, 'PNG')
    
    return {
        "panel_number": request.panel_number,
        "image_url": filepath,
        "width": width,
        "height": height,
        "size_mb": get_file_size_mb(filepath),
        "generation_metadata": {
            "model": "dummy",
            "prompt": request.visual_prompt,
            "cost": 0.0,
            "note": "Dummy image for MVP testing"
        }
    }

def enhance_prompt(prompt: str, style: str) -> str:
    """
    프롬프트 강화 (스타일 추가)
    """
    style_modifiers = {
        "webtoon": "in Korean webtoon style, digital art, clean lines, vibrant colors",
        "manga": "in Japanese manga style, black and white, dynamic composition",
        "realistic": "photorealistic, highly detailed, cinematic lighting",
        "anime": "in anime style, colorful, expressive characters"
    }
    
    modifier = style_modifiers.get(style, style_modifiers["webtoon"])
    
    return f"{prompt}, {modifier}"

def save_image_from_url(url: str, panel_number: int) -> str:
    """
    URL에서 이미지 다운로드 및 저장
    """
    response = requests.get(url)
    response.raise_for_status()
    
    img = Image.open(BytesIO(response.content))
    
    timestamp = int(time.time())
    filename = f"panel_{panel_number:03d}_{timestamp}.png"
    filepath = os.path.join(STORAGE_DIR, filename)
    
    img.save(filepath, 'PNG')
    
    return filepath

def get_file_size_mb(filepath: str) -> float:
    """
    파일 크기 (MB)
    """
    if os.path.exists(filepath):
        size_bytes = os.path.getsize(filepath)
        return round(size_bytes / (1024 * 1024), 2)
    return 0.0

if __name__ == "__main__":
    print("=" * 60)
    print("🎨 TOONVERSE Image Engine Starting...")
    print("=" * 60)
    print(f"📍 API URL: http://0.0.0.0:8003")
    print(f"📚 Docs: http://0.0.0.0:8003/docs")
    print(f"🔍 Health: http://0.0.0.0:8003/health")
    print(f"🔑 OpenAI API: {'✅ Configured' if client else '❌ Not Configured (using dummy images)'}")
    print(f"💾 Storage: {STORAGE_DIR}")
    print("=" * 60)
    
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )
