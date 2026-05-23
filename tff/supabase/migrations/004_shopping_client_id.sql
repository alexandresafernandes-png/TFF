-- ─────────────────────────────────────────────────────────────────────────────
-- TFF — Phase 1.5 Step 5: Shopping client_id bridge
-- Migration: 004_shopping_client_id.sql
-- Depends on: 002_tff_user_data_schema.sql
-- Run manually via Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Mirrors the checklist_custom_items bridge from migration 003.
-- Local custom shopping items use IDs in the format:
--   custom_retainer_<timestamp>_<random>
--   custom_upgrade_<timestamp>_<random>
-- Supabase rows have UUID primary keys.
-- client_id stores the local ID so the sync layer can match remote rows to
-- local items without changing the localStorage shape or ID format.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.shopping_custom_items
  add column if not exists client_id text;

create index if not exists idx_shopping_custom_items_client_id
  on public.shopping_custom_items (client_id)
  where client_id is not null;
