'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Eye, Play, Star } from 'lucide-react';

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  status: string;
  created_at: string;
  storyboard_json?: {
    panels?: any[];
    total_panels?: number;
    estimated_duration?: number;
  };
}

interface Project {
  id: number;
  title: string;
  genre: string;
  status: string;
  target_country: string;
  tone: string;
  target_audience: string;
  keywords: string[];
  world_setting: string;
  created_at: string;
  episodes: Episode[];
}

export default function WebtoonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/projects/${params.id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }

      const data = await response.json();
      
      if (data.success) {
        setProject(data.data);
        setError(null);
      } else {
        setError('프로젝트를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('Failed to fetch project:', error);
      if (error.name === 'AbortError') {
        setError('서버 응답 시간 초과. 잠시 후 다시 시도해주세요.');
      } else {
        setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeClick = (episodeId: number) => {
    router.push(`/webtoon/${params.id}/episode/${episodeId}`);
  };

  const handleBackToGallery = () => {
    router.push('/gallery');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Guard against null/undefined project
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">웹툰을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error || '요청하신 웹툰이 존재하지 않습니다.'}</p>
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            갤러리로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Safely extract data with default values - multiple layers of defense
  const safeProject = project || {};
  const activeEpisodes = Array.isArray(safeProject.episodes) 
    ? safeProject.episodes.filter(ep => ep && (ep.status === 'active' || ep.status === 'completed'))
    : [];
  const projectKeywords = Array.isArray(safeProject.keywords) ? safeProject.keywords : [];
  const projectWorldSetting = safeProject.world_setting || 'N/A';
  const projectTargetAudience = safeProject.target_audience || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            갤러리로 돌아가기
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="md:flex">
            {/* Thumbnail */}
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-12">
              <BookOpen className="w-32 h-32 text-white opacity-50" />
            </div>

            {/* Info */}
            <div className="md:w-2/3 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{safeProject.title || 'Untitled'}</h1>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                      {safeProject.genre || 'Unknown'}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      {safeProject.status === 'active' ? '연재중' : safeProject.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{activeEpisodes.length}</div>
                  <div className="text-xs text-gray-600">에피소드</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {activeEpisodes.reduce((sum, ep) => sum + (ep?.storyboard_json?.total_panels || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">총 컷 수</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{safeProject.tone || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">톤</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{safeProject.target_country || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">대상 국가</div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-sm font-semibold text-gray-700 w-32">타겟 연령:</span>
                  <span className="text-sm text-gray-600">{projectTargetAudience}</span>
                </div>
                {projectKeywords.length > 0 && (
                  <div className="flex items-start">
                    <span className="text-sm font-semibold text-gray-700 w-32">키워드:</span>
                    <div className="flex flex-wrap gap-2">
                      {projectKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="text-sm font-semibold text-gray-700 w-32">세계관:</span>
                  <span className="text-sm text-gray-600">{projectWorldSetting}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-sm font-semibold text-gray-700 w-32">생성일:</span>
                  <span className="text-sm text-gray-600">
                    {safeProject.created_at ? new Date(safeProject.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">에피소드 목록</h2>
            <span className="text-sm text-gray-600">총 {activeEpisodes.length}개</span>
          </div>

          {activeEpisodes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">아직 공개된 에피소드가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeClick(episode.id)}
                  className="flex items-center p-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  {/* Episode Number */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">{episode?.episode_number || '?'}</span>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {episode?.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{episode?.storyboard_json?.total_panels || 0}컷</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {episode?.created_at ? new Date(episode.created_at).toLocaleDateString('ko-KR') : 'N/A'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        episode?.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : episode?.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {episode?.status === 'active' ? '공개' : (episode?.status || 'Unknown')}
                      </span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            목록으로
          </button>
          <Link
            href={`/admin/projects/${safeProject.id || ''}`}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            관리자 페이지
          </Link>
        </div>
      </div>
    </div>
  );
}
