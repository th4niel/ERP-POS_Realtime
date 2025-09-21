import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateTable } from '../actions';
import { toast } from 'sonner';
import FormTable from './form-table';
import { Dialog } from '@radix-ui/react-dialog';
import { Table, TableForm, tableFormSchema } from '@/validations/table-validation';
import { INITIAL_STATE_TABLE } from '@/constants/table.constant';

export default function DialogUpdateTable({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Table | null;
  open: boolean;
  handleChangeAction: () => void;
}) {
  const form = useForm<TableForm>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      name: '',
      description: '',
      capacity: '',
      status: '',
    }
  });

  const [updateTableState, updateTableAction, isPendingUpdateTable] =
    useActionState(updateTable, INITIAL_STATE_TABLE);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        description: '',
        capacity: '',
        status: '',
      });
      startTransition(() => {
        updateTableAction(null);
      });
    }
  }, [open, form, updateTableAction]);

  useEffect(() => {
    if (open && currentData) {
      form.setValue('name', currentData.name);
      form.setValue('description', currentData.description);
      form.setValue('capacity', currentData.capacity.toString());
      form.setValue('status', currentData.status);
    }
  }, [open, currentData, form]);

  const onSubmit = form.handleSubmit((data) => {
    if (!currentData?.id) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });   
    formData.append('id', currentData.id);

    startTransition(() => {
      updateTableAction(formData);
    });
  });

  useEffect(() => {
    if (updateTableState?.status === 'error') {
      toast.error('Update Table Failed', {
        description: updateTableState.errors?._form?.[0],
      });
      startTransition(() => {
        updateTableAction(null);
      });
    }

    if (updateTableState?.status === 'success') {
      toast.success('Update Table Success');
      handleChangeAction();
      refetch();
      startTransition(() => {
        updateTableAction(null);
      });
    }
  }, [updateTableState, refetch, handleChangeAction, updateTableAction]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormTable
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateTable}
        type="Update"
      />
    </Dialog>
  );
}