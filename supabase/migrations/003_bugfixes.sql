-- SpendSmart AI — Bugfixes for Categories (Budgets & Deletions)
-- Run this in your Supabase SQL Editor

-- 1. Create a dedicated table for Category Budgets so users can set budgets on "System Default" categories
create table if not exists public.category_budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  updated_at timestamptz default now(),
  unique(user_id, category_id)
);

alter table public.category_budgets enable row level security;

create policy "Users can view own category budgets"
  on public.category_budgets for select using (auth.uid() = user_id);

create policy "Users can insert own category budgets"
  on public.category_budgets for insert with check (auth.uid() = user_id);

create policy "Users can update own category budgets"
  on public.category_budgets for update using (auth.uid() = user_id);

create policy "Users can delete own category budgets"
  on public.category_budgets for delete using (auth.uid() = user_id);

-- 2. Fix the foreign key constraint on expenses so that deleting a category also cascades and removes its expenses (or prevents orphan errors)
-- Note: PostgreSQL dynamically names the default constraint `expenses_category_id_fkey`
alter table public.expenses drop constraint if exists expenses_category_id_fkey;

alter table public.expenses 
  add constraint expenses_category_id_fkey 
  foreign key (category_id) references public.categories(id) on delete cascade;
