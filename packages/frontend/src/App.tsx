

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex h-screen">
                {/* サイドバー */}
                <div className="w-64 bg-white shadow-sm border-r border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h1 className="text-lg font-semibold text-gray-900">Kiro Lens</h1>
                        <p className="text-sm text-gray-500">ファイル管理ダッシュボード</p>
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-gray-600">プロジェクト初期セットアップ完了</p>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="flex-1 flex flex-col">
                    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-900">ダッシュボード</h2>
                    </header>

                    <main className="flex-1 p-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                🎉 プロジェクト初期セットアップが完了しました
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>✅ モノレポ構成の作成</p>
                                <p>✅ ワークスペース設定</p>
                                <p>✅ TypeScript設定</p>
                                <p>✅ フロントエンド・バックエンド・共通パッケージの作成</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default App;