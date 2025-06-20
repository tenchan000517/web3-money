'use client';

import dynamic from 'next/dynamic';

// Hydrationエラーを防ぐため、動的インポートを使用
const DynamicVotingPage = dynamic(
  () => import('./VotingPageContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }
);

interface VotingPageWrapperProps {
  votePage: 'basic' | 'premium';
}

export default function VotingPageWrapper({ votePage }: VotingPageWrapperProps) {
  return <DynamicVotingPage votePage={votePage} />;
}