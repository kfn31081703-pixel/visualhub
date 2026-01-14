'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Image as ImageIcon,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalEpisodes: number;
  activeProjects: number;
  completedEpisodes: number;
  processingJobs: number;
  failedJobs: number;
}

interface RecentProject {
  id: number;
  title: string;
  status: string;
  created_at: string;
  episodes_count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalEpisodes: 0,
    activeProjects: 0,
    completedEpisodes: 0,
    processingJobs: 0,
    failedJobs: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();
      
      if (projectsData.success) {
        const projects = projectsData.data;
        
        // Calculate stats
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p: any) => p.status === 'active').length;
        
        let totalEpisodes = 0;
        let completedEpisodes = 0;
        
        projects.forEach((project: any) => {
          if (project.episodes) {
            totalEpisodes += project.episodes.length;
            completedEpisodes += project.episodes.filter(
              (ep: any) => ep.status === 'completed' || ep.status === 'active'
            ).length;
          }
        });
        
        setStats({
          totalProjects,
          totalEpisodes,
          activeProjects,
          completedEpisodes,
          processingJobs: 0, // TODO: Fetch from jobs API
          failedJobs: 0,
        });
        
        // Set recent projects
        const sortedProjects = projects
          .sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            created_at: p.created_at,
            episodes_count: p.episodes?.length || 0,
          }));
        
        setRecentProjects(sortedProjects);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-1">TOONVERSE 프로젝트 현황</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">전체 프로젝트</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{stats.activeProjects} 활성</span>
          </div>
        </div>

        {/* Total Episodes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">전체 에피소드</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEpisodes}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ImageIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{stats.completedEpisodes} 완료</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 프로젝트</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeProjects}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <BarChart className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-gray-600">
              {stats.totalProjects > 0 
                ? Math.round((stats.activeProjects / stats.totalProjects) * 100) 
                : 0}% 활성화율
            </span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">완료율</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalEpisodes > 0 
                  ? Math.round((stats.completedEpisodes / stats.totalEpisodes) * 100) 
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-gray-600">
              {stats.totalEpisodes - stats.completedEpisodes} 진행 중
            </span>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">최근 프로젝트</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  에피소드
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
              {recentProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    프로젝트가 없습니다.
                  </td>
                </tr>
              ) : (
                recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.episodes_count}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        보기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/projects"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">프로젝트 관리</h3>
              <p className="text-sm text-gray-600">프로젝트 생성 및 관리</p>
            </div>
          </div>
        </Link>

        <Link
          href="/gallery"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">갤러리 보기</h3>
              <p className="text-sm text-gray-600">공개된 웹툰 확인</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/jobs"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">작업 현황</h3>
              <p className="text-sm text-gray-600">생성 작업 모니터링</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
