'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Twitter, Facebook, Instagram, Plus, Check, X, RefreshCw, Settings, Music } from 'lucide-react';

interface SnsAccount {
  id: number;
  platform: string;
  account_name: string;
  account_id: string | null;
  is_active: boolean;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function SnsAccountsPage() {
  const [accounts, setAccounts] = useState<SnsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    platform: 'twitter',
    account_name: '',
    account_id: '',
    is_active: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/sns/accounts');
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (accountId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/sns/accounts/${accountId}/toggle-active`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to toggle account:', error);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/api/sns/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      });
      const data = await response.json();
      
      if (data.success) {
        alert('계정이 추가되었습니다!');
        setShowAddModal(false);
        setNewAccount({
          platform: 'twitter',
          account_name: '',
          account_id: '',
          is_active: true,
        });
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to add account:', error);
      alert('계정 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (accountId: number) => {
    if (!confirm('이 계정을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/sns/accounts/${accountId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('계정이 삭제되었습니다.');
        fetchAccounts();
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-6 h-6" />;
      case 'facebook': return <Facebook className="w-6 h-6" />;
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'tiktok': return <Music className="w-6 h-6" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'from-blue-400 to-blue-600';
      case 'facebook': return 'from-blue-600 to-blue-800';
      case 'instagram': return 'from-purple-500 to-pink-500';
      case 'tiktok': return 'from-gray-900 to-black';
      default: return 'from-gray-400 to-gray-600';
    }
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
          href="/admin/sns" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          SNS 관리로 돌아가기
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              SNS 계정 관리
            </h1>
            <p className="text-gray-600">
              연결된 소셜 미디어 계정을 관리하세요
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" />
            계정 추가
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">연결된 SNS 계정이 없습니다.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              첫 계정 추가하기
            </button>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`h-32 bg-gradient-to-br ${getPlatformColor(account.platform)} flex items-center justify-center`}>
                <div className="text-white">
                  {getPlatformIcon(account.platform)}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 capitalize">
                    {account.platform}
                  </h3>
                  
                  <button
                    onClick={() => handleToggleActive(account.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      account.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {account.is_active ? '활성' : '비활성'}
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">계정명</p>
                    <p className="text-sm font-medium text-gray-900">{account.account_name}</p>
                  </div>
                  
                  {account.account_id && (
                    <div>
                      <p className="text-sm text-gray-500">계정 ID</p>
                      <p className="text-sm font-medium text-gray-900">{account.account_id}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">연결 날짜</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(account.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleActive(account.id)}
                    className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                  >
                    {account.is_active ? '비활성화' : '활성화'}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SNS 계정 추가</h2>
            
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  플랫폼
                </label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계정명
                </label>
                <input
                  type="text"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="@toonverse"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계정 ID (선택)
                </label>
                <input
                  type="text"
                  value={newAccount.account_id}
                  onChange={(e) => setNewAccount({ ...newAccount, account_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="123456789"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newAccount.is_active}
                  onChange={(e) => setNewAccount({ ...newAccount, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  즉시 활성화
                </label>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
