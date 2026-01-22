import { Link } from 'react-router-dom'

function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* ヒーロー */}
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">カイタス</h1>
                    <Link to="/app" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">
                        アプリを開く
                    </Link>
                </div>
            </header>

            <main>
                {/* メインビジュアル */}
                <section className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        日用品の「買い忘れ」を<br />ゼロにしよう
                    </h2>
                    <p className="text-gray-600 mb-8">
                        ラップ、洗剤、シャンプー…<br />
                        家庭の消耗品をかんたん管理。<br />
                        残りが少なくなったらAmazonでサッと購入。
                    </p>
                    <Link to="/app" className="inline-block bg-gray-800 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg">
                        無料で使ってみる
                    </Link>
                    <p className="text-gray-400 text-sm mt-4">登録不要・すぐに使えます</p>
                </section>

                {/* 特徴 */}
                <section className="bg-white py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-12">3つの特徴</h3>
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-2">かんたん在庫管理</h4>
                                    <p className="text-gray-600">商品名と数量を登録するだけ。+/-ボタンで在庫を更新できます。</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-2">買い忘れ防止</h4>
                                    <p className="text-gray-600">在庫が0になると「在庫なし」と表示。買い忘れを防ぎます。</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl font-bold shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-lg mb-2">ワンタップで購入</h4>
                                    <p className="text-gray-600">購入URLを登録しておけば、ボタン一つでAmazonなどに移動できます。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 使い方 */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4">
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-12">かんたん3ステップ</h3>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <p className="text-gray-800"><span className="font-bold text-gray-800">Step 1:</span> 商品を登録（商品名・数量・購入URL）</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <p className="text-gray-800"><span className="font-bold text-gray-800">Step 2:</span> 使ったら数量を減らす（-ボタンをタップ）</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow">
                                <p className="text-gray-800"><span className="font-bold text-gray-800">Step 3:</span> 少なくなったら購入ボタンでお買い物</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gray-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">さっそく始めよう</h3>
                        <p className="text-gray-300 mb-8">登録不要・無料で今すぐ使えます</p>
                        <Link to="/app" className="inline-block bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-bold shadow-lg">
                            無料で使ってみる
                        </Link>
                    </div>
                </section>
            </main>

            {/* フッター */}
            <footer className="bg-white border-t py-8">
                <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <div className="space-x-4">
                        <Link to="/app" className="hover:underline">アプリを使う</Link>
                        <span>|</span>
                        <a href="#" className="hover:underline">利用規約</a>
                        <span>|</span>
                        <a href="#" className="hover:underline">プライバシーポリシー</a>
                    </div>
                    <p className="mt-4">© 2025 カイタス</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing