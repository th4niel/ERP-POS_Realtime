"use client";

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
import { cn } from "@/lib/utils";
import { Table } from "@/validations/table-validation";
import { HEADER_TABLE_TABLE } from "@/constants/table.constant";
import DialogCreateTable from "./dialog-create-table";
import DialogUpdateTable from "./dialog-update-table";
import DialogDeleteTable from "./dialog-delete-table";

export default function TableManagement() {
  const supabase = createClient();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const {
    data: tables,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tables", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("tables")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at");

      if (currentSearch) {
        query.or(
          `name.ilike.%${currentSearch}%,capacity.ilike.%${currentSearch}%,status.ilike.%${currentSearch}%`
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Table data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleOpenUpdateDialog = useCallback((tables: Table) => {
    setSelectedTable(tables);
    setUpdateDialogOpen(true);
  }, []);

  const handleCloseUpdateDialog = useCallback(() => {
    setUpdateDialogOpen(false);
    setTimeout(() => setSelectedTable(null), 150);
  }, []);

  const handleOpenDeleteDialog = useCallback((tables: Table) => {
    setSelectedTable(tables);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setTimeout(() => setSelectedTable(null), 150);
  }, []);

  const filteredData = useMemo(() => {
    return (tables?.data || []).map((table: Table, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        <div key={`name-${table.name}`}>
          <h4 className="font-bold">{table.name}</h4>
          <p className="text-xs">{table.description}</p>
        </div>,
        table.capacity,
        <div
          key={`status-${table.status}`}
          className={cn("px-2 py-1 rounded-full text-white w-fit capitalize", {
            "bg-green-400": table.status === "available",
            "bg-red-500": table.status === "unavailable",
            "bg-yellow-600": table.status === "reserved",
          })}
        >
          {table.status}
        </div>,
        <DropdownAction
          key={`dropdown-${table.name}`}
          menu={[
            {
              label: (
                <span className="flex items-center gap-2">
                  <Pencil />
                  Edit
                </span>
              ),
              action: () => handleOpenUpdateDialog(table),
            },
            {
              label: (
                <span className="flex items-center gap-2">
                  <Trash2 className="text-red-400" />
                  Delete
                </span>
              ),
              variant: "destructive",
              action: () => handleOpenDeleteDialog(table),
            },
          ]}
        />,
      ];
    });
  }, [
    tables?.data,
    handleOpenUpdateDialog,
    handleOpenDeleteDialog,
    currentLimit,
    currentPage,
  ]);

  const totalPages = useMemo(() => {
    return tables && tables.count !== null
      ? Math.ceil(tables.count / currentLimit)
      : 0;
  }, [tables, currentLimit]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Table Management</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, capacity and status"
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Create</Button>
            </DialogTrigger>
            <DialogCreateTable refetch={refetch} />
          </Dialog>
        </div>
      </div>

      <DataTable
        header={HEADER_TABLE_TABLE}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />

      <DialogUpdateTable
        open={updateDialogOpen}
        refetch={refetch}
        currentData={selectedTable}
        handleChangeAction={handleCloseUpdateDialog}
      />

      <DialogDeleteTable
        open={deleteDialogOpen}
        refetch={refetch}
        currentData={selectedTable}
        handleChangeAction={handleCloseDeleteDialog}
      />
    </div>
  );
}
