import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateInventoryItem } from '../actions';
import { toast } from 'sonner';
import FormInventory from './form-inventory';
import { Dialog } from '@radix-ui/react-dialog';
import { InventoryItem, InventoryItemForm, inventoryItemFormSchema, Supplier } from '@/validations/inventory-validation';
import { INITIAL_STATE_INVENTORY } from '@/constants/inventory-constant';

export default function DialogUpdateInventory({
    refetch,
    currentData,
    open,
    handleChangeAction,
    suppliers,
}: {
    refetch: () => void;
    currentData?: InventoryItem | null;
    open: boolean;
    handleChangeAction: () => void;
    suppliers?: Supplier[];
}) {
    const form = useForm<InventoryItemForm>({
        resolver: zodResolver(inventoryItemFormSchema),
        defaultValues: {
            name: '',
            category: '',
            unit: '',
            current_stock: '',
            minimum_stock: '',
            unit_price: '',
            supplier_id: '',
        }
    });

    const [updateState, updateAction, isPending] = useActionState(
        updateInventoryItem,
        INITIAL_STATE_INVENTORY
    );

    useEffect(() => {
        if (!open) {
            form.reset({
                name: '',
                category: '',
                unit: '',
                current_stock: '',
                minimum_stock: '',
                unit_price: '',
                supplier_id: '',
            });
            startTransition(() => {
                updateAction(null);
            });
        }
    }, [open, form, updateAction]);

    useEffect(() => {
        if (open && currentData) {
            form.setValue('name', currentData.name);
            form.setValue('category', currentData.category);
            form.setValue('unit', currentData.unit);
            form.setValue('current_stock', currentData.current_stock.toString());
            form.setValue('minimum_stock', currentData.minimum_stock.toString());
            form.setValue('unit_price', currentData.unit_price.toString());
            form.setValue('supplier_id', currentData.supplier_id?.toString() || '');
        }
    }, [open, currentData, form]);

    const onSubmit = form.handleSubmit((data) => {
        if (!currentData?.id) return;

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append('id', currentData.id);

        startTransition(() => {
            updateAction(formData);
        });
    });

    useEffect(() => {
        if (updateState?.status === 'error') {
            toast.error('Update Inventory Failed', {
                description: updateState.errors?._form?.[0],
            });
            startTransition(() => {
                updateAction(null);
            });
        }

        if (updateState?.status === 'success') {
            toast.success('Update Inventory Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                updateAction(null);
            });
        }
    }, [updateState, refetch, handleChangeAction, updateAction]);

    return (
        <Dialog open={open} onOpenChange={handleChangeAction}>
            <FormInventory
                form={form}
                onSubmit={onSubmit}
                isLoading={isPending}
                type="Update"
                suppliers={suppliers}
            />
        </Dialog>
    );
}