-- SpendSmart AI — Budgets & Recurring Expenses Migration
-- Run this in your Supabase SQL Editor to apply

-- 1. ADD BUDGET TO CATEGORIES
alter table public.categories add column if not exists monthly_budget numeric check (monthly_budget >= 0);

-- 2. CREATE RECURRING EXPENSES TABLE
create table if not exists public.recurring_expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  category_id uuid not null references public.categories(id),
  merchant text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.recurring_expenses enable row level security;

create policy "Users can view own recurring expenses"
  on public.recurring_expenses for select using (auth.uid() = user_id);

create policy "Users can insert own recurring expenses"
  on public.recurring_expenses for insert with check (auth.uid() = user_id);

create policy "Users can update own recurring expenses"
  on public.recurring_expenses for update using (auth.uid() = user_id);

create policy "Users can delete own recurring expenses"
  on public.recurring_expenses for delete using (auth.uid() = user_id);

-- Index for auto-processing checks on app start
create index if not exists idx_recurring_expenses_due
  on public.recurring_expenses(user_id, next_due_date, active);
