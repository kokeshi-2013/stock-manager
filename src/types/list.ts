/**
 * 買い物リスト
 * ユーザーは複数のリストを持つことができる（例: 「マイリスト」「コストコ」「家族の買い物」）
 */
export interface ShoppingList {
  /** ユニークID（crypto.randomUUID()で生成） */
  id: string
  /** リスト名（例: 「マイリスト」「コストコ」） */
  name: string
  /** 作成者のUID */
  ownerUid: string
  /** アクセスできるUID一覧（ownerを含む） */
  memberUids: string[]
  /** 6桁の共有コード（共有時に生成、未共有ならnull） */
  shareCode: string | null
  /** 作成日時（ISO 8601） */
  createdAt: string
  /** 更新日時（ISO 8601） */
  updatedAt: string
}

/** リストの上限数 */
export const MAX_LIST_COUNT = 20

/** デフォルトリスト名 */
export const DEFAULT_LIST_NAME = 'マイリスト'
