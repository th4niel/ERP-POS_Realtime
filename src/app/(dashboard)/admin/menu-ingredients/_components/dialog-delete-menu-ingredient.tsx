import DialogDelete from "@/components/common/dialog-delete";
import { MenuIngredient } from "@/validations/inventory-validation";
import { startTransition, useActionState, useEffect } from "react";
import { deleteMenuIngredient } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

export default function DialogDeleteMenuIngredient({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: MenuIngredient | null;
  open: boolean;
  handleChangeAction: () => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteMenuIngredient,
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
      toast.error("Delete Menu Ingredient Failed", {
        description: deleteState.errors?._form?.[0],
      });
      startTransition(() => {
        deleteAction(null);
      });
    }

    if (deleteState?.status === "success") {
      toast.success("Delete Menu Ingredient Success");
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
      title="Menu Ingredient"
    />
  );
}