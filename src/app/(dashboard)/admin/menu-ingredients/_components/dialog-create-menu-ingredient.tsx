import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MenuIngredientForm, menuIngredientFormSchema } from "@/validations/inventory-validation";
import { INITIAL_MENU_INGREDIENT, INITIAL_STATE_MENU_INGREDIENT } from "@/constants/inventory-constant";
import { createMenuIngredient } from "../actions";
import FormMenuIngredient from "./form-menu-ingredient";

export default function DialogCreateMenuIngredient({ 
    refetch,
    menus,
    items
}: { 
    refetch: () => void;
    menus?: { id: string; name: string }[];
    items?: { id: string; name: string; unit: string }[];
}) {
    const form = useForm<MenuIngredientForm>({
        resolver: zodResolver(menuIngredientFormSchema),
        defaultValues: INITIAL_MENU_INGREDIENT,
    });

    const [createState, createAction, isPending] = useActionState(
        createMenuIngredient,
        INITIAL_STATE_MENU_INGREDIENT
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
            toast.error('Create Menu Ingredient Failed', {
                description: createState.errors?._form?.[0],
            });
        }

        if (createState?.status === 'success') {
            toast.success('Create Menu Ingredient Success');
            form.reset();
            document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
            refetch();
        }
    }, [createState, form, refetch]);

    return (
        <FormMenuIngredient
            form={form}
            onSubmit={onSubmit}
            isLoading={isPending}
            type="Create"
            menus={menus}
            items={items}
        />
    );
}