/**
 * 使用量アラート通知 API（Vercel Cron Job）
 *
 * Firestoreの _usage/{date} ドキュメントを読んで、
 * しきい値を超えていたらSlack Webhookに通知する。
 *
 * Cron: 1時間ごとに実行（vercel.jsonで設定）
 */

// Firebase Admin SDKを使ってFirestoreにアクセス
// Note: 初回デプロイ時にFIREBASE_SERVICE_ACCOUNT環境変数をVercelに設定する必要がある

export default async function handler(req, res) {
  // Cronジョブ認証（Vercel Cronは自動でヘッダーを付与）
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // ローカル開発時やテスト時はスキップ
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  try {
    // Firebase Admin SDKで_usageドキュメントを読む
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
    if (!projectId) {
      return res.status(200).json({ message: 'Firebase未設定 - スキップ' })
    }

    const today = new Date().toISOString().split('T')[0]
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/_usage/${today}`

    const firestoreRes = await fetch(firestoreUrl)

    if (!firestoreRes.ok) {
      // ドキュメントが存在しない（使用量ゼロ）
      return res.status(200).json({ message: '使用量データなし', date: today })
    }

    const firestoreData = await firestoreRes.json()
    const fields = firestoreData.fields || {}

    const reads = parseInt(fields.reads?.integerValue || '0', 10)
    const writes = parseInt(fields.writes?.integerValue || '0', 10)
    const alertsSent = (fields.alertsSent?.arrayValue?.values || []).map(
      (v) => parseInt(v.integerValue || '0', 10)
    )

    const DAILY_READ_LIMIT = 50000
    const DAILY_WRITE_LIMIT = 20000

    const readPercent = (reads / DAILY_READ_LIMIT) * 100
    const writePercent = (writes / DAILY_WRITE_LIMIT) * 100
    const maxPercent = Math.max(readPercent, writePercent)

    // しきい値チェック
    const thresholds = [50, 80, 90, 95]
    const newAlerts = []

    for (const threshold of thresholds) {
      if (maxPercent >= threshold && !alertsSent.includes(threshold)) {
        newAlerts.push(threshold)
      }
    }

    if (newAlerts.length === 0) {
      return res.status(200).json({
        message: 'アラートなし',
        date: today,
        reads,
        writes,
        readPercent: readPercent.toFixed(1),
        writePercent: writePercent.toFixed(1),
      })
    }

    // Slack通知
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    if (slackWebhookUrl) {
      for (const threshold of newAlerts) {
        const emoji = threshold >= 95 ? ':rotating_light:' :
                      threshold >= 90 ? ':warning:' :
                      threshold >= 80 ? ':orange_circle:' : ':information_source:'

        const message = {
          text: `${emoji} *カイタス Firebase使用量アラート*\n` +
                `使用量が *${threshold}%* に到達しました\n` +
                `- 読み取り: ${reads.toLocaleString()} / 50,000 (${readPercent.toFixed(1)}%)\n` +
                `- 書き込み: ${writes.toLocaleString()} / 20,000 (${writePercent.toFixed(1)}%)\n` +
                `- 日付: ${today}` +
                (threshold >= 95 ? '\n\n*節約モードが自動発動しました*' : ''),
        }

        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        })
      }
    }

    // メール通知（SendGrid等のサービスを使う場合はここに追加）
    const alertEmail = process.env.ALERT_EMAIL
    if (alertEmail) {
      console.log(`[UsageAlert] メール通知先: ${alertEmail}, アラート: ${newAlerts.join(', ')}%`)
      // TODO: SendGrid等のメール送信サービスを使って通知
    }

    return res.status(200).json({
      message: `アラート送信: ${newAlerts.join(', ')}%`,
      date: today,
      reads,
      writes,
      readPercent: readPercent.toFixed(1),
      writePercent: writePercent.toFixed(1),
      alertsSent: newAlerts,
    })
  } catch (error) {
    console.error('[UsageAlert] エラー:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
