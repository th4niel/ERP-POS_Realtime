import { Button } from "@/components/ui/button";
import { Menu } from "@/validations/menu-validation";

const Receipt = ({
  order,
  orderMenu,
  orderId,
}: {
  order: {
    customer_name: string;
    tables: { name: string }[];
    status: string;
    created_at: string;
  };
  orderMenu:
    | { menus: Menu; quantity: number; status: string; id: string }[]
    | null
    | undefined;
  orderId: string;
}) => {
  return (
    <div className="relative">
      <Button> Print Receipt</Button>
      <div className="w-full flex flex-col p-8">
        <h4 className="text-2xl font-bold text-center pb-4 border-b border-dashed">
          Th4niel Cafe
        </h4>
        <div className="py-4 border-b border-dashed text-sm space-y-2">
          <p>
            Bill No: <span className="font-bold">{orderId}</span>
          </p>
          <p>
            Table:{' '} <span className="font-bold">{(order?.tables as unknown as { name: string })?.name}</span>
          </p>
          <p>
            Customer: <span className="font-bold">{order?.customer_name}</span>
          </p>
          <p>
            Date: <span className="font-bold">{new Date(order?.created_at).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
