import FormInput from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { FormEvent } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormSupplier<T extends FieldValues>({
    form,
    onSubmit,
    isLoading,
    type,
}: {
    form: UseFormReturn<T>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    type: 'Create' | 'Update';
}) {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
                <DialogHeader>
                    <DialogTitle>{type} Supplier</DialogTitle>
                    <DialogDescription>
                        {type === 'Create' ? 'Add a new supplier' : 'Update supplier information'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <FormInput
                        form={form}
                        name={'name' as Path<T>}
                        label="Name"
                        placeholder="Supplier name"
                    />
                    <FormInput
                        form={form}
                        name={'contact' as Path<T>}
                        label="Contact"
                        placeholder="Phone number"
                    />
                    <FormInput
                        form={form}
                        name={'email' as Path<T>}
                        label="Email"
                        placeholder="email@example.com"
                        type="email"
                    />
                    <FormInput
                        form={form}
                        name={'address' as Path<T>}
                        label="Address"
                        placeholder="Full address"
                        type="textarea"
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