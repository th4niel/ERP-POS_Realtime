import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { convertUSD } from "@/lib/utils";

export default function StockReport() {
    const supabase = createClient();

    const { data: stockValue } = useQuery({
        queryKey: ['stock-value'],
        queryFn: async () => {
            const { data } = await supabase
                .from('inventory_items')
                .select('current_stock, unit_price');

            const total = (data || []).reduce((sum, item) => {
                return sum + (item.current_stock * item.unit_price);
            }, 0);

            return total;
        },
    });

    const { data: categoryBreakdown } = useQuery({
        queryKey: ['category-breakdown'],
        queryFn: async () => {
            const { data } = await supabase
                .from('inventory_items')
                .select('category, current_stock, unit_price');

            const categories: Record<string, number> = {};

            (data || []).forEach(item => {
                const value = item.current_stock * item.unit_price;
                categories[item.category] = (categories[item.category] || 0) + value;
            });

            return Object.entries(categories)
                .map(([category, value]) => ({
                    category: category.replace('-', ' '),
                    value
                }))
                .sort((a, b) => b.value - a.value);
        },
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total Stock Value</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                        {convertUSD(stockValue || 0)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stock by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {categoryBreakdown?.map((item) => (
                        <div key={item.category} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{item.category}</span>
                            <span className="font-medium">{convertUSD(item.value)}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}