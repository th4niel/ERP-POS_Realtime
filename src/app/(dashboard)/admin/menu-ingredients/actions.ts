'use server';

import { createClient } from '@/lib/supabase/server';
import { MenuIngredientFormState } from '@/types/inventory';
import { menuIngredientSchema } from '@/validations/inventory-validation';
import { INITIAL_STATE_MENU_INGREDIENT } from '@/constants/inventory-constant';

export async function createMenuIngredient(
  prevState: MenuIngredientFormState,
  formData: FormData
) {
  const validatedFields = menuIngredientSchema.safeParse({
    menu_id: parseInt(formData.get('menu_id') as string),
    item_id: parseInt(formData.get('item_id') as string),
    quantity_needed: parseFloat(formData.get('quantity_needed') as string),
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
    .from('menu_ingredients')
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

export async function updateMenuIngredient(
  prevState: MenuIngredientFormState,
  formData: FormData | null
) {
  if (!formData) return INITIAL_STATE_MENU_INGREDIENT;

  const validatedFields = menuIngredientSchema.safeParse({
    menu_id: parseInt(formData.get('menu_id') as string),
    item_id: parseInt(formData.get('item_id') as string),
    quantity_needed: parseFloat(formData.get('quantity_needed') as string),
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
    .from('menu_ingredients')
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

export async function deleteMenuIngredient(
  prevState: MenuIngredientFormState,
  formData: FormData | null
) {
  if (!formData) return INITIAL_STATE_MENU_INGREDIENT;

  const supabase = await createClient();

  const { error } = await supabase
    .from('menu_ingredients')
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