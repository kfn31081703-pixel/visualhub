'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, BookOpen, Clock, Eye } from 'lucide-react';

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
  created_at: string;
  episodes: Episode[];
}

export default function GalleryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('/api/projects', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('프로젝트를 불러올 수 없습니다.');
      }

      const data = await response.json();
      if (data.success) {
        // 활성화된 프로젝트만 필터링 (에피소드가 없어도 표시)
        const activeProjects = data.data.filter((project: Project) => 
          project.status === 'active'
        );
        setProjects(activeProjects);
        setFilteredProjects(activeProjects);
        
        // Extract unique genres
        const uniqueGenres = Array.from(new Set(activeProjects.map((p: Project) => p.genre).filter(Boolean))) as string[];
        setGenres(uniqueGenres);
        
        setError(null);
      } else {
        setError('프로젝트를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      if (error.name === 'AbortError') {
        setError('서버 응답 시간 초과. 잠시 후 다시 시도해주세요.');
      } else {
        setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/webtoon/${projectId}`);
  };

  const handleEpisodeClick = (projectId: number, episodeId: number) => {
    router.push(`/webtoon/${projectId}/episode/${episodeId}`);
  };

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre);
    if (genre === 'all') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) => project.genre === genre);
      setFilteredProjects(filtered);
    }
  };

  // Prevent hydration mismatch by not rendering content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">
                  TOONVERSE
                </span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/gallery" className="text-indigo-600 font-semibold">
                  갤러리
                </Link>
                <Link href="/admin" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                  관리자
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">
                TOONVERSE
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/gallery" className="text-indigo-600 font-semibold">
                갤러리
              </Link>
              <Link href="/admin" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
                관리자
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">웹툰 갤러리</h1>
          <p className="text-xl text-gray-600">AI가 생성한 웹툰을 감상하세요</p>
        </div>

        {/* Genre Filter */}
        {!loading && !error && genres.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">장르별 필터</h2>
              <span className="text-sm text-gray-600">
                {filteredProjects.length}개의 웹툰
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleGenreFilter('all')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedGenre === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 ({projects.length})
              </button>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreFilter(genre)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    selectedGenre === genre
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre} ({projects.filter((p) => p.genre === genre).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredProjects.length === 0 && selectedGenre === 'all' ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">아직 공개된 웹툰이 없습니다</h2>
              <p className="text-gray-600 mb-8">
                관리자 페이지에서 웹툰을 생성하고 활성화하면 이곳에 표시됩니다!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  홈으로 돌아가기
                </Link>
                <Link href="/admin" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                  관리자 페이지
                </Link>
              </div>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedGenre} 장르의 웹툰이 없습니다
              </h2>
              <p className="text-gray-600 mb-8">
                다른 장르를 선택하거나 전체 목록을 확인해보세요.
              </p>
              <button
                onClick={() => handleGenreFilter('all')}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                전체 보기
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleProjectClick(project.id)}
              >
                {/* 썸네일 영역 */}
                <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white opacity-50" />
                </div>

                {/* 프로젝트 정보 */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">
                      {project.title}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                      {project.status === 'active' ? '공개' : project.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    장르: {project.genre}
                  </p>

                  {/* 에피소드 목록 */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        에피소드 {(project.episodes || []).filter(ep => ep.status === 'active' || ep.status === 'completed').length}개
                      </span>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(project.episodes || [])
                        .filter(ep => ep.status === 'active' || ep.status === 'completed')
                        .map((episode) => (
                          <div
                            key={episode.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEpisodeClick(project.id, episode.id);
                            }}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {episode.episode_number}화
                              </span>
                              <span className="text-sm text-gray-600 line-clamp-1">
                                {episode.title}
                              </span>
                            </div>
                            {episode.storyboard_json?.total_panels && (
                              <span className="text-xs text-gray-500">
                                {episode.storyboard_json.total_panels}컷
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 생성일 */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-xs text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(project.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
