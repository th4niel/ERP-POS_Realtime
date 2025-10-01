'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const order_id = searchParams.get('order_id');

    const{mutate} = useMutation({
        mutationKey: ['mutateUpdateStatusOrder'],
        mutationFn: async () => {
            await supabase.from('orders').update({
            status: 'settled',
            })
            .eq('order_id', order_id);
            }
    })

    useEffect(() => {
        mutate();
    }, [supabase, order_id, mutate]);
    return (
        <div className="w-full flex flex-col justify-center items-center gap-4">
            <CheckCircle className="size-25 text-green-500"/>
            <h1 className="text-2xl font-bold">Payment Success</h1>
            <Link href="/order">
                <Button>Back To Order</Button>
            </Link>
        </div>
    );
}