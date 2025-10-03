import DialogDelete from "@/components/common/dialog-delete";
import { Supplier } from "@/validations/inventory-validation";
import { startTransition, useActionState, useEffect } from "react";
import { deleteSupplier } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

export default function DialogDeleteSupplier({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Supplier | null;
  open: boolean;
  handleChangeAction: () => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteSupplier,
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
      toast.error("Delete Supplier Failed", {
        description: deleteState.errors?._form?.[0],
      });
      startTransition(() => {
        deleteAction(null);
      });
    }

    if (deleteState?.status === "success") {
      toast.success("Delete Supplier Success");
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
      title="Supplier"
    />
  );
}