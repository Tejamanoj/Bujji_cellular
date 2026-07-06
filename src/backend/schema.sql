-- ============================================================
-- BUJJI CELLULAR — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  original_price numeric,
  description text,
  rating numeric default 0,
  images text[] default '{}',
  category text not null,
  brand text not null,
  colors text[] default '{}',
  storage text[] default '{}',
  specs jsonb default '{}',
  reviews jsonb default '[]',
  qa jsonb default '[]',
  stock integer default 0,
  featured boolean default false,
  flash_sale boolean default false,
  created_at timestamptz default now()
);

-- 2. CUSTOMERS
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  profile_image text,
  loyalty_points integer default 0,
  status text default 'active' check (status in ('active', 'banned')),
  orders_count integer default 0,
  total_spent numeric default 0,
  join_date timestamptz default now(),
  repair_requests_count integer default 0
);

-- 3. ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  date timestamptz default now(),
  status text default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric not null,
  discount numeric default 0,
  shipping numeric default 0,
  total numeric not null,
  shipping_address jsonb not null,
  payment_method text,
  tracking_timeline jsonb default '[]',
  invoice_url text
);

-- 4. ORDER ITEMS
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null,
  selected_color text,
  selected_storage text
);

-- 5. REPAIR REQUESTS
create table if not exists repair_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  device_name text not null,
  issue_desc text,
  image_urls text[] default '{}',
  pickup_address jsonb,
  preferred_date text,
  preferred_time text,
  status text default 'submitted' check (status in ('submitted', 'received', 'inspecting', 'repairing', 'completed')),
  cost numeric,
  created_at timestamptz default now()
);

-- 6. REPAIR MESSAGES
create table if not exists repair_messages (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid references repair_requests(id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  text text not null,
  timestamp timestamptz default now()
);

-- 7. ADMIN USERS (whitelist of admin emails)
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamptz default now()
);

-- ============================================================
-- Insert a default admin user (update email to yours)
-- ============================================================
insert into admin_users (email, role) values ('admin@bujji.com', 'superadmin')
on conflict (email) do nothing;

-- ============================================================
-- Row Level Security (RLS) — enable for production
-- ============================================================
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table repair_requests enable row level security;
alter table repair_messages enable row level security;
alter table admin_users enable row level security;

-- Allow public read access to products
create policy "Public can read products"
  on products for select using (true);

-- Allow authenticated users to read their own orders
create policy "Users read own orders"
  on orders for select using (auth.uid()::text = customer_id::text);
