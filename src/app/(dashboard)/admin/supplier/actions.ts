'use server';

import { createClient } from '@/lib/supabase/server';
import { SupplierFormState } from '@/types/inventory';
import { supplierSchema } from '@/validations/inventory-validation';
import { INITIAL_STATE_SUPPLIER } from '@/constants/inventory-constant';

export async function createSupplier(
  prevState: SupplierFormState,
  formData: FormData
) {
  const validatedFields = supplierSchema.safeParse({
    name: formData.get('name'),
    contact: formData.get('contact') || null,
    email: formData.get('email') || null,
    address: formData.get('address') || null,
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
    .from('suppliers')
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

export async function updateSupplier(
  prevState: SupplierFormState,
  formData: FormData | null
) {
  if (!formData) return INITIAL_STATE_SUPPLIER;

  const validatedFields = supplierSchema.safeParse({
    name: formData.get('name'),
    contact: formData.get('contact') || null,
    email: formData.get('email') || null,
    address: formData.get('address') || null,
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
    .from('suppliers')
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

export async function deleteSupplier(
  prevState: SupplierFormState,
  formData: FormData | null
) {
  if (!formData) return INITIAL_STATE_SUPPLIER;

  const supabase = await createClient();

  const { error } = await supabase
    .from('suppliers')
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