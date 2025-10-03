import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateMenuIngredient } from '../actions';
import { toast } from 'sonner';
import FormMenuIngredient from './form-menu-ingredient';
import { Dialog } from '@radix-ui/react-dialog';
import { MenuIngredient, MenuIngredientForm, menuIngredientFormSchema } from '@/validations/inventory-validation';
import { INITIAL_STATE_MENU_INGREDIENT } from '@/constants/inventory-constant';

export default function DialogUpdateMenuIngredient({
    refetch,
    currentData,
    open,
    handleChangeAction,
    menus,
    items,
}: {
    refetch: () => void;
    currentData?: MenuIngredient | null;
    open: boolean;
    handleChangeAction: () => void;
    menus?: { id: string; name: string }[];
    items?: { id: string; name: string; unit: string }[];
}) {
    const form = useForm<MenuIngredientForm>({
        resolver: zodResolver(menuIngredientFormSchema),
        defaultValues: {
            menu_id: '',
            item_id: '',
            quantity_needed: '',
        }
    });

    const [updateState, updateAction, isPending] = useActionState(
        updateMenuIngredient,
        INITIAL_STATE_MENU_INGREDIENT
    );

    useEffect(() => {
        if (!open) {
            form.reset({
                menu_id: '',
                item_id: '',
                quantity_needed: '',
            });
            startTransition(() => {
                updateAction(null);
            });
        }
    }, [open, form, updateAction]);

    useEffect(() => {
        if (open && currentData) {
            form.setValue('menu_id', currentData.menu_id.toString());
            form.setValue('item_id', currentData.item_id.toString());
            form.setValue('quantity_needed', currentData.quantity_needed.toString());
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
            toast.error('Update Menu Ingredient Failed', {
                description: updateState.errors?._form?.[0],
            });
            startTransition(() => {
                updateAction(null);
            });
        }

        if (updateState?.status === 'success') {
            toast.success('Update Menu Ingredient Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                updateAction(null);
            });
        }
    }, [updateState, refetch, handleChangeAction, updateAction]);

    return (
        <Dialog open={open} onOpenChange={handleChangeAction}>
            <FormMenuIngredient
                form={form}
                onSubmit={onSubmit}
                isLoading={isPending}
                type="Update"
                menus={menus}
                items={items}
            />
        </Dialog>
    );
}