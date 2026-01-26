-- Interviews table
create table interviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- 認証ユーザーID
  title text not null,
  recruiter_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'active' -- アクティブ, 完了, キャンセル
);

-- ... (tokens table remains same) ...

-- RLSポリシー（認証対応版）
alter table interviews enable row level security;
alter table interview_tokens enable row level security;
alter table availabilities enable row level security;

-- 1. Interviews: ログインユーザーのみ自分のデータを見れる・作れる
create policy "Users can view own interviews" on interviews for select using (auth.uid() = user_id);
create policy "Users can insert own interviews" on interviews for insert with check (auth.uid() = user_id);
create policy "Users can delete own interviews" on interviews for delete using (auth.uid() = user_id);
-- トークン経由での閲覧も許可（候補者用）
create policy "Allow reading interviews by token" on interviews for select using (
  exists (select 1 from interview_tokens where interview_tokens.interview_id = interviews.id)
);

-- 2. Tokens: 公開読み取り（候補者用）/ 作成はサーバーサイド(Service Role)で行うためポリシー不要だが、開発用に許可
create policy "Allow public read tokens" on interview_tokens for select using (true);
create policy "Users can insert tokens for own interviews" on interview_tokens for insert with check (
  exists (
    select 1 from interviews 
    where interviews.id = interview_id 
    and interviews.user_id = auth.uid()
  )
);

-- 3. Availabilities: 公開書き込み（候補者用）/ 読み取りはオーナーのみ
create policy "Allow public insert availabilities" on availabilities for insert with check (true);
create policy "Users can view availabilities for their interviews" on availabilities for select using (
  exists (
    select 1 from interviews 
    where interviews.id = availabilities.interview_id 
    and interviews.user_id = auth.uid()
  )
);
