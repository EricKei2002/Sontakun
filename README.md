# Sontakun (ソンタくん)

Sontakun（ソンタくん）は、「空気を読む」AI日程調整ツールです。

## 🚀 セットアップ手順

### 1. データベースのセットアップ (Supabase)

1. Supabaseダッシュボードにアクセスします。
2. 新しいプロジェクトを作成します。
3. SQL Editor に移動します。
4. `supabase/schema.sql` の内容を実行します。

### 2. 環境変数

1. サンプルの環境変数ファイルをコピーします：

   ```bash
   cp .env.local.example .env.local
   ```

2. キーを入力します：

   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Settings > API から取得。
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Settings > API から取得。
   - `GEMINI_API_KEY`: Google AI Studio から取得。

### 3. アプリの起動

```bash
npm run dev
```

<http://localhost:3000> にアクセスしてください。

## 🧪 動作確認

### スコアリングロジックの確認

アプリ全体を起動せずに、スコアリングエンジン（ソンタくんの脳みそ）単体の動作を確認するスクリプトを実行できます：

```bash
npx tsx scripts/verify-scoring.ts
```

### エンドツーエンドのフロー確認

1. `/interviews/new` にアクセスします。
2. 面談を作成します（例：「エンジニア採用面談」）。
3. 生成された候補者用リンクをコピーします。
4. リンクを開きます（候補者になりきって操作）。
5. 以下のように入力します： "来週の火曜か水曜の午後なら空いてます。12時から13時はお昼休みなので避けてもらえると助かります。"
6. 送信します。
7. `/interviews/[id]/suggestions`（リンク発行画面にあります）にアクセスして、結果を確認します。

## 📁 主要ファイル

- `src/lib/gemini.ts`: AIによる抽出ロジック。
- `src/lib/sontaku-engine.ts`: スコアリングアルゴリズム（ランチタイム判定など）。
- `src/app/i/[token]/page.tsx`: 候補者用画面。