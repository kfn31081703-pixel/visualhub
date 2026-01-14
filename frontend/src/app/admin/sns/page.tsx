'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Twitter, Facebook, Instagram, Send, Calendar, Check, X, RefreshCw, Plus, Music } from 'lucide-react';

interface SnsPost {
  id: number;
  episode_id: number;
  platform: string;
  content: string;
  image_url: string | null;
  post_url: string | null;
  post_id: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
  episode?: {
    id: number;
    episode_number: number;
    title: string;
    project?: {
      title: string;
    };
  };
}

interface Statistics {
  total: number;
  by_status: {
    draft: number;
    scheduled: number;
    posted: number;
    failed: number;
  };
  by_platform: {
    twitter: number;
    facebook: number;
    instagram: number;
  };
}

// Mock data
const mockStatistics: Statistics = {
  total: 8,
  by_status: {
    draft: 2,
    scheduled: 3,
    posted: 2,
    failed: 1,
  },
  by_platform: {
    twitter: 3,
    facebook: 3,
    instagram: 2,
  },
};

const mockPosts: SnsPost[] = [
  {
    id: 1,
    episode_id: 1,
    platform: 'twitter',
    content: '새로운 에피소드가 업로드되었습니다! #웹툰',
    image_url: null,
    post_url: null,
    post_id: null,
    status: 'scheduled',
    scheduled_at: '2026-01-15T10:00:00Z',
    posted_at: null,
    created_at: '2026-01-14T08:00:00Z',
    episode: {
      id: 1,
      episode_number: 1,
      title: '각성의 시작',
      project: {
        title: '악당이지만 정의로운',
      },
    },
  },
];

export default function SnsManagementPage() {
  const [posts, setPosts] = useState<SnsPost[]>(mockPosts);
  const [statistics, setStatistics] = useState<Statistics>(mockStatistics);
  const [loading, setLoading] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Load real data in background
    fetchPosts();
    fetchStatistics();
  }, []);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterPlatform !== 'all') params.append('platform', filterPlatform);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/sns/posts?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/sns/statistics`);
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handlePostNow = async (postId: number) => {
    if (!confirm('이 게시물을 지금 바로 게시하시겠습니까?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/sns/posts/${postId}/post-now`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('게시물이 성공적으로 게시되었습니다!');
        fetchPosts();
        fetchStatistics();
      } else {
        alert('게시 실패: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to post:', error);
      alert('게시 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('이 게시물을 삭제하시겠습니까?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/sns/posts/${postId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('게시물이 삭제되었습니다.');
        fetchPosts();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-blue-500';
      case 'facebook': return 'bg-blue-700';
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'tiktok': return 'bg-black';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      posted: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      draft: '초안',
      scheduled: '예약됨',
      posted: '게시됨',
      failed: '실패',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link 
          href="/admin" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          관리자 페이지로 돌아가기
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              SNS 자동 홍보 관리
            </h1>
            <p className="text-gray-600">
              웹툰 에피소드를 SNS에 자동으로 홍보하세요
            </p>
          </div>
          
          <Link
            href="/admin/sns/create"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            홍보글 작성
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">전체 게시물</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.total}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">예약됨</h3>
            <p className="text-3xl font-bold text-yellow-600">{statistics.by_status.scheduled}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">게시됨</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.by_status.posted}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">실패</h3>
            <p className="text-3xl font-bold text-red-600">{statistics.by_status.failed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">플랫폼</label>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">전체</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">전체</option>
              <option value="draft">초안</option>
              <option value="scheduled">예약됨</option>
              <option value="posted">게시됨</option>
              <option value="failed">실패</option>
            </select>
          </div>
          
          <div className="ml-auto flex items-end">
            <button
              onClick={() => fetchPosts()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    플랫폼
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    에피소드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    내용 미리보기
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약 시간
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      게시물이 없습니다.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-white ${getPlatformColor(post.platform)}`}>
                          {getPlatformIcon(post.platform)}
                          <span className="ml-2 text-sm font-medium capitalize">{post.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.episode?.project?.title || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          에피소드 {post.episode?.episode_number}화
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2 max-w-md">
                          {post.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.scheduled_at ? (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(post.scheduled_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {post.status !== 'posted' && (
                            <button
                              onClick={() => handlePostNow(post.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50"
                              title="지금 게시"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          
                          {post.post_url && (
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                              title="게시물 보기"
                            >
                              <Check className="w-4 h-4" />
                            </a>
                          )}
                          
                          {post.status !== 'posted' && (
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                              title="삭제"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
