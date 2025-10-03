import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { InventoryItemForm, inventoryItemFormSchema } from "@/validations/inventory-validation";
import { INITIAL_INVENTORY_ITEM, INITIAL_STATE_INVENTORY } from "@/constants/inventory-constant";
import { createInventoryItem } from "../actions";
import FormInventory from "./form-inventory";

export default function DialogCreateInventory({ 
    refetch,
    suppliers 
}: { 
    refetch: () => void;
    suppliers?: Array<{ id: string; name: string }>;
}) {
    const form = useForm<InventoryItemForm>({
        resolver: zodResolver(inventoryItemFormSchema),
        defaultValues: INITIAL_INVENTORY_ITEM,
    });

    const [createState, createAction, isPending] = useActionState(
        createInventoryItem,
        INITIAL_STATE_INVENTORY
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
            toast.error('Create Inventory Failed', {
                description: createState.errors?._form?.[0],
            });
        }

        if (createState?.status === 'success') {
            toast.success('Create Inventory Success');
            form.reset();
            document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
            refetch();
        }
    }, [createState, form, refetch]);

    return (
        <FormInventory
            form={form}
            onSubmit={onSubmit}
            isLoading={isPending}
            type="Create"
            suppliers={suppliers}
        />
    );
}