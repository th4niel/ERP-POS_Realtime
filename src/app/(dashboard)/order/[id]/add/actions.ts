'use server';

import { createClient } from '@/lib/supabase/server';

type InventoryItemData = {
    item_id: number;
    quantity_needed: number;
    inventory_items: {
        name: string;
        current_stock: number;
    } | null;
};

type OrderItemInput = {
    order_id: string;
    menu_id: string;
    quantity: number;
    notes: string;
    status: string;
};

export async function processOrderWithInventory(
    prevState: any,
    data: {
        order_id: string;
        items: OrderItemInput[];
    }
) {
    const supabase = await createClient();

    try {
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
                .select('item_id, quantity_needed, inventory_items(name, current_stock)')
                .eq('menu_id', item.menu_id)
                .returns<InventoryItemData[]>();

            if (ingredients && ingredients.length > 0) {
                for (const ingredient of ingredients) {
                    if (!ingredient.inventory_items) {
                        return {
                            status: 'error',
                            errors: { _form: ['Inventory item not found'] },
                        };
                    }

                    const requiredQty = ingredient.quantity_needed * item.quantity;
                    const currentStock = ingredient.inventory_items.current_stock;

                    if (currentStock < requiredQty) {
                        return {
                            status: 'error',
                            errors: {
                                _form: [`Insufficient stock for ${ingredient.inventory_items.name}. Required: ${requiredQty}, Available: ${currentStock}`]
                            }
                        };
                    }
                }
            }
        }

        const orderItems = data.items.map(item => ({
            order_id: order.id,
            menu_id: parseInt(item.menu_id),
            quantity: item.quantity,
            notes: item.notes,
            status: item.status,
        }));

        const { error: insertError } = await supabase
            .from('orders_menus')
            .insert(orderItems);

        if (insertError) {
            return {
                status: 'error',
                errors: { _form: [insertError.message] },
            };
        }

        for (const item of data.items) {
            const { data: ingredients } = await supabase
                .from('menu_ingredients')
                .select('item_id, quantity_needed')
                .eq('menu_id', item.menu_id)
                .returns<{ item_id: number; quantity_needed: number }[]>();

            if (ingredients && ingredients.length > 0) {
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
        }

        return { status: 'success' };
    } catch (error: any) {
        return {
            status: 'error',
            errors: { _form: [error.message || 'Failed to process order'] },
        };
    }
}