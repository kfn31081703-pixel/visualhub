'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect handler for /webtoon/[projectId]/[episodeId] -> /webtoon/[projectId]/episode/[episodeId]
 * This ensures backward compatibility with URLs like /webtoon/11/27
 */
export default function EpisodeRedirectPage({ 
  params 
}: { 
  params: { id: string; episodeId: string } 
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to proper episode viewer path
    router.replace(`/webtoon/${params.id}/episode/${params.episodeId}`);
  }, [params.id, params.episodeId, router]);

  // Show loading state during redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-white">에피소드로 이동 중...</p>
      </div>
    </div>
  );
}
