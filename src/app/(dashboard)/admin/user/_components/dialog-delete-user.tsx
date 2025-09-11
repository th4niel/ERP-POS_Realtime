import DialogDelete from "@/components/common/dialog-delete";
import { Profile } from "@/types/auth";
import { startTransition, useActionState, useEffect } from "react";
import { deleteUser } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

export default function DialogDeleteUser({
    open,
    refetch,
    currentData,
    handleChangeAction
}: { 
    refetch: () => void; 
    currentData?: Profile | null;
    open: boolean;
    handleChangeAction: () => void;
}) {
    const [deleteUserState, deleteUserAction, isPendingDeleteUser] = useActionState(
        deleteUser, 
        INITIAL_STATE_ACTION
    );

    useEffect(() => {
        if (!open) {
            startTransition(() => {
                deleteUserAction(null);
            });
        }
    }, [open,deleteUserAction]);

    const onSubmit = () => {
        if (!currentData?.id) return;

        const formData = new FormData();
        formData.append('id', currentData.id);
        formData.append('avatar_url', currentData.avatar_url || '');
        
        startTransition(() => {
            deleteUserAction(formData);
        });
    };

    useEffect(() => {
        if (deleteUserState?.status === 'error') {
            toast.error('Delete User Failed', {
                description: deleteUserState.errors?._form?.[0],
            });
            startTransition(() => {
                deleteUserAction(null);
            });
        }

        if (deleteUserState?.status === 'success') {
            toast.success('Delete User Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                deleteUserAction(null);
            });
        }
    }, [deleteUserState, refetch, handleChangeAction, deleteUserAction]);

    return (
        <DialogDelete 
            open={open} 
            onOpenChange={handleChangeAction}
            isLoading={isPendingDeleteUser} 
            onSubmit={onSubmit} 
            title="User"
        />
    );
}