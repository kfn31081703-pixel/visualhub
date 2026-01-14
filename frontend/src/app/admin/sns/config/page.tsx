'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Key, Check, X, RefreshCw, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://toonverse.store';

interface PlatformConfig {
  enabled: boolean;
  configured: boolean;
}

interface ConfigStatus {
  mock_mode: boolean;
  platforms: {
    twitter: PlatformConfig;
    facebook: PlatformConfig;
    instagram: PlatformConfig;
    tiktok: PlatformConfig;
  };
}

export default function SnsConfigPage() {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

  // Platform forms
  const [tiktokForm, setTiktokForm] = useState({
    client_key: '',
    client_secret: '',
    access_token: '',
    open_id: '',
  });

  const [twitterForm, setTwitterForm] = useState({
    api_key: '',
    api_secret: '',
    access_token: '',
    access_secret: '',
    bearer_token: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sns/config`);
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMockMode = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sns/config/mock-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !config?.mock_mode }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchConfig();
      }
    } catch (error) {
      console.error('Failed to toggle mock mode:', error);
      alert('Mock 모드 전환에 실패했습니다.');
    }
  };

  const updatePlatformConfig = async (platform: string, formData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sns/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, config: formData }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchConfig();
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('설정 업데이트에 실패했습니다.');
    }
  };

  const testConnection = async (platform: string, accessToken: string) => {
    setTesting(platform);
    setTestResults({ ...testResults, [platform]: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/sns/config/test/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json();
      setTestResults({ ...testResults, [platform]: data });
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResults({
        ...testResults,
        [platform]: { success: false, message: 'Connection test failed' },
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/sns"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SNS API 설정</h1>
                <p className="text-sm text-gray-600">
                  소셜 미디어 플랫폼 API 키를 관리합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mock Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Mock 모드</h2>
              <p className="text-sm text-gray-600">
                {config?.mock_mode
                  ? '현재 테스트 모드입니다. 실제 SNS에 게시되지 않습니다.'
                  : '실제 API를 사용합니다. SNS에 게시물이 실제로 업로드됩니다.'}
              </p>
            </div>
            <button
              onClick={toggleMockMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                config?.mock_mode
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {config?.mock_mode ? 'Mock 모드 (테스트)' : 'Real 모드 (실제)'}
            </button>
          </div>
        </div>

        {/* Platform Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {['twitter', 'facebook', 'instagram', 'tiktok'].map((platform) => {
            const status = config?.platforms[platform as keyof typeof config.platforms];
            return (
              <div key={platform} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 capitalize">{platform}</h3>
                  {status?.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {status?.configured ? '설정 완료' : 'API 키 필요'}
                </p>
              </div>
            );
          })}
        </div>

        {/* TikTok Configuration */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            TikTok API 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Key
              </label>
              <input
                type="text"
                value={tiktokForm.client_key}
                onChange={(e) =>
                  setTiktokForm({ ...tiktokForm, client_key: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TikTok Client Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Secret
              </label>
              <input
                type="password"
                value={tiktokForm.client_secret}
                onChange={(e) =>
                  setTiktokForm({ ...tiktokForm, client_secret: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TikTok Client Secret"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="text"
                value={tiktokForm.access_token}
                onChange={(e) =>
                  setTiktokForm({ ...tiktokForm, access_token: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TikTok Access Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Open ID
              </label>
              <input
                type="text"
                value={tiktokForm.open_id}
                onChange={(e) =>
                  setTiktokForm({ ...tiktokForm, open_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TikTok Open ID"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => updatePlatformConfig('tiktok', tiktokForm)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                설정 저장
              </button>
              <button
                onClick={() => testConnection('tiktok', tiktokForm.access_token)}
                disabled={testing === 'tiktok' || !tiktokForm.access_token}
                className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {testing === 'tiktok' ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    테스트 중...
                  </span>
                ) : (
                  '연결 테스트'
                )}
              </button>
            </div>

            {testResults.tiktok && (
              <div
                className={`p-4 rounded-lg ${
                  testResults.tiktok.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {testResults.tiktok.message}
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>도움말:</strong> API 키 발급 방법은{' '}
            <a
              href="/SNS_API_INTEGRATION_GUIDE.md"
              target="_blank"
              className="underline font-medium"
            >
              SNS API 연동 가이드
            </a>
            를 참조하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
