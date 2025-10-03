'use server';

import { createClient } from '@/lib/supabase/server';
import { Cart } from '@/types/order';

export async function processOrderWithInventory(data: {
    order_id: string;
    items: Cart[];
}) {
    const supabase = await createClient();

    const orderItems = data.items.map(({ total, menu, ...item }) => item);
    const { data: insertedItems, error: insertError } = await supabase
        .from('orders_menus')
        .insert(orderItems)
        .select();

    if (insertError) {
        return {
            status: 'error',
            errors: { _form: [insertError.message] },
        };
    }

    const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('order_id', data.order_id)
        .single();

    if (!order) {
        return {
            status: 'error',
            errors: { _form: ['Order not found'] },
        };
    }

    for (const item of data.items) {
        const { data: ingredients } = await supabase
            .from('menu_ingredients')
            .select('item_id, quantity_needed')
            .eq('menu_id', item.menu_id);

        if (!ingredients || ingredients.length === 0) continue;

        for (const ingredient of ingredients) {
            const deductQty = ingredient.quantity_needed * item.quantity;

            const { error: deductError } = await supabase.rpc(
                'deduct_inventory_stock',
                {
                    p_item_id: ingredient.item_id,
                    p_quantity: deductQty,
                }
            );

            if (deductError) {
                console.error('Inventory deduction failed:', deductError);
            }

            await supabase.from('inventory_transactions').insert({
                item_id: ingredient.item_id,
                transaction_type: 'out',
                quantity: -deductQty,
                reference_type: 'order',
                reference_id: order.id,
                notes: `Used for Order ${data.order_id}`,
            });
        }
    }

    return { status: 'success' };
}