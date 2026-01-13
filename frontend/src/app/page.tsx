'use client';

import Link from 'next/link';
import { Sparkles, Zap, Globe, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">
                TOONVERSE
              </span>
            </div>
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

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-display font-bold text-gray-900 mb-6">
              AI가 만드는
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                무한한 웹툰 세계
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              키워드만 입력하면 AI가 시나리오부터 작화, 식자까지 완전 자동으로 웹툰을 생성합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                웹툰 보러가기
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-full hover:bg-indigo-50 transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                웹툰 만들기
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-center text-gray-900 mb-16">
            TOONVERSE의 특별함
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">완전 자동화</h3>
              <p className="text-gray-600">
                키워드 입력만으로 시나리오, 콘티, 작화, 식자까지 60초 만에 완성
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-2xl mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">다국어 지원</h3>
              <p className="text-gray-600">
                한국어, 영어, 일본어 등 다양한 언어로 자동 번역 및 현지화
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 text-white rounded-2xl mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">SNS 자동 배포</h3>
              <p className="text-gray-600">
                YouTube, Instagram, TikTok 등 다양한 플랫폼에 자동 업로드
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-indigo-200">생성된 웹툰</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-indigo-200">총 에피소드</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">60s</div>
              <div className="text-indigo-200">평균 생성 시간</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-indigo-200">성공률</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6" />
                <span className="text-xl font-display font-bold">TOONVERSE</span>
              </div>
              <p className="text-gray-400">
                AI가 만드는 무한한 웹툰 세계
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/gallery" className="hover:text-white transition-colors">갤러리</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">관리자</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">
                Email: hello@toonverse.store
                <br />
                GitHub: github.com/toonverse
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 TOONVERSE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
