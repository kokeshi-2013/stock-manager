import { useState } from 'react'
import { Icon } from '../common/Icon'

type Platform = 'ios' | 'android'

export function VoiceShortcutGuide() {
  const [platform, setPlatform] = useState<Platform>(detectPlatform())
  const [isExpanded, setIsExpanded] = useState(false)

  const appUrl = 'https://www.kaitasu.com/app'

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
          <Icon name="mic" size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">音声で追加</p>
          <p className="text-xs text-gray-500">Siri / Google アシスタントで商品を追加</p>
        </div>
        <span
          className={`material-symbols-rounded text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          style={{ fontSize: 20 }}
        >
          expand_more
        </span>
      </button>

      {/* 展開コンテンツ */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* 使い方の説明 */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              音声アシスタントのショートカットを設定すると、
              <strong>「ヘイ Siri、カイタスに牛乳を追加」</strong>のように
              声で商品を追加できます。追加された商品は次にアプリを開いたときにまとめて登録できます。
            </p>
          </div>

          {/* プラットフォーム切り替え */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setPlatform('ios')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                platform === 'ios'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              iPhone / iPad
            </button>
            <button
              onClick={() => setPlatform('android')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                platform === 'android'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Android
            </button>
          </div>

          {/* 設定手順 */}
          {platform === 'ios' ? <IOSGuide appUrl={appUrl} /> : <AndroidGuide appUrl={appUrl} />}

          {/* ショートカット用URL */}
          <div className="mt-4 bg-violet-50 rounded-lg p-3">
            <p className="text-xs font-medium text-violet-800 mb-1">ショートカット用URL</p>
            <code className="text-xs text-violet-600 break-all">
              {appUrl}?add=商品名
            </code>
            <p className="text-xs text-gray-500 mt-1.5">
              複数追加: <code className="text-violet-600">{appUrl}?add=牛乳&add=卵</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function IOSGuide({ appUrl }: { appUrl: string }) {
  const steps = [
    {
      title: '「ショートカット」アプリを開く',
      detail: 'iPhoneに最初から入っているアプリです。見つからない場合はApp Storeからダウンロードできます。',
    },
    {
      title: '右上の「＋」で新規ショートカットを作成',
      detail: null,
    },
    {
      title: '「テキストを入力」アクションを追加',
      detail: '「アクションを追加」→ 検索で「テキスト入力」を探して追加します。',
    },
    {
      title: '「URLを開く」アクションを追加',
      detail: `URLに「${appUrl}?add=」と入力し、その後ろに先ほどの「テキスト入力」の変数を挿入します。`,
    },
    {
      title: 'ショートカット名を設定',
      detail: '「カイタスに追加」など、呼びやすい名前にします。\n\nこれで「ヘイ Siri、カイタスに〇〇を追加」と言うと、○○がアプリの待ちリストに追加されます。',
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-700">Siri ショートカットの設定手順</p>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-2.5">
          <div className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold">{i + 1}</span>
          </div>
          <div>
            <p className="text-sm text-gray-800">{step.title}</p>
            {step.detail && (
              <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{step.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function AndroidGuide({ appUrl }: { appUrl: string }) {
  const steps = [
    {
      title: 'Google アシスタントを開く',
      detail: '「OK Google」と話しかけるか、ホームボタン長押しで開きます。',
    },
    {
      title: '右上のプロフィールアイコン → 「ルーティン」',
      detail: null,
    },
    {
      title: '「＋ 新しいルーティン」をタップ',
      detail: null,
    },
    {
      title: '開始条件（トリガー）を設定',
      detail: '「音声コマンド」→「カイタスに追加」と入力します。',
    },
    {
      title: 'アクション → 「ウェブサイトを開く」',
      detail: `URLに「${appUrl}?add=商品名」と入力します。\n\n※ Googleアシスタントでは音声入力をURLパラメータに組み込むのが難しい場合があります。その場合は、よく買う商品ごとにルーティンを作成する方法がおすすめです。`,
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-700">Google アシスタント ルーティンの設定手順</p>
      {steps.map((step, i) => (
        <div key={i} className="flex gap-2.5">
          <div className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold">{i + 1}</span>
          </div>
          <div>
            <p className="text-sm text-gray-800">{step.title}</p>
            {step.detail && (
              <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{step.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * ユーザーのOSを判定
 */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'ios'
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes('android')) return 'android'
  return 'ios'
}
