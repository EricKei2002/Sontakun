# Sontakun (ソンタくん)

Sontakun（ソンタくん）は、「空気を読む」AI日程調整ツールです。候補者の自然文から希望や制約を抽出し、主催者のカレンダーと照らして最適な面談枠を提案・確定まで自動化します。

## 主な機能

- 候補者の自然文入力から希望日時を抽出（Gemini）
- ランチタイム・移動時間などの暗黙制約を考慮したスコアリング
- Google カレンダー連携（空き時間の取得・予定の作成）
- Google Meet / Zoom の会議URL発行
- 候補者への確認依頼・確定通知メール送信（Resend）
- 共有リンクによる候補者入力フロー

## 技術スタック

- Next.js (App Router)
- Supabase (Auth / DB / RLS)
- Google Calendar / Meet API
- Zoom Server-to-Server OAuth
- Resend (メール送信)
- Gemini (自然文解析)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase のセットアップ

1. Supabase ダッシュボードで新規プロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Auth > Providers で Google を有効化

### 3. 環境変数

`.env.local.example` をコピーして `.env.local` を作成します。

```bash
cp .env.local.example .env.local
```

`.env.local` に以下を設定してください。

#### 必須

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

#### Google カレンダー / Meet 連携

- `SUPABASE_AUTH_GOOGLE_ID`
- `SUPABASE_AUTH_GOOGLE_SECRET`

#### 共有リンクのベースURL

- `NEXT_PUBLIC_BASE_URL`

#### メール送信（Resend）

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (省略時は `noreply@sontakun.app`)

#### Zoom 連携（任意）

- `ZOOM_ACCOUNT_ID`
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`

### 4. 起動

```bash
npm run dev
```

`http://localhost:3000` にアクセスしてください。

## 使い方（基本フロー）

1. `/interviews/new` から面談を作成
2. 生成された候補者用リンクを共有
3. 候補者が自然文で都合を入力
4. `/interviews/[id]/suggestions` で候補日時を確認
5. 候補者が確定 → 会議URL作成 & メール通知

## 動作確認

### スコアリングロジックの単体確認

```bash
npx tsx scripts/verify-scoring.ts
```

## 主要ファイル

- `src/lib/gemini.ts`: 自然文解析（Gemini）
- `src/lib/sontaku-engine.ts`: スコアリングロジック
- `src/lib/google-calendar.ts`: Google Calendar API
- `src/lib/zoom.ts`: Zoom API
- `src/lib/email.ts`: Resend メール送信
- `src/app/i/[token]/page.tsx`: 候補者入力画面

## 注意

- Google カレンダー連携は Supabase Auth の Google Provider を前提にしています。
- `SUPABASE_SERVICE_ROLE_KEY` はサーバー側のみで使用してください。
