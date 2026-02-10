import type { VercelRequest, VercelResponse } from '@vercel/node'

const RAKUTEN_APP_ID = 'ca7a4d0e-8b41-488d-a937-08907e60303c'

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    const { jan } = req.query

    if (!jan || typeof jan !== 'string') {
        return res.status(400).json({ error: 'JANコードが必要です' })
    }

    try {
        const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${RAKUTEN_APP_ID}&keyword=${jan}&hits=1`

        const response = await fetch(url)
        const data = await response.json()

        if (data.Items && data.Items.length > 0) {
            const item = data.Items[0].Item
            return res.status(200).json({
                name: item.itemName,
                imageUrl: item.mediumImageUrls?.[0]?.imageUrl || '',
                rakutenUrl: item.itemUrl,
                price: item.itemPrice,
            })
        }

        return res.status(404).json({ error: '商品が見つかりませんでした' })
    } catch (error) {
        console.error('Rakuten API Error:', error)
        return res.status(500).json({ error: 'API呼び出しエラー' })
    }
}