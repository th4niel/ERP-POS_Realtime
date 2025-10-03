import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateSupplier } from '../actions';
import { toast } from 'sonner';
import FormSupplier from './form-supplier';
import { Dialog } from '@radix-ui/react-dialog';
import { Supplier, SupplierForm, supplierFormSchema } from '@/validations/inventory-validation';
import { INITIAL_STATE_SUPPLIER } from '@/constants/inventory-constant';

export default function DialogUpdateSupplier({
    refetch,
    currentData,
    open,
    handleChangeAction,
}: {
    refetch: () => void;
    currentData?: Supplier | null;
    open: boolean;
    handleChangeAction: () => void;
}) {
    const form = useForm<SupplierForm>({
        resolver: zodResolver(supplierFormSchema),
        defaultValues: {
            name: '',
            contact: '',
            email: '',
            address: '',
        }
    });

    const [updateState, updateAction, isPending] = useActionState(
        updateSupplier,
        INITIAL_STATE_SUPPLIER
    );

    useEffect(() => {
        if (!open) {
            form.reset({
                name: '',
                contact: '',
                email: '',
                address: '',
            });
            startTransition(() => {
                updateAction(null);
            });
        }
    }, [open, form, updateAction]);

    useEffect(() => {
        if (open && currentData) {
            form.setValue('name', currentData.name);
            form.setValue('contact', currentData.contact || '');
            form.setValue('email', currentData.email || '');
            form.setValue('address', currentData.address || '');
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
            toast.error('Update Supplier Failed', {
                description: updateState.errors?._form?.[0],
            });
            startTransition(() => {
                updateAction(null);
            });
        }

        if (updateState?.status === 'success') {
            toast.success('Update Supplier Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                updateAction(null);
            });
        }
    }, [updateState, refetch, handleChangeAction, updateAction]);

    return (
        <Dialog open={open} onOpenChange={handleChangeAction}>
            <FormSupplier
                form={form}
                onSubmit={onSubmit}
                isLoading={isPending}
                type="Update"
            />
        </Dialog>
    );
}