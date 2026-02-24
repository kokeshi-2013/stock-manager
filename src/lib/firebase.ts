import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

// 環境変数からFirebase設定を読み込む
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

/**
 * Firebase が設定されているかどうか
 * 環境変数が設定されていない場合は false（ローカルのみモード）
 */
export function isFirebaseConfigured(): boolean {
  return !!import.meta.env.VITE_FIREBASE_API_KEY
}

/**
 * Firebase を初期化する
 * 環境変数が設定されていない場合は何もしない（ローカルモードで動作）
 */
export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } | null {
  if (!isFirebaseConfigured()) {
    console.log('[Firebase] 設定なし - ローカルモードで動作')
    return null
  }

  if (app && db && auth) {
    return { app, db, auth }
  }

  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)

    // オフラインキャッシュを有効化（PWAとの相性◎）
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // 複数タブで開いている場合
        console.warn('[Firebase] 複数タブが開いています。オフラインキャッシュは1つのタブでのみ有効です。')
      } else if (err.code === 'unimplemented') {
        // ブラウザが対応していない
        console.warn('[Firebase] このブラウザはオフラインキャッシュに対応していません。')
      }
    })

    console.log('[Firebase] 初期化完了')
    return { app, db, auth }
  } catch (error) {
    console.error('[Firebase] 初期化エラー:', error)
    return null
  }
}

/**
 * Firestore インスタンスを取得
 */
export function getDB(): Firestore | null {
  return db
}

/**
 * Auth インスタンスを取得
 */
export function getFirebaseAuth(): Auth | null {
  return auth
}
