-- Migration to add 'is_default' to savings_goals
-- This will create a permanent Monthly Saving Goal for every user.

alter table public.savings_goals
add column if not exists is_default boolean default false;

-- Create default savings goals for all users who don't have one
insert into public.savings_goals (user_id, name, target_amount, current_amount, is_default)
select id, 'Monthly Saving Goal', 500, 0, true
from public.profiles p
where not exists (
  select 1 from public.savings_goals sg
  where sg.user_id = p.id and sg.is_default = true
);

-- Update the handle_new_user trigger to automatically insert the default savings goal
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Create the profile
  insert into public.profiles (id, full_name, monthly_income)
  values (new.id, new.raw_user_meta_data->>'full_name', 5000);
  
  -- 2. Create the default Monthly Saving Goal
  insert into public.savings_goals (user_id, name, target_amount, current_amount, is_default)
  values (new.id, 'Monthly Saving Goal', 1000, 0, true);
  
  return new;
end;
$$ language plpgsql security definer;
