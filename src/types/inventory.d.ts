export type InventoryFormState = {
  status?: string;
  errors?: {
    name?: string[];
    category?: string[];
    unit?: string[];
    current_stock?: string[];
    minimum_stock?: string[];
    unit_price?: string[];
    supplier_id?: string[];
    _form?: string[];
  };
};

export type SupplierFormState = {
  status?: string;
  errors?: {
    name?: string[];
    contact?: string[];
    email?: string[];
    address?: string[];
    _form?: string[];
  };
};

export type MenuIngredientFormState = {
  status?: string;
  errors?: {
    menu_id?: string[];
    item_id?: string[];
    quantity_needed?: string[];
    _form?: string[];
  };
};