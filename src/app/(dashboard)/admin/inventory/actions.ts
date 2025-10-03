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

export async function adjustStock(
  prevState: any,
  formData: FormData | null
) {
  if (!formData) {
    return { status: 'idle', errors: {} };
  }

  const itemId = parseInt(formData.get('item_id') as string);
  const transactionType = formData.get('transaction_type') as string;
  const quantity = parseFloat(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;

  if (!itemId || !transactionType || !quantity) {
    return {
      status: 'error',
      errors: { _form: ['Invalid input data'] },
    };
  }

  const supabase = await createClient();

  try {
    const actualQuantity = transactionType === 'out' ? -quantity : quantity;

    if (transactionType === 'in') {
      const { error: addError } = await supabase.rpc('add_inventory_stock', {
        p_item_id: itemId,
        p_quantity: quantity,
      });

      if (addError) throw addError;
    } else {
      const { data: item } = await supabase
        .from('inventory_items')
        .select('current_stock')
        .eq('id', itemId)
        .single();

      if (!item || item.current_stock < quantity) {
        return {
          status: 'error',
          errors: { _form: ['Insufficient stock'] },
        };
      }

      const { error: deductError } = await supabase.rpc('deduct_inventory_stock', {
        p_item_id: itemId,
        p_quantity: quantity,
      });

      if (deductError) throw deductError;
    }

    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        item_id: itemId,
        transaction_type: transactionType,
        quantity: actualQuantity,
        reference_type: 'manual',
        notes: notes || `Manual ${transactionType === 'in' ? 'stock in' : 'stock out'}`,
      });

    if (transactionError) throw transactionError;

    return { status: 'success' };
  } catch (error: any) {
    return {
      status: 'error',
      errors: { _form: [error.message || 'Failed to adjust stock'] },
    };
  }
}