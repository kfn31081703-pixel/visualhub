'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AboutPage() {
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
              <Link href="/gallery" className="text-gray-700 hover:text-indigo-600 transition-colors">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">About TOONVERSE</h1>
        
        <div className="prose prose-lg">
          <p className="text-xl text-gray-600 mb-6">
            TOONVERSE는 AI 기술을 활용하여 웹툰을 자동으로 생성하는 혁신적인 플랫폼입니다.
          </p>
          
          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Mission</h2>
          <p className="text-gray-600">
            창작자들이 아이디어만으로 완성도 높은 웹툰을 만들 수 있도록 돕습니다.
          </p>
          
          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Technology</h2>
          <ul className="text-gray-600 space-y-2">
            <li>AI 기반 시나리오 생성</li>
            <li>자동 작화 및 캐릭터 디자인</li>
            <li>다국어 번역 및 현지화</li>
            <li>SNS 자동 배포</li>
          </ul>
        </div>
        
        <div className="mt-12">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
