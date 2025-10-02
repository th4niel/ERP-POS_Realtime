-- Inventory Items
create table public.inventory_items (
  id serial primary key,
  name text not null,
  category text not null,
  unit text not null,
  current_stock numeric default 0,
  minimum_stock numeric default 0,
  unit_price numeric default 0,
  supplier_id integer references suppliers on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Inventory Transactions
create table public.inventory_transactions (
  id serial primary key,
  item_id integer references inventory_items on delete cascade,
  transaction_type text not null,
  quantity numeric not null,
  reference_type text, 
  reference_id integer,
  notes text,
  created_by uuid references profiles on delete set null,
  created_at timestamptz default now()
);

-- Menu-Inventory Mapping
create table public.menu_ingredients (
  id serial primary key,
  menu_id integer references menus on delete cascade,
  item_id integer references inventory_items on delete cascade,
  quantity_needed numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(menu_id, item_id)
);

alter table public.inventory_items enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.menu_ingredients enable row level security;