-- RPC Function deduct stock
create or replace function deduct_inventory_stock(
  p_item_id integer,
  p_quantity numeric
)
returns void
language plpgsql
security definer
as $$
begin
  update public.inventory_items
  set 
    current_stock = current_stock - p_quantity,
    updated_at = now()
  where id = p_item_id;
  
  if not found then
    raise exception 'Inventory item not found';
  end if;
end;
$$;

-- RPC Function add stock
create or replace function add_inventory_stock(
  p_item_id integer,
  p_quantity numeric
)
returns void
language plpgsql
security definer
as $$
begin
  update public.inventory_items
  set 
    current_stock = current_stock + p_quantity,
    updated_at = now()
  where id = p_item_id;
  
  if not found then
    raise exception 'Inventory item not found';
  end if;
end;
$$;