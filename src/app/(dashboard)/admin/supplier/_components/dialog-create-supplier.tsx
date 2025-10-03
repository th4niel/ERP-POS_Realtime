import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SupplierForm, supplierFormSchema } from "@/validations/inventory-validation";
import { INITIAL_SUPPLIER, INITIAL_STATE_SUPPLIER } from "@/constants/inventory-constant";
import { createSupplier } from "../actions";
import FormSupplier from "./form-supplier";

export default function DialogCreateSupplier({ refetch }: { refetch: () => void }) {
    const form = useForm<SupplierForm>({
        resolver: zodResolver(supplierFormSchema),
        defaultValues: INITIAL_SUPPLIER,
    });

    const [createState, createAction, isPending] = useActionState(
        createSupplier,
        INITIAL_STATE_SUPPLIER
    );

    const onSubmit = form.handleSubmit((data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        startTransition(() => {
            createAction(formData);
        });
    });

    useEffect(() => {
        if (createState?.status === 'error') {
            toast.error('Create Supplier Failed', {
                description: createState.errors?._form?.[0],
            });
        }

        if (createState?.status === 'success') {
            toast.success('Create Supplier Success');
            form.reset();
            document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
            refetch();
        }
    }, [createState, form, refetch]);

    return (
        <FormSupplier
            form={form}
            onSubmit={onSubmit}
            isLoading={isPending}
            type="Create"
        />
    );
}