'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, FileText, Image as ImageIcon, Plus, X } from 'lucide-react';

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  status: string;
  created_at: string;
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

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [isCreatingEpisode, setIsCreatingEpisode] = useState(false);
  const [episodeFormData, setEpisodeFormData] = useState({
    episode_number: 0,
    title: '',
  });

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
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateEpisode = async (episodeId: number) => {
    try {
      // 확인 대화상자
      if (!confirm('이 에피소드를 활성화하시겠습니까?\n\n활성화하면 퍼블릭 갤러리에 표시됩니다.')) {
        return;
      }

      console.log(`에피소드 ${episodeId} 활성화 시도 중...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`/api/episodes/${episodeId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '에피소드 활성화에 실패했습니다.');
      }
      
      const data = await response.json();
      if (data.success) {
        alert(`✓ 에피소드가 성공적으로 활성화되었습니다!\n\n이제 퍼블릭 갤러리에서 확인할 수 있습니다.`);
        fetchProject(); // 프로젝트 정보 새로고침
      } else {
        alert(`✗ 활성화 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('Activation error:', error);
      if (error.name === 'AbortError') {
        alert('✗ 요청 시간 초과\n\n서버 응답이 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert(`✗ 에피소드 활성화 중 오류가 발생했습니다:\n\n${error.message || '알 수 없는 오류'}`);
      }
    }
  };

  const handleViewScript = (episodeId: number) => {
    router.push(`/admin/episodes/${episodeId}/script`);
  };

  const handleViewStoryboard = (episodeId: number) => {
    router.push(`/admin/episodes/${episodeId}/storyboard`);
  };

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsCreatingEpisode(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`/api/projects/${params.id}/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(episodeFormData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('에피소드 생성에 실패했습니다.');
      }
      
      const data = await response.json();
      if (data.success) {
        alert(`✓ 에피소드가 생성되었습니다!\n\n에피소드 ${data.data.episode_number}화가 추가되었습니다.`);
        setShowEpisodeModal(false);
        setEpisodeFormData({ episode_number: 0, title: '' });
        fetchProject(); // 프로젝트 정보 새로고침
      } else {
        alert(`✗ 에피소드 생성 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('Episode creation error:', error);
      if (error.name === 'AbortError') {
        alert('✗ 요청 시간 초과\n\n서버 응답이 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert(`✗ 에피소드 생성 중 오류가 발생했습니다:\n\n${error.message || '알 수 없는 오류'}`);
      }
    } finally {
      setIsCreatingEpisode(false);
    }
  };

  const openEpisodeModal = () => {
    const nextEpisodeNumber = (project?.episodes || []).length + 1;
    setEpisodeFormData({
      episode_number: nextEpisodeNumber,
      title: `에피소드 ${nextEpisodeNumber}`,
    });
    setShowEpisodeModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !project) {
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
          {error || '프로젝트를 찾을 수 없습니다.'}
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
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">프로젝트 ID: {project.id}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {project.status}
        </span>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">프로젝트 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">장르</p>
            <p className="mt-1 text-sm text-gray-900">{project.genre}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">대상 국가</p>
            <p className="mt-1 text-sm text-gray-900">{project.target_country}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">톤</p>
            <p className="mt-1 text-sm text-gray-900">{project.tone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">타겟 독자</p>
            <p className="mt-1 text-sm text-gray-900">{project.target_audience}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">키워드</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(project.keywords || []).map((keyword, index) => (
                <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500">세계관 설정</p>
            <p className="mt-1 text-sm text-gray-900">{project.world_setting}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">생성일</p>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(project.created_at).toLocaleString('ko-KR')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">에피소드 수</p>
            <p className="mt-1 text-sm text-gray-900">{(project.episodes || []).length}개</p>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">에피소드 목록</h2>
          <button
            onClick={openEpisodeModal}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 에피소드
          </button>
        </div>
        
        {(!project.episodes || project.episodes.length === 0) ? (
          <div className="px-6 py-8 text-center text-gray-500">
            아직 생성된 에피소드가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    에피소드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(project.episodes || []).map((episode) => (
                  <tr key={episode.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {episode.episode_number}화
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {episode.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        episode.status === 'completed' ? 'bg-green-100 text-green-800' :
                        episode.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        episode.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {episode.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(episode.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleActivateEpisode(episode.id)}
                          className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                          title="활성화"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          활성화
                        </button>
                        <button
                          onClick={() => handleViewScript(episode.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="스크립트 보기"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewStoryboard(episode.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="스토리보드 보기"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Episode Modal */}
      {showEpisodeModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEpisodeModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">새 에피소드 생성</h2>
              <button
                type="button"
                onClick={() => setShowEpisodeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEpisode} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  에피소드 번호 *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={episodeFormData.episode_number}
                  onChange={(e) => setEpisodeFormData({ ...episodeFormData, episode_number: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="예: 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  에피소드 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={episodeFormData.title}
                  onChange={(e) => setEpisodeFormData({ ...episodeFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="예: 운명의 만남"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>자동 생성:</strong> 에피소드 생성 후 스크립트와 스토리보드가 자동으로 생성됩니다.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEpisodeModal(false)}
                  disabled={isCreatingEpisode}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreatingEpisode}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreatingEpisode ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      생성 중...
                    </>
                  ) : (
                    '생성'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
