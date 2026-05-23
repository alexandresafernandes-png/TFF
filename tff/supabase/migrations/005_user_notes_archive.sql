-- ─────────────────────────────────────────────────────────────────────────────
-- TFF — Phase 1.5 Step 8: user_notes soft-delete
-- Migration: 005_user_notes_archive.sql
-- Depends on: 002_tff_user_data_schema.sql
-- Run manually via Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Adds is_archived to user_notes so notes can be soft-deleted without losing
-- history. Mirrors the same column on checklist_custom_items and
-- shopping_custom_items from migration 002.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.user_notes
  add column if not exists is_archived boolean not null default false;

-- Partial index: most queries filter out archived notes, so index only live rows.
create index if not exists idx_user_notes_user_not_archived
  on public.user_notes (user_id, area)
  where is_archived = false;
