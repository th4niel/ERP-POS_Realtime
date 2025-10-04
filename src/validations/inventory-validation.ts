import z from 'zod';

export const inventoryItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  current_stock: z.string().min(1, 'Current stock is required'),
  minimum_stock: z.string().min(1, 'Minimum stock is required'),
  unit_price: z.string().min(1, 'Unit price is required'),
  supplier_id: z.string().optional(),
});

export const inventoryItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  unit: z.string(),
  current_stock: z.number(),
  minimum_stock: z.number(),
  unit_price: z.number(),
  supplier_id: z.number().nullable(),
});

export const supplierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string(),
  contact: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
});

export const menuIngredientFormSchema = z.object({
  menu_id: z.string().min(1, 'Menu is required'),
  item_id: z.string().min(1, 'Ingredient is required'),
  quantity_needed: z.string().min(1, 'Quantity is required'),
});

export const menuIngredientSchema = z.object({
  menu_id: z.number(),
  item_id: z.number(),
  quantity_needed: z.number(),
});

export type InventoryItemForm = z.infer<typeof inventoryItemFormSchema>;

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  supplier_id: number | null;
  suppliers?: { 
    id: number;
    name: string; 
  } | null;
  created_at?: string;
  updated_at?: string;
};

export type SupplierForm = z.infer<typeof supplierFormSchema>;

export type Supplier = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  address: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MenuIngredientForm = z.infer<typeof menuIngredientFormSchema>;

export type MenuIngredient = {
  id: string;
  menu_id: number;
  item_id: number;
  quantity_needed: number;
  inventory_items?: InventoryItem;
  menus?: { 
    id: number;
    name: string; 
  };
  created_at?: string;
  updated_at?: string;
};