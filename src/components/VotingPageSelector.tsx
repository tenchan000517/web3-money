'use client';
import { useRouter } from 'next/navigation';

export default function VotingPageSelector() {
    const router = useRouter();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    投票ページを選択してください
                </h2>
                <p className="text-gray-600">
                    ご契約内容に応じた投票ページをお選びください
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* 基本投票ページカード */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-blue-600 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">基本投票</h3>
                        <p className="text-sm opacity-90">レリモバ契約者様向け</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-blue-600 text-lg">✓</span>
                                <div>
                                    <p className="font-medium text-gray-900">基本投票権</p>
                                    <p className="text-sm text-gray-600">1票あたり+1ポイント</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-600 text-lg">✓</span>
                                <div>
                                    <p className="font-medium text-gray-900">シンプルな投票</p>
                                    <p className="text-sm text-gray-600">必要最小限の機能</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/voting/basic')}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            基本投票ページへ →
                        </button>
                    </div>
                </div>

                {/* プレミアム投票ページカード */}
                <div className="bg-black rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-black">
                        <h3 className="text-xl font-bold mb-2">プレミアム投票</h3>
                        <p className="text-sm opacity-90">レリモバ契約+WEB3MONEY加入者様向け</p>
                    </div>
                    <div className="p-6 bg-gray-900">
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-yellow-400 text-lg">⭐</span>
                                <div>
                                    <p className="font-medium text-white">強化投票権</p>
                                    <p className="text-sm text-gray-400">1票あたり+5ポイント</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-yellow-400 text-lg">⭐</span>
                                <div>
                                    <p className="font-medium text-white">YouTube出演選択</p>
                                    <p className="text-sm text-gray-400">特別機能が利用可能</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/voting/premium')}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all"
                        >
                            プレミアム投票ページへ →
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                    <span className="font-medium">重要:</span> 各ページから1回ずつ投票が可能です。
                    投票の価値や仕組みについての詳細は非公開となっております。
                </p>
            </div>
        </div>
    );
}