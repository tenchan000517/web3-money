// 'use client';
// import { useState } from 'react';
// import NoticeList from '@/components/NoticeList';
// import CampaignTabs from '@/components/CampaignTabs';
// import Image from 'next/image';

// export default function MainPage() {
//     const [activeTab, setActiveTab] = useState<'notices' | 'voting'>('notices');

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* ヘッダー */}
//             <div className="bg-white shadow-sm border-b border-gray-200">
//                 <div className="container mx-auto px-4 py-4">
//                     <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center gap-3">
//                             <Image
//                                 src="/icons/web3money4.jpeg"
//                                 alt="WEB3 MONEY Logo"
//                                 width={50}
//                                 height={50}
//                                 className="object-contain rounded"
//                             />
//                             <div>
//                                 <h1 className="text-2xl font-bold text-gray-800">WEB3 MONEY</h1>
//                                 <p className="text-sm text-gray-500">レリモバ契約者専用サービス</p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                             <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
//                                 <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
//                                 オンライン
//                             </div>
//                         </div>
//                     </div>

//                     {/* タブナビゲーション */}
//                     <div className="flex border-b border-gray-200">
//                         <button
//                             onClick={() => setActiveTab('notices')}
//                             className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'notices'
//                                 ? 'border-blue-500 text-blue-600 bg-blue-50'
//                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                                 }`}
//                         >
//                             <div className="flex items-center gap-2">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
//                                 </svg>
//                                 お知らせ
//                             </div>
//                         </button>

//                         <button
//                             onClick={() => setActiveTab('voting')}
//                             className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative ${activeTab === 'voting'
//                                 ? 'border-pink-500 text-pink-600 bg-pink-50'
//                                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                                 }`}
//                         >
//                             <div className="flex items-center gap-2">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                 </svg>
//                                 支援投票
//                             </div>
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* メインコンテンツ */}
//             <div className="container mx-auto px-4 py-6">
//                 {/* タブ説明 */}
//                 <div className="mb-6">
//                     {activeTab === 'notices' && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="text-blue-600 text-xl">📢</div>
//                                 <div className="text-blue-800 text-sm">
//                                     <p className="font-medium mb-1">お知らせについて</p>
//                                     <p className="text-xs">重要な情報やキャンペーンの最新情報をお届けします。期間限定の情報もありますので、定期的にご確認ください。</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'voting' && (
//                         <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
//                             <div className="flex items-start gap-3">
//                                 <div className="text-pink-600 text-xl">💖</div>
//                                 <div className="text-pink-800 text-sm">
//                                     <p className="font-medium mb-1">支援金投票について</p>
//                                     <div className="text-xs space-y-1">
//                                         <p>申請者への支援金投票を行えます。</p>
//                                         <div className="flex items-center gap-1">
//                                             <span className="w-1 h-1 bg-pink-600 rounded-full"></span>
//                                             <span>投票時にフィナンシェID・メールアドレス・お名前の入力が必要です</span>
//                                         </div>
//                                         <div className="flex items-center gap-1">
//                                             <span className="w-1 h-1 bg-pink-600 rounded-full"></span>
//                                             <span>重複投票防止のため、同じ申請者への複数投票はできません</span>
//                                         </div>
//                                         <div className="flex items-center gap-1">
//                                             <span className="w-1 h-1 bg-pink-600 rounded-full"></span>
//                                             <span>投票内容は一度入力すると次回から自動入力されます</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* コンテンツエリア */}
//                 <div className="transition-all duration-300 ease-in-out">
//                     {activeTab === 'notices' && (
//                         <div className="animate-fadeIn">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
//                                     </svg>
//                                     最新のお知らせ
//                                 </h2>
//                                 <button
//                                     onClick={() => window.location.reload()}
//                                     className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
//                                 >
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                     </svg>
//                                     更新
//                                 </button>
//                             </div>
//                             <NoticeList />
//                         </div>
//                     )}

//                     {activeTab === 'voting' && (
//                         <div className="animate-fadeIn">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                     </svg>
//                                     支援投票
//                                 </h2>
//                                 <div className="flex items-center gap-2 text-sm">
//                                     <div className="flex items-center gap-1 text-gray-500">
//                                         <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                                         </svg>
//                                         <span>🔒 認証付き投票</span>
//                                     </div>
//                                 </div>
//                             </div>
//                             <CampaignTabs />
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* フッター */}
//             <footer className="bg-white border-t border-gray-200 mt-12">
//                 <div className="container mx-auto px-4 py-6">
//                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//                         <div className="text-sm text-gray-600">
//                             <p>© 2025 WEB3 MONEY - レリモバ契約者専用サービス</p>
//                         </div>
//                         <div className="flex items-center gap-4 text-sm text-gray-500">
//                             <span className="flex items-center gap-1">
//                                 <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                                 </svg>
//                                 安全な接続
//                             </span>
//                             <span>|</span>
//                             <span>契約者限定</span>
//                             <span>|</span>
//                             <span className="flex items-center gap-1">
//                                 <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                                 </svg>
//                                 認証保護
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// }

// // アニメーション用のCSS（globals.cssに追加）
// // .animate-fadeIn {
// //   animation: fadeIn 0.3s ease-in-out;
// // }
// //
// // @keyframes fadeIn {
// //   from { opacity: 0; transform: translateY(10px); }
// //   to { opacity: 1; transform: translateY(0); }
// // }