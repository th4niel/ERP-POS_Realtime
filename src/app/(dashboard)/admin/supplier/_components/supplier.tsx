// File: src/app/(dashboard)/admin/supplier/_components/supplier.tsx
'use client';

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Supplier } from "@/validations/inventory-validation";
import { HEADER_TABLE_SUPPLIER } from "@/constants/inventory-constant";
import DialogCreateSupplier from "./dialog-create-supplier";
import DialogUpdateSupplier from "./dialog-update-supplier";
import DialogDeleteSupplier from "./dialog-delete-supplier";

export default function SupplierManagement() {
    const supabase = createClient();
    const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

    const { data: suppliers, isLoading, refetch } = useQuery({
        queryKey: ['suppliers', currentPage, currentLimit, currentSearch],
        queryFn: async () => {
            const query = supabase
                .from('suppliers')
                .select('*', { count: 'exact' })
                .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
                .order('name');

            if (currentSearch) {
                query.ilike('name', `%${currentSearch}%`);
            }

            const result = await query;

            if (result.error)
                toast.error('Get Supplier data failed', {
                    description: result.error.message,
                });

            return result;
        },
    });

    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const handleOpenUpdateDialog = useCallback((supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setUpdateDialogOpen(true);
    }, []);

    const handleCloseUpdateDialog = useCallback(() => {
        setUpdateDialogOpen(false);
        setTimeout(() => setSelectedSupplier(null), 150);
    }, []);

    const handleOpenDeleteDialog = useCallback((supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setTimeout(() => setSelectedSupplier(null), 150);
    }, []);

    const filteredData = useMemo(() => {
        return (suppliers?.data || []).map((supplier: Supplier, index) => {
            return [
                currentLimit * (currentPage - 1) + index + 1,
                supplier.name,
                supplier.contact || '-',
                supplier.email || '-',
                <DropdownAction
                    key={`dropdown-${supplier.id}`}
                    menu={[
                        {
                            label: (
                                <span className="flex items-center gap-2">
                                    <Pencil />
                                    Edit
                                </span>
                            ),
                            action: () => handleOpenUpdateDialog(supplier),
                        },
                        {
                            label: (
                                <span className="flex items-center gap-2">
                                    <Trash2 className="text-red-400" />
                                    Delete
                                </span>
                            ),
                            variant: 'destructive',
                            action: () => handleOpenDeleteDialog(supplier),
                        },
                    ]}
                />,
            ];
        });
    }, [suppliers?.data, handleOpenUpdateDialog, handleOpenDeleteDialog, currentLimit, currentPage]);

    const totalPages = useMemo(() => {
        return suppliers && suppliers.count !== null ? Math.ceil(suppliers.count / currentLimit) : 0;
    }, [suppliers, currentLimit]);

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
                <h1 className="text-2xl font-bold">Supplier Management</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search by name"
                        onChange={(e) => handleChangeSearch(e.target.value)}
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Create</Button>
                        </DialogTrigger>
                        <DialogCreateSupplier refetch={refetch} />
                    </Dialog>
                </div>
            </div>

            <DataTable
                header={HEADER_TABLE_SUPPLIER}
                data={filteredData}
                isLoading={isLoading}
                totalPages={totalPages}
                currentPage={currentPage}
                currentLimit={currentLimit}
                onChangePage={handleChangePage}
                onChangeLimit={handleChangeLimit}
            />

            <DialogUpdateSupplier
                open={updateDialogOpen}
                refetch={refetch}
                currentData={selectedSupplier}
                handleChangeAction={handleCloseUpdateDialog}
            />

            <DialogDeleteSupplier
                open={deleteDialogOpen}
                refetch={refetch}
                currentData={selectedSupplier}
                handleChangeAction={handleCloseDeleteDialog}
            />
        </div>
    );
}