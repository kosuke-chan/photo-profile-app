# photo-profile-app
自己紹介と写真ギャラリーのWebアプリ

## 機能
- 写真ギャラリー表示
- カテゴリ別フィルタリング
- 管理画面から写真アップロード（認証付き）
- Vercel Blob Storageを使用した画像管理

## セットアップ

### 1. 依存パッケージのインストール
```bash
npm install
```

### 2. Vercel Blob Storageの有効化
1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Storage」タブから「Blob」を選択
4. 「Create Database」をクリック
5. 自動的に `BLOB_READ_WRITE_TOKEN` が環境変数に追加されます

### 3. 環境変数の設定

#### ローカル開発用
`.env.local` ファイルを作成：
```bash
cp .env.local.example .env.local
```

`.env.local` を編集：
```
ADMIN_PASSWORD=your_secure_password_here
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

`BLOB_READ_WRITE_TOKEN` はVercelダッシュボードの「Settings」→「Environment Variables」から取得できます。

#### 本番環境用（Vercel）
Vercelダッシュボードで環境変数を設定：
1. プロジェクトの「Settings」→「Environment Variables」
2. `ADMIN_PASSWORD` を追加（任意のパスワード）
3. `BLOB_READ_WRITE_TOKEN` は自動的に設定されています

### 4. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアクセス

## 使い方

### 写真のアップロード
1. `/admin` にアクセス
2. 設定したパスワードでログイン
3. 写真を選択してアップロード

### カテゴリについて
- カンマ区切りで複数指定可能（例: `nature, monochrome`）
- デフォルトは `nature`

## デプロイ
GitにプッシュするとVercelが自動的にデプロイします。

```bash
git add .
git commit -m "Add photo upload feature"
git push
```

## 注意事項
- Vercel Blob Storageの無料枠は5GBです
- 無料枠を超えても自動的に課金されることはありません
- 容量を超えた場合は新しいアップロードがエラーになります
