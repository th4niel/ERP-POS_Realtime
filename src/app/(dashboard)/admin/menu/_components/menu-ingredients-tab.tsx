'use client';

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import useDataTable from "@/hooks/use-data-table";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { MenuIngredient } from "@/validations/inventory-validation";
import { HEADER_TABLE_INGREDIENTS } from "@/constants/inventory-constant";
import DialogCreateMenuIngredient from "./dialog-create-menu-ingredient";
import DialogUpdateMenuIngredient from "./dialog-update-menu-ingredient";
import DialogDeleteMenuIngredient from "./dialog-delete-menu-ingredient";

export default function MenuIngredientsTab() {
    const supabase = createClient();
    const { currentPage, currentLimit, handleChangePage, handleChangeLimit } = useDataTable();

    const { data: menus } = useQuery({
        queryKey: ['menus-list'],
        queryFn: async () => {
            const { data } = await supabase
                .from('menus')
                .select('id, name')
                .order('name');
            return data || [];
        },
    });

    const { data: items } = useQuery({
        queryKey: ['inventory-items-list'],
        queryFn: async () => {
            const { data } = await supabase
                .from('inventory_items')
                .select('id, name, unit')
                .order('name');
            return data || [];
        },
    });

    const { data: ingredients, isLoading, refetch } = useQuery({
        queryKey: ['menu-ingredients', currentPage, currentLimit],
        queryFn: async () => {
            const query = supabase
                .from('menu_ingredients')
                .select(`
                    *,
                    menus(name),
                    inventory_items(name, unit)
                `, { count: 'exact' })
                .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
                .order('created_at');

            const result = await query;

            if (result.error)
                toast.error('Get Menu Ingredients failed', {
                    description: result.error.message,
                });

            return result;
        },
    });

    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<MenuIngredient | null>(null);

    const handleOpenUpdateDialog = useCallback((ingredient: MenuIngredient) => {
        setSelectedIngredient(ingredient);
        setUpdateDialogOpen(true);
    }, []);

    const handleCloseUpdateDialog = useCallback(() => {
        setUpdateDialogOpen(false);
        setTimeout(() => setSelectedIngredient(null), 150);
    }, []);

    const handleOpenDeleteDialog = useCallback((ingredient: MenuIngredient) => {
        setSelectedIngredient(ingredient);
        setDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setTimeout(() => setSelectedIngredient(null), 150);
    }, []);

    const filteredData = useMemo(() => {
        return (ingredients?.data || []).map((ingredient: any, index) => {
            return [
                currentLimit * (currentPage - 1) + index + 1,
                ingredient.menus?.name || '-',
                ingredient.inventory_items?.name || '-',
                `${ingredient.quantity_needed} ${ingredient.inventory_items?.unit || ''}`,
                <DropdownAction
                    key={`dropdown-${ingredient.id}`}
                    menu={[
                        {
                            label: (
                                <span className="flex items-center gap-2">
                                    <Pencil />
                                    Edit
                                </span>
                            ),
                            action: () => handleOpenUpdateDialog(ingredient),
                        },
                        {
                            label: (
                                <span className="flex items-center gap-2">
                                    <Trash2 className="text-red-400" />
                                    Delete
                                </span>
                            ),
                            variant: 'destructive',
                            action: () => handleOpenDeleteDialog(ingredient),
                        },
                    ]}
                />,
            ];
        });
    }, [ingredients?.data, handleOpenUpdateDialog, handleOpenDeleteDialog, currentLimit, currentPage]);

    const totalPages = useMemo(() => {
        return ingredients && ingredients.count !== null ? Math.ceil(ingredients.count / currentLimit) : 0;
    }, [ingredients, currentLimit]);

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    Map menu items to inventory ingredients (recipes)
                </p>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Add Ingredient</Button>
                    </DialogTrigger>
                    <DialogCreateMenuIngredient 
                        refetch={refetch} 
                        menus={menus}
                        items={items}
                    />
                </Dialog>
            </div>

            <DataTable
                header={HEADER_TABLE_INGREDIENTS}
                data={filteredData}
                isLoading={isLoading}
                totalPages={totalPages}
                currentPage={currentPage}
                currentLimit={currentLimit}
                onChangePage={handleChangePage}
                onChangeLimit={handleChangeLimit}
            />

            <DialogUpdateMenuIngredient
                open={updateDialogOpen}
                refetch={refetch}
                currentData={selectedIngredient}
                handleChangeAction={handleCloseUpdateDialog}
                menus={menus}
                items={items}
            />

            <DialogDeleteMenuIngredient
                open={deleteDialogOpen}
                refetch={refetch}
                currentData={selectedIngredient}
                handleChangeAction={handleCloseDeleteDialog}
            />
        </div>
    );
}