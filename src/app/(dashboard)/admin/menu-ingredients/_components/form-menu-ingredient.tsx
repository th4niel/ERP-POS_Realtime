import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { FormEvent } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormMenuIngredient<T extends FieldValues>({
    form,
    onSubmit,
    isLoading,
    type,
    menus,
    items,
}: {
    form: UseFormReturn<T>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    type: 'Create' | 'Update';
    menus?: { id: string; name: string }[];
    items?: { id: string; name: string; unit: string }[];
}) {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
                <DialogHeader>
                    <DialogTitle>{type} Menu Ingredient</DialogTitle>
                    <DialogDescription>
                        {type === 'Create' ? 'Map menu to inventory ingredient' : 'Update ingredient mapping'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <FormSelect
                        form={form}
                        name={'menu_id' as Path<T>}
                        label="Menu"
                        selectItem={(menus || []).map((menu) => ({
                            value: menu.id,
                            label: menu.name,
                        }))}
                    />
                    <FormSelect
                        form={form}
                        name={'item_id' as Path<T>}
                        label="Inventory Item"
                        selectItem={(items || []).map((item) => ({
                            value: item.id,
                            label: `${item.name} (${item.unit})`,
                        }))}
                    />
                    <FormInput
                        form={form}
                        name={'quantity_needed' as Path<T>}
                        label="Quantity Needed"
                        placeholder="0"
                        type="number"
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">
                            {isLoading ? <Loader2 className="animate-spin" /> : type}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}