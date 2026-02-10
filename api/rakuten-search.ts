import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    const { jan } = req.query

    if (!jan || typeof jan !== 'string') {
        return res.status(400).json({ error: 'JANコードが必要です' })
    }

    // 環境変数からAPIキーを取得
    const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID
    const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID

    if (!RAKUTEN_APP_ID) {
        return res.status(500).json({ error: 'RAKUTEN_APP_IDが設定されていません' })
    }

    try {
        // 最新のAPIバージョンを使用
        const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?applicationId=${RAKUTEN_APP_ID}&keyword=${jan}&hits=3&formatVersion=2`

        console.log('Rakuten API URL:', url)

        const response = await fetch(url)
        const data = await response.json()

        console.log('Rakuten API Response:', JSON.stringify(data).slice(0, 500))

        if (data.Items && data.Items.length > 0) {
            const item = data.Items[0]

            // アフィリエイトリンク生成
            let rakutenUrl = item.itemUrl
            if (RAKUTEN_AFFILIATE_ID) {
                rakutenUrl = `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${encodeURIComponent(item.itemUrl)}`
            }

            return res.status(200).json({
                name: item.itemName,
                imageUrl: item.mediumImageUrls?.[0] || '',
                rakutenUrl: rakutenUrl,
                price: item.itemPrice,
                found: true
            })
        }

        // 商品が見つからない場合
        return res.status(404).json({
            error: '商品が見つかりませんでした',
            found: false,
            searchedJan: jan
        })
    } catch (error) {
        console.error('Rakuten API Error:', error)
        return res.status(500).json({
            error: 'API呼び出しエラー',
            details: String(error)
        })
    }
}