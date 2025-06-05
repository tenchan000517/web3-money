// 'use client';
// import { useState } from 'react';
// import { Applicant } from '@/lib/types';
// import { addVote, apiWithRetry } from '@/lib/api';

// interface VotingCardProps {
//   applicant: Applicant;
//   campaignId: string;
//   rank: number;
//   onVoteSuccess: () => void;
// }

// export default function VotingCard({ applicant, campaignId, rank, onVoteSuccess }: VotingCardProps) {
//   const [voting, setVoting] = useState(false);
//   const [hasVoted, setHasVoted] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleVote = async () => {
//     if (voting || hasVoted) return;

//     // 確認ダイアログ
//     const confirmed = window.confirm(`${getName()}さんに投票しますか？\n※お一人様1票でお願いします`);
//     if (!confirmed) return;

//     setVoting(true);
//     setError(null);
    
//     try {
//       await apiWithRetry(() => addVote(campaignId, applicant.id));
//       setHasVoted(true);
//       onVoteSuccess();
      
//       // 成功メッセージ
//       alert('✨ 投票ありがとうございました！\n投票が正常に記録されました。');
//     } catch (error) {
//       console.error('Failed to vote:', error);
//       setError('投票に失敗しました');
//       alert('❌ 投票に失敗しました。\nしばらく時間を置いてから再度お試しください。');
//     } finally {
//       setVoting(false);
//     }
//   };

//   const getName = () => {
//     return applicant.name || 
//            applicant['お名前'] || 
//            applicant['氏名'] || 
//            applicant['名前'] ||
//            `申請者${rank}`;
//   };

//   const getReason = () => {
//     return applicant.reason || 
//            applicant['支援理由'] || 
//            applicant['理由'] || 
//            applicant['支援内容'] ||
//            '記載なし';
//   };

//   const getAmount = () => {
//     const amount = applicant.amount || 
//                   applicant['希望金額'] || 
//                   applicant['金額'] || 
//                   applicant['支援金額'] || 
//                   0;
//     return typeof amount === 'string' ? parseInt(amount.replace(/[^\d]/g, ''), 10) || 0 : amount;
//   };

//   const getRankEmoji = (rank: number) => {
//     switch (rank) {
//       case 1: return '🥇';
//       case 2: return '🥈';
//       case 3: return '🥉';
//       default: return rank <= 10 ? '🏅' : '';
//     }
//   };

//   const getRankColor = (rank: number) => {
//     if (rank === 1) return 'border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50 to-white';
//     if (rank === 2) return 'border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-white';
//     if (rank === 3) return 'border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-white';
//     return 'border-l-4 border-blue-200 bg-white';
//   };

//   return (
//     <div className={`rounded-lg shadow hover:shadow-md transition-all duration-200 ${getRankColor(rank)}`}>
//       <div className="p-6">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1">
//             {/* ランクとタイトル */}
//             <div className="flex items-center gap-3 mb-3">
//               {rank <= 10 && (
//                 <span className="text-2xl">{getRankEmoji(rank)}</span>
//               )}
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium text-gray-500">#{rank}</span>
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   {getName()}
//                 </h3>
//               </div>
//             </div>
            
//             {/* 申請内容 */}
//             <div className="space-y-3 mb-4">
//               <div className="bg-gray-50 rounded-lg p-3">
//                 <p className="text-sm font-medium text-gray-700 mb-1">💡 支援理由</p>
//                 <p className="text-gray-600 text-sm leading-relaxed">
//                   {getReason()}
//                 </p>
//               </div>
              
//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2">
//                   <span className="font-medium text-gray-700">💰 希望金額:</span>
//                   <span className="text-lg font-semibold text-green-600">
//                     ¥{getAmount().toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             {/* 投票数と投票ボタン */}
//             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-2xl">💖</span>
//                   <div className="text-center">
//                     <div className="text-xl font-bold text-pink-600">
//                       {applicant.voteCount || 0}
//                     </div>
//                     <div className="text-xs text-gray-500">票</div>
//                   </div>
//                 </div>
                
//                 {rank <= 3 && (
//                   <div className="text-xs text-gray-500">
//                     {rank === 1 ? '🎉 1位!' : rank === 2 ? '✨ 2位' : '🌟 3位'}
//                   </div>
//                 )}
//               </div>
              
//               <div className="text-right">
//                 {error && (
//                   <p className="text-red-500 text-xs mb-2">{error}</p>
//                 )}
                
//                 <button
//                   onClick={handleVote}
//                   disabled={voting || hasVoted}
//                   className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
//                     hasVoted
//                       ? 'bg-pink-100 text-pink-600 cursor-not-allowed border border-pink-200'
//                       : voting
//                       ? 'bg-blue-300 text-white cursor-not-allowed'
//                       : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 shadow-md'
//                   }`}
//                 >
//                   {hasVoted 
//                     ? '✅ 応援済み' 
//                     : voting 
//                     ? '投票中...' 
//                     : '💖 応援する'
//                   }
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }