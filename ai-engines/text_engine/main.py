from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn
import time
from datetime import datetime

app = FastAPI(
    title="TOONVERSE Text Engine",
    version="1.0.0",
    description="AI-powered script generation for webtoons"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EngineRequest(BaseModel):
    project: Dict[str, Any]
    episode: Dict[str, Any]
    inputs: Optional[Dict[str, Any]] = {}
    options: Optional[Dict[str, Any]] = {}

class EngineResponse(BaseModel):
    success: bool
    result: Dict[str, Any]
    metadata: Dict[str, Any]

@app.get("/")
def root():
    """
    Health check endpoint
    """
    return {
        "service": "TOONVERSE Text Engine",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    """
    Detailed health check
    """
    return {
        "status": "healthy",
        "service": "text_engine",
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "/",
            "/health",
            "/engine/text/script"
        ]
    }

@app.post("/engine/text/script", response_model=EngineResponse)
def generate_script(request: EngineRequest):
    """
    시나리오 자동 생성
    MVP: 더미 데이터 반환
    V1: 실제 LLM API 연동
    """
    start_time = time.time()
    
    try:
        # 프로젝트 정보 추출
        project = request.project
        episode = request.episode
        keywords = request.inputs.get('keywords', [])
        target_word_count = request.inputs.get('target_word_count', 2000)
        
        # 옵션
        language = request.options.get('language', 'ko')
        include_clifhanger = request.options.get('include_clifhanger', True)
        tone = request.options.get('tone', 'serious')
        
        # MVP: 더미 시나리오 생성
        # TODO: 실제 LLM (GPT-4, Claude 등) 연동
        script_text = generate_dummy_script(
            project.get('title', 'Unknown'),
            project.get('genre', 'Unknown'),
            episode.get('episode_number', 1),
            keywords,
            tone
        )
        
        # 씬 분석 (간단한 파싱)
        scenes = parse_scenes(script_text)
        
        processing_time = time.time() - start_time
        
        return EngineResponse(
            success=True,
            result={
                "script_text": script_text,
                "scenes": scenes,
                "word_count": len(script_text.split()),
                "estimated_panels": len(scenes) * 3,
                "character_count": len(script_text),
                "scenes_count": len(scenes)
            },
            metadata={
                "engine_version": "1.0.0-mvp",
                "cost_units": 0.50,
                "processing_time": round(processing_time, 2),
                "model": "dummy",
                "language": language,
                "warnings": ["This is a dummy implementation for MVP. Integrate real LLM for production."]
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_dummy_script(title: str, genre: str, episode_number: int, keywords: List[str], tone: str = "serious") -> str:
    """더미 시나리오 생성 (MVP용)"""
    keyword_text = ", ".join(keywords) if keywords else "모험, 성장, 우정"
    
    # 장르별 톤 조정
    tone_adjectives = {
        "serious": "진지하고 긴장감 넘치는",
        "comedy": "유쾌하고 재미있는",
        "dark": "어둡고 무거운",
        "light": "밝고 경쾌한"
    }
    
    tone_desc = tone_adjectives.get(tone, "흥미로운")
    
    script = f"""# {title} - {episode_number}화

## 키워드
{keyword_text}

## 장르
{genre} - {tone_desc} 분위기

---

## 씬 1 - 오프닝
**배경**: 도시의 거리, 이른 아침

주인공은 새로운 도전 앞에 서 있다. 지난 {episode_number - 1}화의 사건 이후, 더 이상 물러설 곳이 없다.

**주인공의 독백**:
"이제 시작이야... 돌아갈 수 없어."

주인공은 결의에 찬 눈빛으로 앞을 바라본다. 오늘이 모든 것을 바꿀 날이 될 것이다.

---

## 씬 2 - 전개
**배경**: 낡은 건물 안, 긴장된 분위기

갈등이 고조된다. 예상치 못한 적대자가 등장하고, 주인공은 중요한 선택을 해야 한다.

**대사**:
- **주인공**: "넌 누구야? 왜 날 방해하는 거지?"
- **적대자**: "네가 무엇을 하려는지 다 알고 있어. 그건 허락할 수 없지."
- **주인공**: "내가 해낼 수 있을까... 아니, 해내야만 해!"

주변 사람들이 주인공을 지켜본다. 그들의 시선이 무겁다.

---

## 씬 3 - 클라이맥스
**배경**: 결전의 장소, 모든 것이 걸린 순간

긴장감이 최고조에 달한다. 주인공의 선택이 모든 이의 운명을 결정한다.

**대사**:
- **주인공**: "이제 끝이다! 더 이상 망설이지 않아!"

폭발적인 액션. 주인공의 능력이 각성한다. 모든 것이 빛과 소리로 가득 찬다.

**효과음**: 쾅! 쾅! 팍!

---

## 씬 4 - 여운
**배경**: 전투가 끝난 후, 고요한 순간

주인공은 승리했지만, 대가를 치렀다. 그리고 더 큰 진실을 마주하게 된다.

**대사**:
- **주인공**: "이겼어... 하지만 이게 끝이 아니야."
- **조력자**: "넌 해냈어. 이제 준비해야 해. 진짜는 이제부터야."

주인공은 멀리 수평선을 바라본다. 그곳에는 더 큰 위기가 기다리고 있다.

---

## 씬 5 - 클리프행어
**배경**: 어둠 속의 비밀 장소

신비한 인물이 나타난다. 그는 주인공에 대한 모든 것을 알고 있는 듯하다.

**대사**:
- **신비한 인물**: "네가 진실을 알게 될 날이 곧 온다..."

화면이 어둠 속으로 사라진다.

---

## [다음 화 예고]
{keyword_text}를 둘러싼 더 큰 음모가 밝혀진다!
주인공은 자신의 진정한 정체를 알게 될 것인가?

{episode_number + 1}화에서 계속!
"""
    
    return script

def parse_scenes(script_text: str) -> List[Dict[str, Any]]:
    """시나리오를 씬 단위로 파싱"""
    scenes = []
    lines = script_text.split('\n')
    
    current_scene = None
    for line in lines:
        if line.startswith('## 씬'):
            if current_scene:
                scenes.append(current_scene)
            
            # 씬 정보 파싱
            scene_parts = line.split(' - ')
            scene_number = len(scenes) + 1
            location = scene_parts[1] if len(scene_parts) > 1 else "Unknown"
            
            current_scene = {
                "scene_number": scene_number,
                "location": location,
                "description": "",
                "dialogue_count": 0,
                "has_action": False
            }
        elif current_scene:
            if line.strip().startswith('**배경**'):
                current_scene['description'] = line.strip()
            elif line.strip().startswith('-'):
                current_scene['dialogue_count'] += 1
            elif '효과음' in line or '쾅' in line or '팍' in line:
                current_scene['has_action'] = True
    
    if current_scene:
        scenes.append(current_scene)
    
    return scenes

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 TOONVERSE Text Engine Starting...")
    print("=" * 60)
    print(f"📍 API URL: http://0.0.0.0:8001")
    print(f"📚 Docs: http://0.0.0.0:8001/docs")
    print(f"🔍 Health: http://0.0.0.0:8001/health")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
