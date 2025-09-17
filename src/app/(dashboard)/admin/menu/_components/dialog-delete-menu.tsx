import DialogDelete from "@/components/common/dialog-delete";
import { Menu } from "@/validations/menu-validation";
import { startTransition, useActionState, useEffect } from "react";
import { deleteMenu } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

export default function DialogDeleteMenu({
    open,
    refetch,
    currentData,
    handleChangeAction
}: { 
    refetch: () => void; 
    currentData?: Menu | null;
    open: boolean;
    handleChangeAction: () => void;
}) {
    const [deleteMenuState, deleteMenuAction, isPendingDeleteMenu] = useActionState(
        deleteMenu, 
        INITIAL_STATE_ACTION
    );

    useEffect(() => {
        if (!open) {
            startTransition(() => {
                deleteMenuAction(null);
            });
        }
    }, [open, deleteMenuAction]);

    const onSubmit = () => {
        if (!currentData?.id) return;

        const formData = new FormData();
        formData.append('id', currentData.id);
        formData.append('image_url', currentData.image_url || '');
        
        startTransition(() => {
            deleteMenuAction(formData);
        });
    };

    useEffect(() => {
        if (deleteMenuState?.status === 'error') {
            toast.error('Delete Menu Failed', {
                description: deleteMenuState.errors?._form?.[0],
            });
            startTransition(() => {
                deleteMenuAction(null);
            });
        }

        if (deleteMenuState?.status === 'success') {
            toast.success('Delete Menu Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                deleteMenuAction(null);
            });
        }
    }, [deleteMenuState, refetch, handleChangeAction, deleteMenuAction]);

    return (
        <DialogDelete 
            open={open} 
            onOpenChange={handleChangeAction}
            isLoading={isPendingDeleteMenu} 
            onSubmit={onSubmit} 
            title="Menu"
        />
    );
}