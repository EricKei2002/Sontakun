-- Interviews table
create table interviews (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  recruiter_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'active' -- アクティブ, 完了, キャンセル
);

-- 面談トークン（候補者アクセス用）
create table interview_tokens (
  token uuid default gen_random_uuid() primary key,
  interview_id uuid references interviews(id) on delete cascade,
  candidate_name text,
  is_used boolean default false,
  expires_at timestamp with time zone not null default (now() + interval '7 days')
);

-- 可用性データ（条件と結果）
create table availabilities (
  id uuid default gen_random_uuid() primary key,
  interview_id uuid references interviews(id) on delete cascade,
  candidate_name text, -- トークンが共有された場合やフォールバックとして誰が入力したかを追跡
  raw_text text, -- 候補者の自然言語入力
  extracted_json jsonb, -- Geminiが抽出した制約条件
  final_selected_slot timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLSポリシー（MVP用の基本設定）
alter table interviews enable row level security;
alter table interview_tokens enable row level security;
alter table availabilities enable row level security;

-- MVPでは、トークン用には読み取り公開、または関数を使用します。
-- トークン用のシンプルなポリシー：
create policy "Allow reading tokens" on interview_tokens for select using (true);
create policy "Allow reading interviews by token" on interviews for select using (true); 
-- 本番アプリではトークンと結合する必要がありますが、MVPではシンプルに保ちます。

-- データの作成（INSERT）を許可するポリシー
create policy "Allow public insert interviews" on interviews for insert with check (true);
create policy "Allow public insert tokens" on interview_tokens for insert with check (true);
create policy "Allow public insert availabilities" on availabilities for insert with check (true);

-- データの読み取り（SELECT）を許可するポリシー
create policy "Allow public read availabilities" on availabilities for select using (true);
