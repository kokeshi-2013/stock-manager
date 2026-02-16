/**
 * 商品名やカテゴリから適切な絵文字アイコンを返す
 */
export const getSmartIcon = (name: string, category?: string): string => {
  const nameLower = name.toLowerCase()

  // 商品名から判定（優先）
  if (nameLower.includes('シャンプー') || nameLower.includes('リンス') || nameLower.includes('コンディショナー')) return '🧴'
  if (nameLower.includes('ボディソープ') || nameLower.includes('石鹸') || nameLower.includes('ボディーソープ')) return '🧼'
  if (nameLower.includes('洗剤') || nameLower.includes('洗濯')) return '🧽'
  if (nameLower.includes('トイレ') || nameLower.includes('便器')) return '🚽'
  if (nameLower.includes('ラップ') || nameLower.includes('フィルム')) return '📦'
  if (nameLower.includes('ティッシュ') || nameLower.includes('ペーパー')) return '🧻'
  if (nameLower.includes('歯磨き') || nameLower.includes('歯ブラシ')) return '🪥'
  if (nameLower.includes('タオル')) return '🧺'
  if (nameLower.includes('スポンジ')) return '🧽'
  if (nameLower.includes('ゴミ袋')) return '🗑️'
  if (nameLower.includes('柔軟剤')) return '🧴'
  if (nameLower.includes('漂白剤')) return '🧪'
  if (nameLower.includes('洗顔') || nameLower.includes('クレンジング')) return '🧴'
  if (nameLower.includes('化粧水') || nameLower.includes('乳液')) return '💧'

  // キッチン消耗品
  if (nameLower.includes('アルミホイル')) return '📋'
  if (nameLower.includes('クッキングシート') || nameLower.includes('オーブンシート')) return '📄'
  if (nameLower.includes('排水口') || nameLower.includes('ネット')) return '🕸️'
  if (nameLower.includes('ふきん') || nameLower.includes('布巾')) return '🧺'
  if (nameLower.includes('保存容器') || nameLower.includes('タッパー')) return '📦'
  if (nameLower.includes('割り箸') || nameLower.includes('割箸')) return '🥢'
  if (nameLower.includes('紙コップ') || nameLower.includes('紙皿')) return '🥤'

  // 洗面所
  if (nameLower.includes('ハンドソープ')) return '🧼'
  if (nameLower.includes('綿棒')) return '🦴'
  if (nameLower.includes('コットン')) return '☁️'
  if (nameLower.includes('化粧品') || nameLower.includes('メイク')) return '💄'
  if (nameLower.includes('整髪料') || nameLower.includes('ワックス') || nameLower.includes('ジェル')) return '💇'
  if (nameLower.includes('ドライヤー')) return '💨'
  if (nameLower.includes('くし') || nameLower.includes('ブラシ')) return '💇'

  // お風呂
  if (nameLower.includes('入浴剤')) return '🛀'
  if (nameLower.includes('カビ') || nameLower.includes('カビキラー')) return '🧪'
  if (nameLower.includes('バスマット')) return '🧺'

  // トイレ
  if (nameLower.includes('トイレクリーナー')) return '🧹'
  if (nameLower.includes('芳香剤') || nameLower.includes('消臭')) return '🌸'
  if (nameLower.includes('便座シート')) return '🚽'
  if (nameLower.includes('ブラシ')) return '🧹'

  // リビング
  if (nameLower.includes('電池') || nameLower.includes('バッテリー')) return '🔋'
  if (nameLower.includes('リモコン')) return '📺'
  if (nameLower.includes('クイックル') || nameLower.includes('フローリング')) return '🧹'
  if (nameLower.includes('ファブリーズ') || nameLower.includes('消臭スプレー')) return '💨'
  if (nameLower.includes('ウェット') || nameLower.includes('ウエット')) return '🧻'
  if (nameLower.includes('掃除')) return '🧹'

  // 寝室
  if (nameLower.includes('シーツ') || nameLower.includes('布団カバー')) return '🛏️'
  if (nameLower.includes('枕カバー')) return '🛏️'
  if (nameLower.includes('防虫剤')) return '🦟'

  // 廊下
  if (nameLower.includes('掃除機') || nameLower.includes('クリーナー')) return '🧹'

  // 玄関
  if (nameLower.includes('靴') || nameLower.includes('シューズ')) return '👟'
  if (nameLower.includes('玄関マット')) return '🧺'

  // 庭
  if (nameLower.includes('肥料')) return '🌱'
  if (nameLower.includes('土')) return '🌍'
  if (nameLower.includes('殺虫剤') || nameLower.includes('虫除け')) return '🦟'
  if (nameLower.includes('ホース')) return '💧'

  // 車
  if (nameLower.includes('ガソリン') || nameLower.includes('燃料')) return '⛽'
  if (nameLower.includes('洗車')) return '🚿'
  if (nameLower.includes('タイヤ')) return '🛞'

  // 食品系
  if (nameLower.includes('米') || nameLower.includes('ごはん')) return '🍚'
  if (nameLower.includes('パン')) return '🍞'
  if (nameLower.includes('牛乳') || nameLower.includes('ミルク')) return '🥛'
  if (nameLower.includes('卵')) return '🥚'
  if (nameLower.includes('水') || nameLower.includes('ミネラルウォーター')) return '💧'
  if (nameLower.includes('お茶') || nameLower.includes('緑茶')) return '🍵'
  if (nameLower.includes('コーヒー')) return '☕'
  if (nameLower.includes('ジュース')) return '🧃'
  if (nameLower.includes('ビール') || nameLower.includes('酒')) return '🍺'
  if (nameLower.includes('調味料') || nameLower.includes('醤油') || nameLower.includes('みりん')) return '🧂'
  if (nameLower.includes('砂糖')) return '🧂'
  if (nameLower.includes('塩')) return '🧂'
  if (nameLower.includes('油')) return '🛢️'
  if (nameLower.includes('麺') || nameLower.includes('パスタ') || nameLower.includes('うどん') || nameLower.includes('ラーメン') || nameLower.includes('そば') || nameLower.includes('そうめん')) return '🍜'
  if (nameLower.includes('缶詰')) return '🥫'
  if (nameLower.includes('レトルト') || nameLower.includes('カレー')) return '🍛'
  if (nameLower.includes('お菓子') || nameLower.includes('スナック')) return '🍪'
  if (nameLower.includes('チョコ')) return '🍫'

  // カテゴリから判定（フォールバック）
  if (category) {
    const icons: Record<string, string> = {
      'キッチン': '🍳',
      '洗面所': '🧴',
      'お風呂': '🛁',
      'トイレ': '🚽',
      'リビング': '🛋️',
      '寝室': '🛏️',
      '廊下': '🚪',
      '玄関': '👞',
      '庭': '🌳',
      '車': '🚗',
      'その他': '📦',
    }
    if (icons[category]) return icons[category]
  }

  return '🏠'
}
