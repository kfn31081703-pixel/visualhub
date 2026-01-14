'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Panel {
  panel_number: number;
  scene: string;
  location: string;
  characters: string[];
  action: string;
  dialogue: string;
  camera_angle: string;
  mood: string;
  visual_prompt: string;
}

interface Episode {
  id: number;
  project_id: number;
  episode_number: number;
  title: string;
  status: string;
  storyboard_json: {
    panels: Panel[];
    total_panels: number;
    estimated_duration: number;
  } | null;
  created_at: string;
}

export default function EpisodeStoryboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEpisode();
  }, [params.id]);

  const fetchEpisode = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`/api/episodes/${params.id}`, {
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
    } catch (error) {
      console.error('Failed to fetch episode:', error);
      setError('에피소드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || '에피소드를 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  const storyboard = episode.storyboard_json;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {episode.episode_number}화: {episode.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">스토리보드</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          episode.status === 'completed' ? 'bg-green-100 text-green-800' :
          episode.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          episode.status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {episode.status}
        </span>
      </div>

      {/* Storyboard Summary */}
      {storyboard && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">요약 정보</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">총 패널 수</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{storyboard.total_panels}개</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">예상 재생 시간</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{storyboard.estimated_duration}초</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">에피소드 ID</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{episode.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Panels */}
      {!storyboard ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">스토리보드가 아직 생성되지 않았습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {storyboard.panels.map((panel) => (
            <div key={panel.panel_number} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-900">
                  패널 {panel.panel_number} - {panel.scene}
                </h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">장소</p>
                    <p className="mt-1 text-sm text-gray-900">{panel.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">등장인물</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {panel.characters.map((char, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">액션</p>
                    <p className="mt-1 text-sm text-gray-900">{panel.action}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">대사</p>
                    <p className="mt-1 text-sm text-gray-900">{panel.dialogue || '(없음)'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">카메라 앵글</p>
                    <p className="mt-1 text-sm text-gray-900">{panel.camera_angle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">분위기</p>
                    <p className="mt-1 text-sm text-gray-900">{panel.mood}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">비주얼 프롬프트</p>
                    <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {panel.visual_prompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
