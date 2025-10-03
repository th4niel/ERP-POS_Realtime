import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LowStockAlert() {
    const supabase = createClient();

    const { data: lowStockItems } = useQuery({
        queryKey: ['low-stock-items'],
        queryFn: async () => {
            const { data } = await supabase
                .from('inventory_items')
                .select('id, name, current_stock, minimum_stock, unit');

            return (data || [])
                .filter(item => item.current_stock <= item.minimum_stock)
                .sort((a, b) => a.current_stock - b.current_stock)
                .slice(0, 5);
        },
    });

    if (!lowStockItems || lowStockItems.length === 0) {
        return null;
    }

    return (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-red-500" />
                    <CardTitle className="text-red-600 dark:text-red-400">Low Stock Alert</CardTitle>
                </div>
                <CardDescription>
                    {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {lowStockItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white dark:bg-neutral-900 rounded-md">
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                                Current: {item.current_stock} {item.unit} / Min: {item.minimum_stock} {item.unit}
                            </span>
                        </div>
                    </div>
                ))}
                <Link href="/admin/inventory">
                    <Button variant="outline" className="w-full mt-2">
                        View Inventory
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}