import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { deleteTable } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";
import { Table } from "@/validations/table-validation";

export default function DialogDeleteTable({
    open,
    refetch,
    currentData,
    handleChangeAction
}: { 
    refetch: () => void; 
    currentData?: Table | null;
    open: boolean;
    handleChangeAction: () => void;
}) {
    const [deleteTableState, deleteTableAction, isPendingDeleteTable] = useActionState(
        deleteTable, 
        INITIAL_STATE_ACTION
    );

    useEffect(() => {
        if (!open) {
            startTransition(() => {
                deleteTableAction(null);
            });
        }
    }, [open, deleteTableAction]);

    const onSubmit = () => {
        if (!currentData?.id) return;

        const formData = new FormData();
        formData.append('id', currentData.id);

        startTransition(() => {
            deleteTableAction(formData);
        });
    };

    useEffect(() => {
        if (deleteTableState?.status === 'error') {
            toast.error('Delete Table Failed', {
                description: deleteTableState.errors?._form?.[0],
            });
            startTransition(() => {
                deleteTableAction(null);
            });
        }

        if (deleteTableState?.status === 'success') {
            toast.success('Delete Table Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                deleteTableAction(null);
            });
        }
    }, [deleteTableState, refetch, handleChangeAction, deleteTableAction]);

    return (
        <DialogDelete 
            open={open} 
            onOpenChange={handleChangeAction}
            isLoading={isPendingDeleteTable} 
            onSubmit={onSubmit}
            title="Table"
        />
    );
}