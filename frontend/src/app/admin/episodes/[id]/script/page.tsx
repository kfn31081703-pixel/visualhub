'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Episode {
  id: number;
  project_id: number;
  episode_number: number;
  title: string;
  script_text: string;
  status: string;
  created_at: string;
}

export default function EpisodeScriptPage({ params }: { params: { id: string } }) {
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
            <p className="text-sm text-gray-500 mt-1">스크립트</p>
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

      {/* Script Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">스크립트 내용</h2>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
              {episode.script_text || '스크립트가 아직 생성되지 않았습니다.'}
            </pre>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">메타데이터</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">에피소드 ID</p>
            <p className="mt-1 text-sm text-gray-900">{episode.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">프로젝트 ID</p>
            <p className="mt-1 text-sm text-gray-900">{episode.project_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">생성일</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(episode.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">글자 수</p>
            <p className="mt-1 text-sm text-gray-900">
              {episode.script_text ? episode.script_text.length.toLocaleString() : 0}자
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
