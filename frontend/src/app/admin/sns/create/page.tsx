'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Twitter, Facebook, Instagram, Music, Image as ImageIcon, Video, Upload, Save, Send } from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toonverse.store';

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  project?: {
    id: number;
    title: string;
  };
}

// Mock episodes
const mockEpisodes: Episode[] = [
  {
    id: 1,
    episode_number: 1,
    title: '각성의 시작',
    project: { id: 1, title: '악당이지만 정의로운' },
  },
  {
    id: 16,
    episode_number: 1,
    title: '첫 번째 에피소드',
    project: { id: 11, title: '테스트 웹툰' },
  },
];

export default function CreateSnsPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>(mockEpisodes);
  const [formData, setFormData] = useState({
    episode_id: '',
    platform: 'twitter',
    content: '',
    scheduled_at: '',
    status: 'draft',
  });
  const [mediaFiles, setMediaFiles] = useState<{
    image: File | null;
    video: File | null;
  }>({
    image: null,
    video: null,
  });
  const [mediaPreview, setMediaPreview] = useState<{
    image: string | null;
    video: string | null;
  }>({
    image: null,
    video: null,
  });

  useEffect(() => {
    // Load real episodes in background
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const allEpisodes: Episode[] = [];
        data.data.forEach((project: any) => {
          if (project.episodes) {
            project.episodes.forEach((episode: any) => {
              allEpisodes.push({
                ...episode,
                project: {
                  id: project.id,
                  title: project.title,
                },
              });
            });
          }
        });
        setEpisodes(allEpisodes);
      }
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFiles({ ...mediaFiles, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ ...mediaPreview, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFiles({ ...mediaFiles, video: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ ...mediaPreview, video: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMedia = async () => {
    // TODO: Implement media upload to storage
    // For now, return mock URL
    if (mediaFiles.image) {
      return 'https://example.com/uploaded-image.jpg';
    }
    if (mediaFiles.video) {
      return 'https://example.com/uploaded-video.mp4';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent, postNow: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload media if exists
      const mediaUrl = await uploadMedia();

      const payload = {
        ...formData,
        episode_id: parseInt(formData.episode_id),
        image_url: mediaUrl,
        status: postNow ? 'scheduled' : formData.status,
        scheduled_at: postNow ? new Date(Date.now() + 60000).toISOString() : formData.scheduled_at || null,
      };

      const response = await fetch(`${API_BASE_URL}/api/sns/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(postNow ? '게시물이 예약되었습니다!' : '게시물이 저장되었습니다!');
        router.push('/admin/sns');
      } else {
        alert('오류: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('게시물 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
      case 'twitter': return 'border-blue-500 bg-blue-50';
      case 'facebook': return 'border-blue-700 bg-blue-50';
      case 'instagram': return 'border-pink-500 bg-pink-50';
      case 'tiktok': return 'border-black bg-gray-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link 
          href="/admin/sns" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          SNS 관리로 돌아가기
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          SNS 홍보글 작성
        </h1>
        <p className="text-gray-600 mb-8">
          새로운 SNS 홍보 게시물을 작성하세요
        </p>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Platform Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              플랫폼 선택
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['twitter', 'facebook', 'instagram', 'tiktok'].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setFormData({ ...formData, platform })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.platform === platform
                      ? getPlatformColor(platform) + ' border-2'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {getPlatformIcon(platform)}
                    <span className="text-sm font-medium capitalize">{platform}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Episode Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              에피소드 선택
            </label>
            <select
              value={formData.episode_id}
              onChange={(e) => setFormData({ ...formData, episode_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">에피소드를 선택하세요</option>
              {episodes.map((episode) => (
                <option key={episode.id} value={episode.id}>
                  {episode.project?.title} - 에피소드 {episode.episode_number}화
                  {episode.title && `: ${episode.title}`}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              게시물 내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="SNS에 게시할 내용을 작성하세요..."
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.content.length} 글자
              {formData.platform === 'twitter' && ' (최대 280자 권장)'}
            </p>
          </div>

          {/* Media Upload */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              미디어 첨부
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">이미지</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {mediaPreview.image ? (
                      <img
                        src={mediaPreview.image}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">클릭하여 이미지 업로드</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (최대 10MB)</p>
                      </>
                    )}
                  </label>
                </div>
                {mediaFiles.image && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFiles({ ...mediaFiles, image: null });
                      setMediaPreview({ ...mediaPreview, image: null });
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    이미지 제거
                  </button>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">동영상</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    {mediaPreview.video ? (
                      <video
                        src={mediaPreview.video}
                        controls
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : (
                      <>
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">클릭하여 동영상 업로드</p>
                        <p className="text-xs text-gray-400 mt-1">MP4, MOV (최대 100MB)</p>
                      </>
                    )}
                  </label>
                </div>
                {mediaFiles.video && (
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFiles({ ...mediaFiles, video: null });
                      setMediaPreview({ ...mediaPreview, video: null });
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    동영상 제거
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예약 시간 (선택사항)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              비워두면 초안으로 저장됩니다
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? '저장 중...' : '초안 저장'}
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-5 h-5 mr-2" />
              {loading ? '예약 중...' : '예약 게시'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
