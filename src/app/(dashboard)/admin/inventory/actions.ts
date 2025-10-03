'use server';

import { createClient } from '@/lib/supabase/server';
import { InventoryFormState } from '@/types/inventory';
import { inventoryItemSchema } from '@/validations/inventory-validation';
import { INITIAL_STATE_INVENTORY } from '@/constants/inventory-constant';

export async function createInventoryItem(
  prevState: InventoryFormState,
  formData: FormData
) {
  const validatedFields = inventoryItemSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    unit: formData.get('unit'),
    current_stock: parseFloat(formData.get('current_stock') as string),
    minimum_stock: parseFloat(formData.get('minimum_stock') as string),
    unit_price: parseFloat(formData.get('unit_price') as string),
    supplier_id: formData.get('supplier_id') 
      ? parseInt(formData.get('supplier_id') as string) 
      : null,
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('inventory_items')
    .insert(validatedFields.data);

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: 'success' };
}

export async function updateInventoryItem(
  prevState: InventoryFormState,
  formData: FormData | null
) {
  if (!formData) {
    return INITIAL_STATE_INVENTORY;
  }

  const validatedFields = inventoryItemSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    unit: formData.get('unit'),
    current_stock: parseFloat(formData.get('current_stock') as string),
    minimum_stock: parseFloat(formData.get('minimum_stock') as string),
    unit_price: parseFloat(formData.get('unit_price') as string),
    supplier_id: formData.get('supplier_id')
      ? parseInt(formData.get('supplier_id') as string)
      : null,
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('inventory_items')
    .update(validatedFields.data)
    .eq('id', formData.get('id'));

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: 'success' };
}

export async function deleteInventoryItem(
  prevState: InventoryFormState,
  formData: FormData | null
) {
  if (!formData) {
    return INITIAL_STATE_INVENTORY;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', formData.get('id'));

  if (error) {
    return {
      status: 'error',
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: 'success' };
}