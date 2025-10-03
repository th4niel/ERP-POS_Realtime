import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { adjustStock } from "../actions";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";

const adjustStockSchema = z.object({
    item_id: z.string().min(1, 'Item is required'),
    transaction_type: z.string().min(1, 'Type is required'),
    quantity: z.string().min(1, 'Quantity is required'),
    notes: z.string().optional(),
});

type AdjustStockForm = z.infer<typeof adjustStockSchema>;

export default function DialogAdjustStock({ 
    open,
    onOpenChange,
    refetch,
    items 
}: { 
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refetch: () => void;
    items?: { id: string; name: string }[];
}) {
    const form = useForm<AdjustStockForm>({
        resolver: zodResolver(adjustStockSchema),
        defaultValues: {
            item_id: '',
            transaction_type: '',
            quantity: '',
            notes: '',
        },
    });

    const [adjustState, adjustAction, isPending] = useActionState(
        adjustStock,
        { status: 'idle', errors: {} }
    );

    useEffect(() => {
        if (!open) {
            form.reset();
            startTransition(() => {
                adjustAction(null);
            });
        }
    }, [open, form, adjustAction]);

    const onSubmit = form.handleSubmit((data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        startTransition(() => {
            adjustAction(formData);
        });
    });

    useEffect(() => {
        if (adjustState?.status === 'error') {
            toast.error('Stock Adjustment Failed', {
                description: adjustState.errors?._form?.[0],
            });
        }

        if (adjustState?.status === 'success') {
            toast.success('Stock Adjusted Successfully');
            onOpenChange(false);
            refetch();
        }
    }, [adjustState, refetch, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            Add or reduce inventory stock
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <FormSelect
                            form={form}
                            name="item_id"
                            label="Item"
                            selectItem={(items || []).map((item) => ({
                                value: item.id,
                                label: item.name,
                            }))}
                        />
                        <FormSelect
                            form={form}
                            name="transaction_type"
                            label="Type"
                            selectItem={[
                                { value: 'in', label: 'Stock In (Add)' },
                                { value: 'out', label: 'Stock Out (Reduce)' },
                            ]}
                        />
                        <FormInput
                            form={form}
                            name="quantity"
                            label="Quantity"
                            placeholder="0"
                            type="number"
                        />
                        <FormInput
                            form={form}
                            name="notes"
                            label="Notes"
                            placeholder="Reason for adjustment"
                            type="textarea"
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">
                                {isPending ? <Loader2 className="animate-spin" /> : 'Adjust'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}