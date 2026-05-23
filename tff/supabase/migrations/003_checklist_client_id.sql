-- ─────────────────────────────────────────────────────────────────────────────
-- TFF — Phase 1.5 Step 4: Checklist client_id bridge
-- Migration: 003_checklist_client_id.sql
-- Depends on: 002_tff_user_data_schema.sql
-- Run manually via Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Problem: local custom checklist items use IDs in the format c_<timestamp>_<random>.
-- Supabase custom items have UUID primary keys.
-- Without a shared key, there is no safe way to match local items to cloud rows.
--
-- Solution: add client_id text to checklist_custom_items.
-- When the app creates a cloud item, it passes the local ID as client_id.
-- On sync, the app looks up remote rows by client_id to find local matches.
-- This avoids changing the local ID format and preserves existing localStorage data.
--
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.checklist_custom_items
  add column if not exists client_id text;

-- Sparse index — only rows where client_id is set benefit from this.
create index if not exists idx_checklist_custom_items_client_id
  on public.checklist_custom_items (client_id)
  where client_id is not null;
