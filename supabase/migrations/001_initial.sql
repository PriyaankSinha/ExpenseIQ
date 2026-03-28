-- SpendSmart AI — Database Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_income numeric default 0,
  currency text default 'USD',
  notification_time time default '20:00:00',
  last_notified_at timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CATEGORIES
-- ============================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon text not null default 'tag',
  color text not null default '#64748b',
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

-- Users can see system defaults (user_id IS NULL) + their own
create policy "Users can view categories"
  on public.categories for select
  using (user_id is null or user_id = auth.uid());

create policy "Users can insert own categories"
  on public.categories for insert
  with check (user_id = auth.uid());

create policy "Users can update own categories"
  on public.categories for update
  using (user_id = auth.uid());

create policy "Users can delete own categories"
  on public.categories for delete
  using (user_id = auth.uid());

-- System-default categories have been removed. All categories are now strictly custom-created.

-- ============================================
-- EXPENSES
-- ============================================
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  category_id uuid not null references public.categories(id),
  merchant text,
  date date not null default current_date,
  note text,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists idx_expenses_user_date
  on public.expenses(user_id, date desc);

-- ============================================
-- SAVINGS GOALS
-- ============================================
create table if not exists public.savings_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0,
  deadline date,
  created_at timestamptz default now()
);

alter table public.savings_goals enable row level security;

create policy "Users can view own goals"
  on public.savings_goals for select using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.savings_goals for insert with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.savings_goals for update using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.savings_goals for delete using (auth.uid() = user_id);
