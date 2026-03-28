-- Run this directly in your Supabase SQL Editor to update your existing custom categories
-- with the new distinctive, highly-readable color palette. 
-- Since everything is custom, this will match names irrespective of exact casing.

UPDATE public.categories SET color = '#3b82f6' WHERE name ILIKE 'Education';
UPDATE public.categories SET color = '#a855f7' WHERE name ILIKE 'Entertainment';
UPDATE public.categories SET color = '#ec4899' WHERE name ILIKE 'Family';
UPDATE public.categories SET color = '#ef4444' WHERE name ILIKE 'Food & Dinings';
UPDATE public.categories SET color = '#22c55e' WHERE name ILIKE 'Groceries';
UPDATE public.categories SET color = '#14b8a6' WHERE name ILIKE 'Grooming';
UPDATE public.categories SET color = '#f43f5e' WHERE name ILIKE 'Healthcare';
UPDATE public.categories SET color = '#0ea5e9' WHERE name ILIKE 'Laundry';
UPDATE public.categories SET color = '#94a3b8' WHERE name ILIKE 'Miscellaneous';
UPDATE public.categories SET color = '#8b5cf6' WHERE name ILIKE 'Rent';
UPDATE public.categories SET color = '#f97316' WHERE name ILIKE 'Shopping';
UPDATE public.categories SET color = '#eab308' WHERE name ILIKE 'Transport';
