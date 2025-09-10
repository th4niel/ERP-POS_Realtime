import DialogDelete from "@/components/common/dialog-delete";
import { Profile } from "@/types/auth";

export default function DialogDeleteUser({
    open,
    refetch,
    currentData,
    handleChangeAction
}: { 
    refetch: () => void; 
    currentData?: Profile;
    open?: boolean;
    handleChangeAction?: (open: boolean) => void;
}) {
    return(
        <DialogDelete 
            open={} 
            onOpenChange={} 
            isLoading={} 
            onSubmit={} 
            title="User"
        />
    );
}
