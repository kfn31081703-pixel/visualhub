'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DashboardStats {
  today: {
    episodes_created: number;
    jobs_completed: number;
    success_rate: number;
    avg_cost: number;
  };
  by_status: {
    queued: number;
    running: number;
    done: number;
    failed: number;
  };
  by_type: {
    [key: string]: number;
  };
}

interface Project {
  id: number;
  title: string;
  genre: string;
  status: string;
}

interface Job {
  id: number;
  type: string;
  status: string;
}

// Mock data
const mockStats: DashboardStats = {
  today: {
    episodes_created: 5,
    jobs_completed: 12,
    success_rate: 95,
    avg_cost: 2.5,
  },
  by_status: {
    queued: 2,
    running: 3,
    done: 12,
    failed: 1,
  },
  by_type: {
    'text.script': 5,
    'director.storyboard': 5,
    'image.render': 5,
  },
};

const mockProjects: Project[] = [
  { id: 1, title: '악당이지만 정의로운', genre: '판타지 액션', status: 'active' },
  { id: 11, title: '테스트 웹툰', genre: 'action', status: 'active' },
];

export default function AdminPage() {
  const [stats] = useState<DashboardStats>(mockStats);
  const [projects] = useState<Project[]>(mockProjects);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">TOONVERSE AI 웹툰 생성 현황</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">총 프로젝트</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{projects.length}</div>
          <p className="text-sm text-gray-500 mt-2">활성 웹툰 프로젝트</p>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">성공률</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.today.success_rate.toFixed(1)}%</div>
          <p className="text-sm text-gray-500 mt-2">완료된 작업 성공률</p>
        </div>

        {/* Running Jobs */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">실행 중</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.by_status.running}</div>
          <p className="text-sm text-gray-500 mt-2">현재 생성 중인 작업</p>
        </div>

        {/* Failed Jobs */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">실패</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats?.by_status.failed}</div>
          <p className="text-sm text-gray-500 mt-2">실패한 작업</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">최근 프로젝트</h2>
          <Link href="/admin/projects" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            전체 보기 →
          </Link>
        </div>
        <div className="space-y-4">
          {projects.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-500">{project.genre}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {project.status === 'active' ? '활성' : '비활성'}
                </span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              아직 프로젝트가 없습니다.
              <br />
              <Link href="/admin/projects" className="text-indigo-600 hover:underline mt-2 inline-block">
                첫 프로젝트 만들기 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">빠른 시작</h2>
        <p className="mb-6">새로운 웹툰 프로젝트를 만들고 AI 자동 생성을 시작하세요.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/admin/projects?action=new"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            새 프로젝트 만들기
          </Link>
          <Link
            href="/admin/sns"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors"
          >
            SNS 홍보 관리
          </Link>
        </div>
      </div>
    </div>
  );
}

// Removed unused original dashboard code
