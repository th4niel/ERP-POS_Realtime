export const HEADER_TABLE_INVENTORY = [
  'No',
  'Name',
  'Category',
  'Current Stock',
  'Min Stock',
  'Unit Price',
  'Status',
  'Action',
];

export const HEADER_TABLE_SUPPLIER = [
  'No',
  'Name',
  'Contact',
  'Email',
  'Action',
];

export const HEADER_TABLE_INGREDIENTS = [
  'No',
  'Menu',
  'Ingredient',
  'Quantity Needed',
  'Action',
];

export const INVENTORY_CATEGORY_LIST = [
  { value: 'coffee-beans', label: 'Coffee Beans' },
  { value: 'milk', label: 'Milk & Dairy' },
  { value: 'pastry-ingredients', label: 'Pastry Ingredients' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'others', label: 'Others' },
];

export const UNIT_LIST = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'liter', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
];

export const INITIAL_INVENTORY_ITEM = {
  name: '',
  category: '',
  unit: '',
  current_stock: '',
  minimum_stock: '',
  unit_price: '',
  supplier_id: '',
};

export const INITIAL_STATE_INVENTORY = {
  status: 'idle',
  errors: {
    name: [],
    category: [],
    unit: [],
    current_stock: [],
    minimum_stock: [],
    unit_price: [],
    supplier_id: [],
    _form: [],
  },
};

export const INITIAL_SUPPLIER = {
  name: '',
  contact: '',
  email: '',
  address: '',
};

export const INITIAL_STATE_SUPPLIER = {
  status: 'idle',
  errors: {
    name: [],
    contact: [],
    email: [],
    address: [],
    _form: [],
  },
};

export const INITIAL_MENU_INGREDIENT = {
  menu_id: '',
  item_id: '',
  quantity_needed: '',
};

export const INITIAL_STATE_MENU_INGREDIENT = {
  status: 'idle',
  errors: {
    menu_id: [],
    item_id: [],
    quantity_needed: [],
    _form: [],
  },
};