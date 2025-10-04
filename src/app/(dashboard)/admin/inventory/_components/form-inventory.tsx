import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { INVENTORY_CATEGORY_LIST, UNIT_LIST } from "@/constants/inventory-constant";
import { Supplier } from "@/validations/inventory-validation";
import { Loader2 } from "lucide-react";
import { FormEvent } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormInventory<T extends FieldValues>({
    form,
    onSubmit,
    isLoading,
    type,
    suppliers,
}: {
    form: UseFormReturn<T>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    type: 'Create' | 'Update';
    suppliers?: Supplier[];
}) {
    return (
        <DialogContent className="sm:max-w-[425px] max-h-[90vh]">
            <Form {...form}>
                <DialogHeader>
                    <DialogTitle>{type} Inventory Item</DialogTitle>
                    <DialogDescription>
                        {type === 'Create' ? 'Add a new inventory item' : 'Update inventory item'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-4 max-h-[40vh] px-1 overflow-y-auto">
                        <FormInput
                            form={form}
                            name={'name' as Path<T>}
                            label="Name"
                            placeholder="e.g., Arabica Coffee Beans"
                        />
                        <FormSelect
                            form={form}
                            name={'category' as Path<T>}
                            label="Category"
                            selectItem={INVENTORY_CATEGORY_LIST}
                        />
                        <FormSelect
                            form={form}
                            name={'unit' as Path<T>}
                            label="Unit"
                            selectItem={UNIT_LIST}
                        />
                        <FormInput
                            form={form}
                            name={'current_stock' as Path<T>}
                            label="Current Stock"
                            placeholder="0"
                            type="number"
                        />
                        <FormInput
                            form={form}
                            name={'minimum_stock' as Path<T>}
                            label="Minimum Stock"
                            placeholder="10"
                            type="number"
                        />
                        <FormInput
                            form={form}
                            name={'unit_price' as Path<T>}
                            label="Unit Price"
                            placeholder="0"
                            type="number"
                        />
                        <FormSelect
                            form={form}
                            name={'supplier_id' as Path<T>}
                            label="Supplier (Optional)"
                            selectItem={[
                                { value: '', label: 'No Supplier' },
                                ...(suppliers || []).map((s) => ({
                                    value: s.id,
                                    label: s.name,
                                })),
                            ]}
                        />
                    </div>
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