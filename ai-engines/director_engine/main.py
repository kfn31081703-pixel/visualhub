from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import json
import time
from datetime import datetime
from openai import OpenAI

app = FastAPI(
    title="TOONVERSE Director Engine",
    version="1.0.0",
    description="AI-powered storyboard generation from script"
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
client = None
if os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class PanelInfo(BaseModel):
    panel_number: int
    scene: str
    location: str
    characters: List[str]
    action: str
    dialogue: str
    camera_angle: str
    mood: str
    visual_prompt: str

class DirectorRequest(BaseModel):
    project: Dict[str, Any]
    episode: Dict[str, Any]
    inputs: Optional[Dict[str, Any]] = {}
    options: Optional[Dict[str, Any]] = {}

class DirectorResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/")
def root():
    """
    Health check endpoint
    """
    return {
        "service": "TOONVERSE Director Engine",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    """
    Detailed health check
    """
    openai_status = "configured" if client else "not_configured"
    
    return {
        "status": "healthy",
        "service": "director_engine",
        "openai_api": openai_status,
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "/",
            "/health",
            "/engine/director/storyboard"
        ]
    }

@app.post("/engine/director/storyboard", response_model=DirectorResponse)
def create_storyboard(request: DirectorRequest):
    """
    시나리오를 패널 단위 컷 리스트로 변환
    
    입력: 시나리오 텍스트
    출력: 패널별 비주얼 지시서 (JSON)
    """
    start_time = time.time()
    
    try:
        # 입력 파라미터 추출
        script_text = request.episode.get('script_text', '')
        project_title = request.project.get('title', 'Unknown')
        genre = request.project.get('genre', 'Unknown')
        tone = request.project.get('tone', 'serious')
        
        target_panels = request.inputs.get('target_panels', 15)
        style = request.options.get('style', 'webtoon')
        
        if not script_text:
            raise HTTPException(status_code=400, detail="script_text is required")
        
        # OpenAI API 호출
        if not client:
            # MVP: 더미 데이터 (OpenAI API 키 없을 때)
            panels = generate_dummy_storyboard(
                script_text, 
                target_panels,
                genre,
                tone
            )
        else:
            # Production: 실제 GPT-4 호출
            panels = generate_storyboard_with_gpt4(
                script_text,
                project_title,
                genre,
                tone,
                target_panels,
                style
            )
        
        processing_time = time.time() - start_time
        
        return DirectorResponse(
            success=True,
            result={
                "panels": panels,
                "total_panels": len(panels),
                "estimated_duration": len(panels) * 3  # 패널당 3초 예상
            },
            metadata={
                "engine_version": "1.0.0",
                "cost_units": 0.15 if client else 0.0,  # GPT-4 비용
                "processing_time": round(processing_time, 2),
                "model": "gpt-4" if client else "dummy",
                "warnings": [] if client else ["Using dummy data - OPENAI_API_KEY not configured"]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_storyboard_with_gpt4(
    script_text: str,
    project_title: str,
    genre: str,
    tone: str,
    target_panels: int,
    style: str
) -> List[Dict[str, Any]]:
    """
    GPT-4를 사용하여 시나리오를 컷 리스트로 변환
    """
    
    system_prompt = f"""당신은 전문 웹툰 연출가입니다.
주어진 시나리오를 {target_panels}개의 패널로 나누고, 각 패널의 상세한 비주얼 지시서를 작성하세요.

각 패널은 다음 정보를 포함해야 합니다:
- panel_number: 패널 번호 (1부터 시작)
- scene: 씬 이름 (예: "오프닝", "전개", "클라이맥스")
- location: 배경/장소
- characters: 등장하는 캐릭터 리스트
- action: 패널에서 일어나는 액션/행동
- dialogue: 대사 (없으면 빈 문자열)
- camera_angle: 카메라 앵글 (close-up, medium shot, wide shot, bird's eye 등)
- mood: 분위기/감정
- visual_prompt: 이미지 생성 AI를 위한 영어 프롬프트 (상세하게)

장르: {genre}
톤: {tone}
스타일: {style}

JSON 배열로 응답하세요."""

    user_prompt = f"""작품: {project_title}

시나리오:
{script_text}

위 시나리오를 {target_panels}개의 패널로 나누고, 각 패널의 비주얼 지시서를 JSON 형식으로 작성하세요."""

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=4000
        )
        
        result_text = response.choices[0].message.content
        result_json = json.loads(result_text)
        
        # panels 키가 있으면 추출, 없으면 전체를 panels로 간주
        if "panels" in result_json:
            panels = result_json["panels"]
        else:
            panels = result_json if isinstance(result_json, list) else [result_json]
        
        return panels
        
    except Exception as e:
        print(f"GPT-4 API Error: {e}")
        # 에러 발생 시 더미 데이터로 폴백
        return generate_dummy_storyboard(script_text, target_panels, genre, tone)

def generate_dummy_storyboard(
    script_text: str,
    target_panels: int,
    genre: str,
    tone: str
) -> List[Dict[str, Any]]:
    """
    더미 컷 리스트 생성 (MVP용)
    """
    panels = []
    
    # 시나리오에서 씬 추출 (간단한 파싱)
    scenes = []
    for line in script_text.split('\n'):
        if line.startswith('## 씬'):
            scenes.append(line.replace('## 씬', '').strip())
    
    if not scenes:
        scenes = ["오프닝", "전개", "클라이맥스", "여운", "클리프행어"]
    
    panels_per_scene = max(1, target_panels // len(scenes))
    
    for i in range(target_panels):
        scene_idx = min(i // panels_per_scene, len(scenes) - 1)
        scene = scenes[scene_idx]
        
        panel = {
            "panel_number": i + 1,
            "scene": scene,
            "location": "도시의 거리" if i % 3 == 0 else "실내 공간" if i % 3 == 1 else "넓은 광장",
            "characters": ["주인공"] if i % 2 == 0 else ["주인공", "조력자"],
            "action": f"패널 {i+1}의 주요 액션",
            "dialogue": f"대사 내용 {i+1}" if i % 3 != 0 else "",
            "camera_angle": ["close-up", "medium shot", "wide shot", "bird's eye"][i % 4],
            "mood": tone,
            "visual_prompt": f"A {tone} scene in {genre} style, panel {i+1}, cinematic lighting, detailed background"
        }
        
        panels.append(panel)
    
    return panels

if __name__ == "__main__":
    print("=" * 60)
    print("🎬 TOONVERSE Director Engine Starting...")
    print("=" * 60)
    print(f"📍 API URL: http://0.0.0.0:8002")
    print(f"📚 Docs: http://0.0.0.0:8002/docs")
    print(f"🔍 Health: http://0.0.0.0:8002/health")
    print(f"🔑 OpenAI API: {'✅ Configured' if client else '❌ Not Configured (using dummy data)'}")
    print("=" * 60)
    
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )
