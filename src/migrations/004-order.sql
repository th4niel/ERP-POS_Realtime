create table public.orders (
  id serial not null,
  order_id text,
  customer_name text,
  status text,
  payment_token text,
  table_id integer references tables on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

alter table public.orders enable row level security;