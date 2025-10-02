create table public.suppliers (
  id serial primary key,
  name text not null,
  contact text,
  email text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.suppliers enable row level security;