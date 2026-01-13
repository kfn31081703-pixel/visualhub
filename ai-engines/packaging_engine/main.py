from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import time
from datetime import datetime
from PIL import Image

app = FastAPI(
    title="TOONVERSE Packaging Engine",
    version="1.0.0",
    description="Merge multiple panels into final webtoon image"
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
FINAL_DIR = os.path.join(STORAGE_DIR, "final")
os.makedirs(FINAL_DIR, exist_ok=True)

class PanelInfo(BaseModel):
    panel_number: int
    lettered_image_url: str

class PackagingRequest(BaseModel):
    episode_id: int
    panels: List[PanelInfo]
    layout: str = "vertical"  # vertical, grid
    spacing: int = 10  # 패널 간 간격 (px)

class PackagingResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "TOONVERSE Packaging Engine",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    """Detailed health check"""
    storage_writable = os.access(FINAL_DIR, os.W_OK)
    
    return {
        "status": "healthy",
        "service": "packaging_engine",
        "storage_dir": FINAL_DIR,
        "storage_writable": storage_writable,
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "/",
            "/health",
            "/engine/pack/webtoon"
        ]
    }

@app.post("/engine/pack/webtoon", response_model=PackagingResponse)
def package_webtoon(request: PackagingRequest):
    """
    여러 패널을 하나의 웹툰 이미지로 병합
    """
    start_time = time.time()
    
    try:
        if not request.panels:
            raise ValueError("No panels provided")
        
        # 패널 이미지 로드
        panel_images = []
        for panel in request.panels:
            if not os.path.exists(panel.lettered_image_url):
                raise FileNotFoundError(f"Panel image not found: {panel.lettered_image_url}")
            
            img = Image.open(panel.lettered_image_url)
            panel_images.append(img)
        
        # 레이아웃에 따라 병합
        if request.layout == "vertical":
            final_image = merge_vertical(panel_images, request.spacing)
        elif request.layout == "grid":
            final_image = merge_grid(panel_images, request.spacing)
        else:
            final_image = merge_vertical(panel_images, request.spacing)
        
        # 최종 이미지 저장
        filename = f"episode_{request.episode_id:03d}_final.png"
        output_path = os.path.join(FINAL_DIR, filename)
        final_image.save(output_path, 'PNG')
        
        # 파일 크기 계산
        file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
        
        processing_time = time.time() - start_time
        
        return PackagingResponse(
            success=True,
            result={
                "episode_id": request.episode_id,
                "final_webtoon_url": output_path,
                "width": final_image.width,
                "height": final_image.height,
                "total_panels": len(panel_images),
                "file_size_mb": round(file_size_mb, 2)
            },
            metadata={
                "engine_version": "1.0.0",
                "cost_units": 0.0,
                "processing_time": round(processing_time, 2),
                "layout": request.layout
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def merge_vertical(images: List[Image.Image], spacing: int = 10) -> Image.Image:
    """
    세로로 이미지 병합
    """
    if not images:
        raise ValueError("No images to merge")
    
    # 모든 이미지의 너비를 첫 번째 이미지 너비로 맞춤
    target_width = images[0].width
    resized_images = []
    
    for img in images:
        if img.width != target_width:
            # 비율 유지하며 리사이즈
            ratio = target_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
        resized_images.append(img)
    
    # 전체 높이 계산 (간격 포함)
    total_height = sum(img.height for img in resized_images) + spacing * (len(resized_images) - 1)
    
    # 새 이미지 생성 (흰색 배경)
    final_image = Image.new('RGB', (target_width, total_height), (255, 255, 255))
    
    # 이미지 붙여넣기
    y_offset = 0
    for img in resized_images:
        final_image.paste(img, (0, y_offset))
        y_offset += img.height + spacing
    
    return final_image

def merge_grid(images: List[Image.Image], spacing: int = 10, columns: int = 2) -> Image.Image:
    """
    그리드 형식으로 이미지 병합
    """
    if not images:
        raise ValueError("No images to merge")
    
    # 그리드 크기 계산
    rows = (len(images) + columns - 1) // columns
    
    # 각 셀의 크기 (첫 번째 이미지 기준)
    cell_width = images[0].width
    cell_height = images[0].height
    
    # 전체 크기 계산
    total_width = cell_width * columns + spacing * (columns - 1)
    total_height = cell_height * rows + spacing * (rows - 1)
    
    # 새 이미지 생성
    final_image = Image.new('RGB', (total_width, total_height), (255, 255, 255))
    
    # 이미지 배치
    for idx, img in enumerate(images):
        row = idx // columns
        col = idx % columns
        
        x = col * (cell_width + spacing)
        y = row * (cell_height + spacing)
        
        # 크기 맞춤
        if img.size != (cell_width, cell_height):
            img = img.resize((cell_width, cell_height), Image.Resampling.LANCZOS)
        
        final_image.paste(img, (x, y))
    
    return final_image

if __name__ == "__main__":
    print("=" * 60)
    print("📦 TOONVERSE Packaging Engine Starting...")
    print("=" * 60)
    print(f"📍 API URL: http://0.0.0.0:8005")
    print(f"📚 Docs: http://0.0.0.0:8005/docs")
    print(f"🔍 Health: http://0.0.0.0:8005/health")
    print(f"💾 Storage: {FINAL_DIR}")
    print("=" * 60)
    
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8005,
        reload=True,
        log_level="info"
    )
