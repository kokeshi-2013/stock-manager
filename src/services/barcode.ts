export interface BarcodeSearchResult {
  name: string
  imageUrl: string
  yahooUrl: string
  rakutenUrl: string
  found: boolean
}

/**
 * バーコード（JANコード）からYahoo・楽天APIで商品を検索する
 */
export async function searchByBarcode(code: string): Promise<BarcodeSearchResult> {
  const [yahooResult, rakutenResult] = await Promise.allSettled([
    fetch(`/api/yahoo-search?jan=${code}`).then((r) => r.json()),
    fetch(`/api/rakuten-search?jan=${code}`).then((r) => r.json()),
  ])

  let name = ''
  let imageUrl = ''
  let yahooUrl = ''
  let rakutenUrl = ''

  if (yahooResult.status === 'fulfilled' && yahooResult.value.found) {
    name = yahooResult.value.name
    imageUrl = yahooResult.value.imageUrl
    yahooUrl = yahooResult.value.yahooUrl || ''
  }

  if (rakutenResult.status === 'fulfilled' && rakutenResult.value.found) {
    if (!name) name = rakutenResult.value.name
    if (!imageUrl) imageUrl = rakutenResult.value.imageUrl
    rakutenUrl = rakutenResult.value.rakutenUrl || ''
  }

  return { name, imageUrl, yahooUrl, rakutenUrl, found: !!name }
}
