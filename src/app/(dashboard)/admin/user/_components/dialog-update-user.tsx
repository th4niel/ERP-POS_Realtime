import { INITIAL_STATE_UPDATE_USER } from "@/constants/auth-constant";
import { UpdateUserForm, updateUserSchema } from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateUser } from "../actions";
import { toast } from "sonner";
import { Preview } from "@/types/general";
import FormUser from "./form-user";
import { Profile } from "@/types/auth";
import { Dialog } from "@/components/ui/dialog";
    
export default function DialogUpdateUser({ 
    refetch, 
    currentData,
    open,
    handleChangeAction,
}: { 
    refetch: () => void; 
    currentData?: Profile | null;
    open: boolean;
    handleChangeAction: () => void;
}) {
    const form = useForm<UpdateUserForm>({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            name: '',
            role: '',
            avatar_url: '',
        }
    });

    const [updateUserState, updateUserAction, isPendingUpdateUser] = useActionState(
        updateUser, 
        INITIAL_STATE_UPDATE_USER
    );

    const [preview, setPreview] = useState<Preview | undefined>(undefined);

    useEffect(() => {
        if (!open) {
            form.reset({
                name: '',
                role: '',
                avatar_url: '',
            });
            setPreview(undefined);
            startTransition(() => {
                updateUserAction(null);
            });
        }
    }, [open, form, updateUserAction]);

    useEffect(() => {
        if (open && currentData) {
            form.setValue('name', currentData.name || '');
            form.setValue('role', currentData.role || '');
            form.setValue('avatar_url', currentData.avatar_url || '');
            
            if (currentData.avatar_url) {
                setPreview({
                    file: new File([], currentData.avatar_url),
                    displayUrl: currentData.avatar_url,
                });
            }
        }
    }, [open, currentData, form]);

    const onSubmit = form.handleSubmit((data) => {
        if (!currentData?.id) return;

        const formData = new FormData();
        
        if (currentData.avatar_url !== data.avatar_url && preview?.file) {
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, key === 'avatar_url' ? preview.file : value);
            });
            formData.append('old_avatar_url', currentData.avatar_url || '');
        } else {
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }
        
        formData.append('id', currentData.id);

        startTransition(() => {
            updateUserAction(formData);
        });
    });

    useEffect(() => {
        if (updateUserState?.status === 'error') {
            toast.error('Update User Failed', {
                description: updateUserState.errors?._form?.[0],
            });
            startTransition(() => {
                updateUserAction(null);
            });
        }

        if (updateUserState?.status === 'success') {
            toast.success('Update User Success');
            handleChangeAction();
            refetch();
            startTransition(() => {
                updateUserAction(null);
            });
        }
    }, [updateUserState, refetch, handleChangeAction, updateUserAction]);

    return (
        <Dialog open={open} onOpenChange={handleChangeAction}>
            <FormUser 
                form={form} 
                onSubmit={onSubmit} 
                isLoading={isPendingUpdateUser}
                type="Update" 
                preview={preview} 
                setPreview={setPreview}
            />
        </Dialog>
    );
}