'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, List, ChevronLeft, ChevronRight } from 'lucide-react';

interface Panel {
  panel_number: number;
  mood: string;
  scene: string;
  actions: string[];
  visual_prompt: string;
}

interface Episode {
  id: number;
  project_id: number;
  episode_number: number;
  title: string;
  status: string;
  script_text: string;
  storyboard_json?: {
    panels?: Panel[];
    total_panels?: number;
    estimated_duration?: number;
    scenes_count?: number;
  };
  created_at: string;
}

export default function EpisodeViewerPage({ 
  params 
}: { 
  params: { id: string; episodeId: string } 
}) {
  const router = useRouter();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    fetchEpisode();
  }, [params.episodeId]);

  const fetchEpisode = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/episodes/${params.episodeId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('에피소드를 찾을 수 없습니다.');
      }

      const data = await response.json();
      
      if (data.success) {
        setEpisode(data.data);
        setError(null);
      } else {
        setError('에피소드를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('Failed to fetch episode:', error);
      if (error.name === 'AbortError') {
        setError('서버 응답 시간 초과. 잠시 후 다시 시도해주세요.');
      } else {
        setError('에피소드를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPanel = () => {
    if (currentPanel > 0) {
      setCurrentPanel(currentPanel - 1);
    }
  };

  const handleNextPanel = () => {
    const totalPanels = episode?.storyboard_json?.panels?.length || 0;
    if (currentPanel < totalPanels - 1) {
      setCurrentPanel(currentPanel + 1);
    }
  };

  const handleBackToWebtoon = () => {
    router.push(`/webtoon/${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-white">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">에피소드를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '요청하신 에피소드가 존재하지 않습니다.'}</p>
          <button
            onClick={handleBackToWebtoon}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            웹툰으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const panels = episode.storyboard_json?.panels || [];
  const currentPanelData = panels[currentPanel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToWebtoon}
              className="inline-flex items-center text-white hover:text-indigo-400 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              목록으로
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-white">
                {episode.episode_number}화: {episode.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {currentPanel + 1} / {panels.length}
              </p>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center text-white hover:text-indigo-400 font-medium"
            >
              <Home className="w-5 h-5 mr-2" />
              갤러리
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {panels.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">패널이 없습니다</h2>
            <p className="text-gray-600 mb-6">이 에피소드에는 아직 스토리보드 패널이 생성되지 않았습니다.</p>
            <button
              onClick={handleBackToWebtoon}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              웹툰으로 돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* Panel Display */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
              {/* Panel Image Placeholder */}
              <div className="aspect-[9/16] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                <div className="text-center text-white p-8">
                  <div className="text-6xl font-bold mb-4">{currentPanel + 1}</div>
                  <div className="text-xl mb-2">패널 #{currentPanelData?.panel_number}</div>
                  <div className="text-sm opacity-75">이미지 생성 예정</div>
                </div>
                
                {/* Navigation Overlay */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button
                    onClick={handlePrevPanel}
                    disabled={currentPanel === 0}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentPanel === 0
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-white/90 hover:bg-white hover:scale-110'
                    }`}
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={handleNextPanel}
                    disabled={currentPanel === panels.length - 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentPanel === panels.length - 1
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-white/90 hover:bg-white hover:scale-110'
                    }`}
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                </div>
              </div>

              {/* Panel Info */}
              <div className="p-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">분위기</h3>
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                      {currentPanelData?.mood}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">장면</h3>
                    <p className="text-gray-600">{currentPanelData?.scene}</p>
                  </div>

                  {currentPanelData?.actions && currentPanelData.actions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">액션</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {currentPanelData.actions.map((action, index) => (
                          <li key={index} className="text-gray-600">{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">비주얼 프롬프트</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {currentPanelData?.visual_prompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handlePrevPanel}
                disabled={currentPanel === 0}
                className={`inline-flex items-center px-6 py-3 rounded-full transition-all ${
                  currentPanel === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                이전 패널
              </button>

              <div className="text-white text-center">
                <div className="text-lg font-bold">
                  {currentPanel + 1} / {panels.length}
                </div>
                <div className="text-sm text-gray-400">패널</div>
              </div>

              <button
                onClick={handleNextPanel}
                disabled={currentPanel === panels.length - 1}
                className={`inline-flex items-center px-6 py-3 rounded-full transition-all ${
                  currentPanel === panels.length - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                다음 패널
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Panel Thumbnails */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">모든 패널</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {panels.map((panel, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPanel(index)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                      currentPanel === index
                        ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
