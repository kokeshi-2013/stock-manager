import { Link } from 'react-router-dom';

export default function Guide() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link to="/" className="text-blue-600 hover:text-blue-700">
                        ← トップに戻る
                    </Link>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">使い方ガイド</h1>

                {/* 1. カイタスとは？ */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. カイタスとは？</h2>
                    <p className="text-gray-700 mb-4">
                        カイタスは、家庭の日用品在庫を簡単に管理できる無料Webアプリです。
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                        <li>ラップ、洗剤、シャンプーなどの消耗品を登録</li>
                        <li>在庫数をひと目で確認</li>
                        <li>減ったら購入リンクからすぐ注文</li>
                        <li>ログイン不要ですぐ使える</li>
                    </ul>
                </section>

                {/* 2. 基本の使い方 */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 基本の使い方</h2>

                    <div className="space-y-6">
                        {/* 商品を登録する */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">📦 商品を登録する</h3>
                            <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                                <li>「+ 新しく登録」ボタンをクリック</li>
                                <li>商品名を入力（例：サランラップ）</li>
                                <li>現在の在庫数を入力</li>
                                <li>購入リンク（Amazon等のURL）を貼り付け</li>
                                <li>カテゴリを選択（キッチン、バス、リビング等）</li>
                                <li>「登録」ボタンで完了！</li>
                            </ol>
                        </div>

                        {/* 在庫数を増減する */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">🔢 在庫数を増減する</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>商品カードの「-」ボタンで減らす</li>
                                <li>商品カードの「+」ボタンで増やす</li>
                                <li>在庫が0になると「在庫なし」と表示されます</li>
                            </ul>
                        </div>

                        {/* 商品を購入する */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">🛒 商品を購入する</h3>
                            <p className="text-gray-700 ml-4">
                                「Amazonで買う」ボタンをクリックすると、登録した購入リンクに移動します。
                                そのまま購入手続きができます。
                            </p>
                        </div>

                        {/* 商品を編集・削除する */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">✏️ 商品を編集・削除する</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>商品カードの「編集」ボタンで内容を変更</li>
                                <li>商品カードの「削除」ボタンで商品を削除</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. 便利な機能 */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 便利な機能</h2>

                    <div className="space-y-6">
                        {/* カテゴリで整理 */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">🏷️ カテゴリで整理</h3>
                            <p className="text-gray-700 ml-4">
                                画面上部のタブで「キッチン」「バス」「リビング」などカテゴリ別に表示を切り替えられます。
                                商品が増えても見やすく管理できます。
                            </p>
                        </div>

                        {/* 検索機能 */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">🔍 検索機能</h3>
                            <p className="text-gray-700 ml-4">
                                検索ボックスに商品名を入力すると、該当する商品だけが表示されます。
                                登録商品が多くなったときに便利です。
                            </p>
                        </div>

                        {/* 並べ替え */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">📊 並べ替え</h3>
                            <p className="text-gray-700 ml-4">
                                「登録順」と「数が少ない順」で表示順を切り替えられます。
                                在庫が少ない商品を優先的に確認したいときは「数が少ない順」が便利です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. よくある質問 */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. よくある質問（FAQ）</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Q. データはどこに保存されますか？</h3>
                            <p className="text-gray-700 ml-4">
                                A. 現在はブラウザ内（localStorage）に保存されます。
                                同じブラウザであればデータは残りますが、ブラウザのデータを削除すると消えてしまいます。
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Q. スマホとPCでデータを共有できますか？</h3>
                            <p className="text-gray-700 ml-4">
                                A. 現在は各デバイスごとに保存されるため、共有できません。
                                将来的にログイン機能を追加し、クラウド同期に対応予定です。
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Q. 利用料金はかかりますか？</h3>
                            <p className="text-gray-700 ml-4">
                                A. 完全無料でご利用いただけます。
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Q. 購入リンクは必須ですか？</h3>
                            <p className="text-gray-700 ml-4">
                                A. いいえ、購入リンクは任意です。リンクを登録しない場合、「Amazonで買う」ボタンは表示されません。
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1">Q. Amazon以外のリンクも使えますか？</h3>
                            <p className="text-gray-700 ml-4">
                                A. はい、楽天市場やYahoo!ショッピングなど、どのサイトのリンクでも登録できます。
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. お問い合わせ */}
                <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. お問い合わせ</h2>
                    <p className="text-gray-700 mb-4">
                        ご質問、ご要望、不具合の報告などがございましたら、お気軽にお問い合わせください。
                    </p>
                    <a
                        href="https://forms.gle/YOUR_GOOGLE_FORM_ID"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        お問い合わせフォームを開く
                    </a>
                    <p className="text-sm text-gray-500 mt-2">
                        ※Googleフォームが開きます
                    </p>
                </section>
            </main>

            {/* フッター */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
                    <div className="space-x-4">
                        <Link to="/privacy" className="hover:text-blue-600">プライバシーポリシー</Link>
                        <Link to="/terms" className="hover:text-blue-600">利用規約</Link>
                        <Link to="/guide" className="hover:text-blue-600">使い方ガイド</Link>
                    </div>
                    <p className="mt-4">© 2025 カイタス</p>
                </div>
            </footer>
        </div>
    );
}