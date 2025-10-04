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
import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { InventoryItem, Supplier } from "@/validations/inventory-validation";
import { cn, convertUSD } from "@/lib/utils";
import { HEADER_TABLE_INVENTORY } from "@/constants/inventory-constant";
import DialogCreateInventory from "./dialog-create-inventory";
import DialogUpdateInventory from "./dialog-update-inventory";
import DialogDeleteInventory from "./dialog-delete-inventory";
import { Card, CardContent } from "@/components/ui/card";
import DialogAdjustStock from "./dialog-adjust-stock";

const TABS = [
    { value: 'items', label: 'Inventory Items' },
    { value: 'transactions', label: 'Transactions' }
];

const HEADER_TABLE_TRANSACTIONS = [
    'No',
    'Item',
    'Type',
    'Quantity',
    'Reference',
    'Notes',
    'Date'
];

export default function InventoryManagement() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState('items');
    const [adjustStockOpen, setAdjustStockOpen] = useState(false);
    const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();

    const { data: suppliers, refetch: refetchSuppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('suppliers')
                .select('id, name, contact, email, address')
                .order('name');
            
            if (error) {
                toast.error('Failed to load suppliers');
                return [] as Supplier[];
            }
            
            return (data || []).map(s => ({
                id: s.id.toString(),
                name: s.name,
                contact: s.contact,
                email: s.email,
                address: s.address,
            })) as Supplier[];
        },
    });

    const { data: inventory, isLoading, refetch } = useQuery({
        queryKey: ['inventory', currentPage, currentLimit, currentSearch],
        queryFn: async () => {
            const query = supabase
                .from('inventory_items')
                .select('*, suppliers(id, name)', { count: 'exact' })
                .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
                .order('created_at', { ascending: false });

            if (currentSearch) {
                query.or(`name.ilike.%${currentSearch}%,category.ilike.%${currentSearch}%`);
            }

            const result = await query;

            if (result.error)
                toast.error('Get Inventory data failed', {
                    description: result.error.message,
                });

            return {
                ...result,
                data: result.data as InventoryItem[] | null
            };
        },
        enabled: activeTab === 'items'
    });

    const { data: transactions, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useQuery({
        queryKey: ['transactions', currentPage, currentLimit],
        queryFn: async () => {
            const result = await supabase
                .from('inventory_transactions')
                .select('*, inventory_items(name)', { count: 'exact' })
                .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
                .order('created_at', { ascending: false });

            if (result.error)
                toast.error('Get Transactions failed', {
                    description: result.error.message,
                });

            return result;
        },
        enabled: activeTab === 'transactions'
    });

    useEffect(() => {
        const channel = supabase
            .channel('inventory-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'inventory_items'
            }, () => {
                refetch();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'inventory_transactions'
            }, () => {
                refetchTransactions();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'suppliers'
            }, () => {
                refetchSuppliers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, refetch, refetchTransactions, refetchSuppliers]);

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
        if (activeTab === 'items') {
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
        } else {
            return (transactions?.data || []).map((transaction: any, index) => [
                currentLimit * (currentPage - 1) + index + 1,
                transaction.inventory_items?.name || '-',
                <div
                    key={`type-${transaction.id}`}
                    className={cn(
                        'px-2 py-1 rounded-full text-white w-fit text-xs capitalize',
                        transaction.transaction_type === 'in' ? 'bg-green-500' : 'bg-red-500'
                    )}
                >
                    {transaction.transaction_type}
                </div>,
                <span key={`qty-${transaction.id}`} className={cn(
                    transaction.transaction_type === 'in' ? 'text-green-500' : 'text-red-500'
                )}>
                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                </span>,
                <div key={`ref-${transaction.id}`} className="text-xs">
                    <span className="capitalize">{transaction.reference_type || '-'}</span>
                    {transaction.reference_id && <span> #{transaction.reference_id}</span>}
                </div>,
                transaction.notes || '-',
                new Date(transaction.created_at).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                })
            ]);
        }
    }, [activeTab, inventory?.data, transactions?.data, handleOpenUpdateDialog, handleOpenDeleteDialog, currentLimit, currentPage]);

    const totalPages = useMemo(() => {
        const data = activeTab === 'items' ? inventory : transactions;
        return data && data.count !== null ? Math.ceil(data.count / currentLimit) : 0;
    }, [activeTab, inventory, transactions, currentLimit]);

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
                <h1 className="text-2xl font-bold">Inventory Management</h1>
                <div className="flex gap-2">
                    {activeTab === 'items' && (
                        <>
                            <Input
                                placeholder="Search by name or category"
                                onChange={(e) => handleChangeSearch(e.target.value)}
                            />
                            <Button 
                                variant="outline"
                                onClick={() => setAdjustStockOpen(true)}
                            >
                                Adjust Stock
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Create</Button>
                                </DialogTrigger>
                                <DialogCreateInventory refetch={refetch} suppliers={suppliers} />
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

            <Card className="mb-4">
                <CardContent className="p-2">
                    <div className="flex gap-2">
                        {TABS.map(tab => (
                            <Button
                                key={tab.value}
                                variant={activeTab === tab.value ? 'default' : 'ghost'}
                                onClick={() => setActiveTab(tab.value)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <DataTable
                header={activeTab === 'items' ? HEADER_TABLE_INVENTORY : HEADER_TABLE_TRANSACTIONS}
                data={filteredData}
                isLoading={activeTab === 'items' ? isLoading : isLoadingTransactions}
                totalPages={totalPages}
                currentPage={currentPage}
                currentLimit={currentLimit}
                onChangePage={handleChangePage}
                onChangeLimit={handleChangeLimit}
            />

            {activeTab === 'items' && (
                <>
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

                    <DialogAdjustStock
                        open={adjustStockOpen}
                        onOpenChange={setAdjustStockOpen}
                        refetch={refetch}
                        items={(inventory?.data || []).map((item: InventoryItem) => ({
                            id: item.id,
                            name: item.name
                        }))}
                    />
                </>
            )}
        </div>
    );
}