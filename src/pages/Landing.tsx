import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, RefreshCw, Zap, ShieldCheck } from 'lucide-react'
import { Modal } from '../components/common/Modal'

function Landing() {
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <img src="/logohorizontal.svg" alt="カイタス" className="h-9" />
          <Link
            to="/app"
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-sm font-bold transition-colors"
          >
            アプリを開く
          </Link>
        </div>
      </header>

      <main>
        {/* ヒーローセクション */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-primary font-bold text-sm mb-3 tracking-wider">買い忘れ防止リマインドアプリ</p>
          <h1 className="text-4xl font-bold text-gray-800 mb-5 leading-tight">
            そろそろ買い足すもの、<br />教えてくれる。
          </h1>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            洗剤、ラップ、シャンプー…<br />
            いつも使うものの買い時を、<br />
            カイタスが自動で教えてくれます。
          </p>
          <Link
            to="/app"
            className="inline-block bg-primary hover:bg-primary-hover active:bg-primary-active text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-colors"
          >
            無料で使ってみる
          </Link>
          <p className="text-gray-400 text-sm mt-4">登録不要 ・ すぐに使えます</p>
        </section>

        {/* 特徴セクション */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">カイタスの仕組み</h2>
            <p className="text-center text-gray-500 mb-14">数える手間なし。自動で管理。</p>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">そろそろお知らせ</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    購入サイクルから「そろそろなくなるよ」を自動判定。買い物前にチェックするだけ。
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">自動学習</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    「買った！」を記録するたび、消費ペースを学習。使うほど精度が上がります。
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">かんたん登録</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    商品名を入力するか、バーコードをスキャンするだけ。面倒な数量管理は不要です。
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">データはあなたの端末に</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    サーバーにデータを送りません。すべて端末内で保存されるので安心です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-14">かんたん3ステップ</h2>
            <div className="space-y-6 max-w-md mx-auto">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-100 flex gap-4 items-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-gray-800">商品を登録</p>
                  <p className="text-sm text-gray-500">名前・消費ペースを設定するだけ</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-100 flex gap-4 items-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-gray-800">買ったらチェック</p>
                  <p className="text-sm text-gray-500">「買った！」ボタンをタップするだけ</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-brand-100 flex gap-4 items-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-gray-800">そろそろタブを確認</p>
                  <p className="text-sm text-gray-500">買い物前にチェックして買い忘れゼロ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">買い忘れ、もうしない。</h2>
            <p className="text-white/80 mb-8">登録不要・無料で今すぐ使えます</p>
            <Link
              to="/app"
              className="inline-block bg-white text-primary hover:bg-brand-50 px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-colors"
            >
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
            <button onClick={() => setShowTerms(true)} className="hover:underline">利用規約</button>
            <span>|</span>
            <button onClick={() => setShowPrivacy(true)} className="hover:underline">プライバシーポリシー</button>
          </div>
          <p className="mt-4">&copy; 2025 カイタス</p>
        </div>
      </footer>

      {/* 利用規約モーダル */}
      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} title="利用規約">
        <div className="text-sm text-gray-600 space-y-4">
          <p>この利用規約（以下「本規約」）は、カイタス（以下「本サービス」）の利用に関する条件を定めるものです。</p>
          <h4 className="font-bold text-gray-800">第1条（サービス内容）</h4>
          <p>本サービスは、日用品の買い忘れ防止を目的としたリマインドツールです。ユーザーが登録した商品の消費サイクルに基づき、買い足し時期の目安を提供します。</p>
          <h4 className="font-bold text-gray-800">第2条（データの取り扱い）</h4>
          <p>本サービスで入力されたデータは、すべてユーザーの端末（ブラウザのローカルストレージ）に保存されます。サーバーへのデータ送信は行いません。</p>
          <h4 className="font-bold text-gray-800">第3条（免責事項）</h4>
          <p>本サービスは現状有姿で提供されます。リマインドの正確性について保証するものではありません。端末やブラウザのデータ消去によるデータ損失について、当方は責任を負いません。</p>
          <h4 className="font-bold text-gray-800">第4条（禁止事項）</h4>
          <p>本サービスの不正利用、リバースエンジニアリング、その他法令に違反する行為を禁止します。</p>
          <h4 className="font-bold text-gray-800">第5条（規約の変更）</h4>
          <p>本規約は予告なく変更される場合があります。変更後の利用をもって同意とみなします。</p>
        </div>
      </Modal>

      {/* プライバシーポリシーモーダル */}
      <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="プライバシーポリシー">
        <div className="text-sm text-gray-600 space-y-4">
          <p>カイタス（以下「本サービス」）は、ユーザーのプライバシーを尊重し、以下の方針に基づき個人情報を取り扱います。</p>
          <h4 className="font-bold text-gray-800">1. 収集する情報</h4>
          <p>本サービスはユーザーの個人情報を収集しません。登録されたデータ（商品名、購入場所、消費サイクル等）はすべてユーザーの端末内に保存され、外部サーバーには送信されません。</p>
          <h4 className="font-bold text-gray-800">2. バーコード検索機能</h4>
          <p>バーコードスキャン時に、商品情報を取得するため外部API（Yahoo!ショッピングAPI、楽天商品検索API）にリクエストを送信します。この際、バーコード番号のみが送信され、個人情報は含まれません。</p>
          <h4 className="font-bold text-gray-800">3. Cookieについて</h4>
          <p>本サービスはCookieを使用しません。データの保存にはブラウザのローカルストレージを使用します。</p>
          <h4 className="font-bold text-gray-800">4. アクセス解析</h4>
          <p>サービス改善のため、匿名のアクセス解析ツールを使用する場合があります。個人を特定できる情報は収集しません。</p>
          <h4 className="font-bold text-gray-800">5. お問い合わせ</h4>
          <p>本ポリシーに関するお問い合わせは、アプリ内のフィードバック機能をご利用ください。</p>
        </div>
      </Modal>
    </div>
  )
}

export default Landing
