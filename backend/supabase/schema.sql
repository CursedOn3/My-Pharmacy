-- Basic schema for My Pharmacy

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  image_url text,
  category_slug text,
  stock int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_email text not null,
  customer_name text not null,
  items jsonb not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_email text not null,
  customer_name text not null,
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size int not null,
  notes text,
  reviewer_note text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.marketing_discounts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  percent int not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  placement text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.prescriptions enable row level security;
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.wishlist enable row level security;
alter table public.marketing_discounts enable row level security;
alter table public.marketing_banners enable row level security;

-- Products are public read-only
create policy "Products are readable" on public.products
for select using (true);

-- Cart items are scoped to the user
create policy "Cart items are user scoped" on public.cart_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders are scoped to the user
create policy "Orders are user scoped" on public.orders
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Prescriptions are scoped to the user
create policy "Prescriptions are user scoped" on public.prescriptions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profiles are readable by the owner
create policy "Profiles are user scoped" on public.profiles
for select using (auth.uid() = id);

create policy "Favorites are user scoped" on public.favorites
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Wishlist is user scoped" on public.wishlist
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Marketing tables are admin-managed via service role
