import DialogDelete from "@/components/common/dialog-delete";
import { InventoryItem } from "@/validations/inventory-validation";
import { startTransition, useActionState, useEffect } from "react";
import { deleteInventoryItem } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

export default function DialogDeleteInventory({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: InventoryItem | null;
  open: boolean;
  handleChangeAction: () => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteInventoryItem,
    INITIAL_STATE_ACTION
  );

  useEffect(() => {
    if (!open) {
      startTransition(() => {
        deleteAction(null);
      });
    }
  }, [open, deleteAction]);

  const onSubmit = () => {
    if (!currentData?.id) return;

    const formData = new FormData();
    formData.append("id", currentData.id);

    startTransition(() => {
      deleteAction(formData);
    });
  };

  useEffect(() => {
    if (deleteState?.status === "error") {
      toast.error("Delete Inventory Failed", {
        description: deleteState.errors?._form?.[0],
      });
      startTransition(() => {
        deleteAction(null);
      });
    }

    if (deleteState?.status === "success") {
      toast.success("Delete Inventory Success");
      handleChangeAction();
      refetch();
      startTransition(() => {
        deleteAction(null);
      });
    }
  }, [deleteState, refetch, handleChangeAction, deleteAction]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPending}
      onSubmit={onSubmit}
      title="Inventory Item"
    />
  );
}
