"use client";

import DataTable from "@/components/common/data-table";
import DropdownAction from "@/components/common/dropdown-action";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useDataTable from "@/hooks/use-data-table";
import { createClientSupabase } from "@/lib/supabase/default";
import { useQuery } from "@tanstack/react-query";
import { Ban, Link2Icon, Package, ScrollText, Utensils } from "lucide-react";
import {
  useMemo,
  useState,
  useCallback,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HEADER_TABLE_ORDER } from "@/constants/order-constant";
import { updateReservation } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import DialogCreateOrderDineIn from "./dialog-create-order-dinein";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DialogCreateOrderTakeaway from "./dialog-create-order-takeaway";

export default function OrderManagement() {
  const supabase = createClientSupabase();
  const {
    currentPage,
    currentLimit,
    currentSearch,
    handleChangePage,
    handleChangeLimit,
    handleChangeSearch,
  } = useDataTable();

  const profile = useAuthStore((state) => state.profile);

  const {
    data: orders,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", currentPage, currentLimit, currentSearch],
    queryFn: async () => {
      const query = supabase
        .from("orders")
        .select(
          `
            id, order_id, customer_name, status, payment_token, tables(name, id)
            `,
          { count: "exact" }
        )
        .range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
        .order("created_at");

      if (currentSearch) {
        query.or(
          `order_id.ilike.%${currentSearch}%,customer_name.ilike.%${currentSearch}%,status.ilike.%${currentSearch}%`
        );
      }

      const result = await query;

      if (result.error)
        toast.error("Get Order data failed", {
          description: result.error.message,
        });

      return result;
    },
  });

  const { data: tables, refetch: refetchTables } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const result = await supabase
        .from("tables")
        .select("*")
        .order("created_at")
        .order("status");

      return result.data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("change-order")
      .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      () => {
        refetchOrders();
        refetchTables();
      },
      )
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
  }, [supabase,refetchOrders,refetchTables]);

  const totalPages = useMemo(() => {
    return orders && orders.count !== null
      ? Math.ceil(orders.count / currentLimit)
      : 0;
  }, [orders, currentLimit]);

  const [reservedState, reservedAction] = useActionState(
    updateReservation,
    INITIAL_STATE_ACTION
  );

  const handleReservation = useCallback(
    async ({
      id,
      table_id,
      status,
    }: {
      id: string;
      table_id: string;
      status: string;
    }) => {
      const formData = new FormData();
      Object.entries({ id, table_id, status }).forEach(([Key, value]) => {
        formData.append(Key, value);
      });
      startTransition(() => {
        reservedAction(formData);
      });
    },
    [reservedAction]
  );

  useEffect(() => {
    if (reservedState?.status === "error") {
      toast.error("Update Reservation Failed", {
        description: reservedState.errors?._form?.[0],
      });
    }

    if (reservedState?.status === "success") {
      toast.success("Update Reservation Success");
      refetchOrders();
      refetchTables();
    }
  }, [reservedState, refetchTables, refetchOrders]);

  const reservedActionList = useMemo(
    () => [
      {
        label: (
          <span className="flex items-center gap-2">
            <Link2Icon />
            Process
          </span>
        ),
        action: (id: string, table_id: string) => {
          handleReservation({ id, table_id, status: "process" });
        },
      },
      {
        label: (
          <span className="flex items-center gap-2">
            <Ban className="text-red-500" />
            Cancel
          </span>
        ),
        action: (id: string, table_id: string) => {
          handleReservation({ id, table_id, status: "canceled" });
        },
      },
    ],
    [handleReservation]
  );

  const filteredData = useMemo(() => {
    return (orders?.data || []).map((order, index) => {
      return [
        currentLimit * (currentPage - 1) + index + 1,
        order.order_id,
        order.customer_name,
        (order.tables as unknown as { name: string })?.name || 'Takeaway',

        <div
          key={`status-${order.status}`}
          className={cn("px-2 py-1 rounded-full text-white w-fit capitalize", {
            "bg-lime-600": order.status === "settled",
            "bg-sky-600": order.status === "process",
            "bg-amber-600": order.status === "reserved",
            "bg-red-600": order.status === "canceled",
          })}
        >
          {order.status}
        </div>,
        <DropdownAction
          key={``}
          menu={
            order.status === "reserved" && profile.role !== "kitchen"
              ? reservedActionList.map((item) => ({
                  label: item.label,
                  action: () =>
                    item.action(
                      order.id,
                      (order.tables as unknown as { id: string })?.id
                    ),
                }))
              : [
                  {
                    label: (
                      <Link
                        href={`/order/${order.order_id}`}
                        className="flex items-center gap-2"
                      >
                        <ScrollText />
                        Detail
                      </Link>
                    ),
                    type: "link",
                  },
                ]
          }
        />,
      ];
    });
  }, [orders?.data, currentLimit, currentPage, reservedActionList, profile.role]);

  const [openCreateOrder, setOpenCreateOrder] = useState(false);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, description or status"
            onChange={(e) => handleChangeSearch(e.target.value)}
          />
          {profile.role !== "kitchen" && (
            <DropdownMenu 
              open={openCreateOrder} 
              onOpenChange={setOpenCreateOrder}
            >
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>Create</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="font-bold">
                  Create Order
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              <Dialog>
              <DialogTrigger className="flex items-center gap-2 text-sm p-2 w-full rounded-md hover:bg-muted">
                <Utensils className="size-4"/>
                Dine In
              </DialogTrigger>
              <DialogCreateOrderDineIn tables={tables} closeDialog={() => setOpenCreateOrder(false)} refetchOrders={refetchOrders}/>
            </Dialog>
            <Dialog>
              <DialogTrigger className="flex items-center gap-2 text-sm p-2 w-full rounded-md hover:bg-muted">
                <Package className="size-4"/>
                Takeaway
              </DialogTrigger>
              <DialogCreateOrderTakeaway closeDialog={() => setOpenCreateOrder(false)} refetchOrders={refetchOrders}/>
            </Dialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <DataTable
        header={HEADER_TABLE_ORDER}
        data={filteredData}
        isLoading={isLoading}
        totalPages={totalPages}
        currentPage={currentPage}
        currentLimit={currentLimit}
        onChangePage={handleChangePage}
        onChangeLimit={handleChangeLimit}
      />
    </div>
  );
}
