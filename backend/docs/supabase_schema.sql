-- Supabase schema for Early Crop Failure Warning System
-- Run this in Supabase SQL editor

-- Extensions (usually pre-enabled in Supabase); keep for completeness
create extension if not exists pgcrypto;

-- Observational data ingested by admin (historical + new inputs)
create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  observed_at timestamptz not null,
  region text not null,
  rainfall_mm numeric,
  temperature_c numeric,
  humidity_pct numeric,
  soil_moisture_pct numeric,
  pest_index numeric,
  -- label/outcome fields (optional for historical data)
  yield_ton_ha numeric,
  harvest_failed boolean,
  created_at timestamptz not null default now()
);

-- Predictions produced by the model/pipeline and shown publicly
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  prediction_for_date date not null,
  risk_level text not null check (risk_level in ('low','medium','high')),
  failure_probability numeric check (failure_probability >= 0 and failure_probability <= 1),
  similarity_pct numeric, -- e.g., 0..100, pattern-match similarity with past failures
  message text,           -- e.g., "Perhatian, wilayah X ..."
  created_at timestamptz not null default now()
);

-- Basic indexes
create index if not exists idx_observations_region_time on public.observations(region, observed_at desc);
create index if not exists idx_predictions_region_time on public.predictions(region, created_at desc);

-- Enable RLS
alter table public.observations enable row level security;
alter table public.predictions enable row level security;

-- Policies
-- NOTE: The Supabase service role key bypasses RLS. We'll only open read access to predictions for anon.

-- Observations: no public access (no policies). Only service role can insert/select via backend.

-- Predictions: allow anonymous read (for public frontend)
create policy if not exists "Public read predictions" on public.predictions
  for select
  to anon
  using (true);

-- (Optional) You may later add policies for authenticated users if needed.
