'use client';

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { InventoryItem } from "@/validations/inventory-validation";
import { cn, convertUSD } from "@/lib/utils";
import { HEADER_TABLE_INVENTORY } from "@/constants/inventory-constant";
import DialogCreateInventory from "./dialog-create-inventory";
import DialogUpdateInventory from "./dialog-update-inventory";
import DialogDeleteInventory from "./dialog-delete-inventory";

export default function InventoryManagement() {
    const supabase = createClient();
    const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

    const { data: suppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('suppliers')
                .select('id, name')
                .order('name');
            
            if (error) {
                toast.error('Failed to load suppliers');
                return [];
            }
            return data;
        },
    });

    const { data: inventory, isLoading, refetch } = useQuery({
        queryKey: ['inventory', currentPage, currentLimit, currentSearch],
        queryFn: async () => {
            const query = supabase
                .from('inventory_items')
                .select('*, suppliers(name)', { count: 'exact' })
                .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
                .order('created_at');

            if (currentSearch) {
                query.or(`name.ilike.%${currentSearch}%,category.ilike.%${currentSearch}%`);
            }

            const result = await query;

            if (result.error)
                toast.error('Get Inventory data failed', {
                    description: result.error.message,
                });

            return result;
        },
    });

    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const handleOpenUpdateDialog = useCallback((item: InventoryItem) => {
        setSelectedItem(item);
        setUpdateDialogOpen(true);
    }, []);

    const handleCloseUpdateDialog = useCallback(() => {
        setUpdateDialogOpen(false);
        setTimeout(() => setSelectedItem(null), 150);
    }, []);

    const handleOpenDeleteDialog = useCallback((item: InventoryItem) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setTimeout(() => setSelectedItem(null), 150);
    }, []);

    const filteredData = useMemo(() => {
        return (inventory?.data || []).map((item: InventoryItem, index) => {
            const isLowStock = item.current_stock <= item.minimum_stock;
            
            return [
                currentLimit * (currentPage - 1) + index + 1,
                <div key={`item-${item.id}`} className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.suppliers && (
                        <span className="text-xs text-muted-foreground">
                            Supplier: {item.suppliers.name}
                        </span>
                    )}
                </div>,
                <span key={`cat-${item.id}`} className="capitalize">
                    {item.category.replace('-', ' ')}
                </span>,
                <div key={`stock-${item.id}`} className="flex items-center gap-2">
                    {item.current_stock} {item.unit}
                    {isLowStock && (
                        <AlertTriangle className="size-4 text-red-500" />
                    )}
                </div>,
                <span key={`min-${item.id}`}>
                    {item.minimum_stock} {item.unit}
                </span>,
                <span key={`price-${item.id}`}>
                    {convertUSD(item.unit_price)}
                </span>,
                <div
                    key={`status-${item.id}`}
                    className={cn(
                        'px-2 py-1 rounded-full text-white w-fit text-xs',
                        isLowStock ? 'bg-red-500' : 'bg-green-500'
                    )}
                >
                    {isLowStock ? 'Low Stock' : 'In Stock'}
                </div>,
                <DropdownAction
                    key={`dropdown-${item.id}`}
                    menu={[
                        {
                            label: (
                                <span className="flex items-center gap-2">
                                    <Pencil />
                                    Edit
                                </span>
                            ),
                            action: () => handleOpenUpdateDialog(item),
                        },
                        {
                            label: (
                                <span className="flex items-center gap-2">
                                    <Trash2 className="text-red-400" />
                                    Delete
                                </span>
                            ),
                            variant: 'destructive',
                            action: () => handleOpenDeleteDialog(item),
                        },
                    ]}
                />,
            ];
        });
    }, [inventory?.data, handleOpenUpdateDialog, handleOpenDeleteDialog, currentLimit, currentPage]);

    const totalPages = useMemo(() => {
        return inventory && inventory.count !== null ? Math.ceil(inventory.count / currentLimit) : 0;
    }, [inventory, currentLimit]);

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search by name or category"
                        onChange={(e) => handleChangeSearch(e.target.value)}
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Create</Button>
                        </DialogTrigger>
                        <DialogCreateInventory refetch={refetch} suppliers={suppliers} />
                    </Dialog>
                </div>
            </div>

            <DataTable
                header={HEADER_TABLE_INVENTORY}
                data={filteredData}
                isLoading={isLoading}
                totalPages={totalPages}
                currentPage={currentPage}
                currentLimit={currentLimit}
                onChangePage={handleChangePage}
                onChangeLimit={handleChangeLimit}
            />

            <DialogUpdateInventory
                open={updateDialogOpen}
                refetch={refetch}
                currentData={selectedItem}
                handleChangeAction={handleCloseUpdateDialog}
                suppliers={suppliers}
            />

            <DialogDeleteInventory
                open={deleteDialogOpen}
                refetch={refetch}
                currentData={selectedItem}
                handleChangeAction={handleCloseDeleteDialog}
            />
        </div>
    );
}