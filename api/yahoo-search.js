export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    const { jan } = req.query

    if (!jan || typeof jan !== 'string') {
        return res.status(400).json({ error: 'JANコードが必要です' })
    }

    const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID

    if (!YAHOO_CLIENT_ID) {
        return res.status(500).json({ error: 'YAHOO_CLIENT_IDが設定されていません' })
    }

    try {
        const url = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${YAHOO_CLIENT_ID}&jan_code=${jan}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.hits && data.hits.length > 0) {
            const item = data.hits[0]

            return res.status(200).json({
                name: item.name || '',
                imageUrl: item.image?.medium || '',
                yahooUrl: item.url || '',
                price: item.price || 0,
                found: true
            })
        }

        return res.status(404).json({
            error: '商品が見つかりませんでした',
            found: false,
            searchedJan: jan
        })
    } catch (error) {
        console.error('Yahoo Shopping API Error:', error)
        return res.status(500).json({
            error: 'API呼び出しエラー',
            details: String(error)
        })
    }
}
