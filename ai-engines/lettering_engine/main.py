from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import time
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import textwrap

app = FastAPI(
    title="TOONVERSE Lettering Engine",
    version="1.0.0",
    description="Text overlay and speech bubble generation for webtoon panels"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 이미지 저장 디렉토리
STORAGE_DIR = os.getenv("IMAGE_STORAGE_DIR", "/var/www/toonverse/webapp/storage/images")
os.makedirs(STORAGE_DIR, exist_ok=True)

class LetteringRequest(BaseModel):
    panel_number: int
    image_path: str
    dialogue: str = ""
    speaker: str = ""
    bubble_position: str = "top-center"  # top-left, top-center, top-right, center, bottom-left, bottom-center, bottom-right
    font_size: int = 32

class LetteringBatchRequest(BaseModel):
    episode_id: int
    panels: List[LetteringRequest]

class LetteringResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "TOONVERSE Lettering Engine",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    storage_writable = os.access(STORAGE_DIR, os.W_OK)
    
    return {
        "status": "healthy",
        "service": "lettering_engine",
        "storage_dir": STORAGE_DIR,
        "storage_writable": storage_writable,
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "/",
            "/health",
            "/engine/lettering/apply",
            "/engine/lettering/apply-batch"
        ]
    }

@app.post("/engine/lettering/apply", response_model=LetteringResponse)
def apply_lettering(request: LetteringRequest):
    """
    단일 패널에 대사 합성
    """
    start_time = time.time()
    
    try:
        result = apply_text_overlay(
            request.image_path,
            request.dialogue,
            request.speaker,
            request.panel_number,
            request.bubble_position,
            request.font_size
        )
        
        processing_time = time.time() - start_time
        
        return LetteringResponse(
            success=True,
            result=result,
            metadata={
                "engine_version": "1.0.0",
                "cost_units": 0.0,
                "processing_time": round(processing_time, 2),
                "model": "pil"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/engine/lettering/apply-batch", response_model=LetteringResponse)
def apply_lettering_batch(request: LetteringBatchRequest):
    """
    여러 패널에 대사 일괄 합성
    """
    start_time = time.time()
    
    try:
        results = []
        
        for panel_request in request.panels:
            result = apply_text_overlay(
                panel_request.image_path,
                panel_request.dialogue,
                panel_request.speaker,
                panel_request.panel_number,
                panel_request.bubble_position,
                panel_request.font_size
            )
            results.append(result)
        
        processing_time = time.time() - start_time
        
        return LetteringResponse(
            success=True,
            result={
                "episode_id": request.episode_id,
                "lettered_images": results,
                "total_panels": len(results)
            },
            metadata={
                "engine_version": "1.0.0",
                "cost_units": 0.0,
                "processing_time": round(processing_time, 2),
                "model": "pil"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def apply_text_overlay(
    image_path: str,
    dialogue: str,
    speaker: str,
    panel_number: int,
    bubble_position: str = "top-center",
    font_size: int = 32
) -> Dict[str, Any]:
    """
    이미지에 텍스트 오버레이 적용
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    # 이미지 로드
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)
    
    # 폰트 로드 (한글 지원)
    try:
        # Ubuntu/Debian 한글 폰트
        font = ImageFont.truetype("/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # 대사가 있으면 텍스트 추가
    if dialogue:
        add_text_with_bubble(img, draw, dialogue, speaker, bubble_position, font)
    
    # 저장
    filename = f"panel_{panel_number:03d}_lettered.png"
    output_path = os.path.join(STORAGE_DIR, filename)
    img.save(output_path, 'PNG')
    
    return {
        "panel_number": panel_number,
        "lettered_image_url": output_path,
        "dialogue": dialogue,
        "speaker": speaker
    }

def add_text_with_bubble(
    img: Image.Image,
    draw: ImageDraw.Draw,
    text: str,
    speaker: str,
    position: str,
    font: ImageFont.ImageFont
):
    """
    말풍선과 텍스트 추가
    """
    width, height = img.size
    
    # 텍스트 줄바꿈 (최대 너비)
    max_width = width - 100
    wrapped_text = wrap_text(text, font, max_width, draw)
    
    # 텍스트 크기 계산
    bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # 말풍선 크기 (패딩 추가)
    padding = 20
    bubble_width = text_width + padding * 2
    bubble_height = text_height + padding * 2
    
    # 위치 계산
    x, y = calculate_position(width, height, bubble_width, bubble_height, position)
    
    # 말풍선 그리기 (흰색 배경, 검은색 테두리)
    bubble_coords = [x, y, x + bubble_width, y + bubble_height]
    draw.rectangle(bubble_coords, fill=(255, 255, 255), outline=(0, 0, 0), width=3)
    
    # 텍스트 그리기
    text_x = x + padding
    text_y = y + padding
    draw.multiline_text((text_x, text_y), wrapped_text, fill=(0, 0, 0), font=font)
    
    # 화자 이름 (선택적)
    if speaker:
        try:
            small_font = ImageFont.truetype(font.path, font.size // 2)
        except:
            small_font = font
        
        speaker_text = f"[{speaker}]"
        speaker_bbox = draw.textbbox((0, 0), speaker_text, font=small_font)
        speaker_width = speaker_bbox[2] - speaker_bbox[0]
        
        # 말풍선 위에 화자 이름
        speaker_x = x + (bubble_width - speaker_width) // 2
        speaker_y = y - 25
        draw.text((speaker_x, speaker_y), speaker_text, fill=(0, 0, 0), font=small_font)

def wrap_text(text: str, font: ImageFont.ImageFont, max_width: int, draw: ImageDraw.Draw) -> str:
    """
    텍스트 자동 줄바꿈
    """
    lines = []
    words = text.split()
    current_line = ""
    
    for word in words:
        test_line = current_line + word + " "
        bbox = draw.textbbox((0, 0), test_line, font=font)
        test_width = bbox[2] - bbox[0]
        
        if test_width <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line.strip())
            current_line = word + " "
    
    if current_line:
        lines.append(current_line.strip())
    
    return "\n".join(lines)

def calculate_position(img_width: int, img_height: int, bubble_width: int, bubble_height: int, position: str) -> tuple:
    """
    말풍선 위치 계산
    """
    margin = 20
    
    positions = {
        "top-left": (margin, margin),
        "top-center": ((img_width - bubble_width) // 2, margin),
        "top-right": (img_width - bubble_width - margin, margin),
        "center": ((img_width - bubble_width) // 2, (img_height - bubble_height) // 2),
        "bottom-left": (margin, img_height - bubble_height - margin),
        "bottom-center": ((img_width - bubble_width) // 2, img_height - bubble_height - margin),
        "bottom-right": (img_width - bubble_width - margin, img_height - bubble_height - margin),
    }
    
    return positions.get(position, positions["top-center"])

if __name__ == "__main__":
    print("=" * 60)
    print("📝 TOONVERSE Lettering Engine Starting...")
    print("=" * 60)
    print(f"📍 API URL: http://0.0.0.0:8004")
    print(f"📚 Docs: http://0.0.0.0:8004/docs")
    print(f"🔍 Health: http://0.0.0.0:8004/health")
    print(f"💾 Storage: {STORAGE_DIR}")
    print("=" * 60)
    
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info"
    )
