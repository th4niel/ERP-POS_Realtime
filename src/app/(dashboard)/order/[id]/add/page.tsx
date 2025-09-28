import AddOrderItem from "./_components/add-order-item";

export const metadata = {
 title: 'th4niel Cafe | Add Order Item',
 
};

export default async function AddOrderItemPage({params}: {params: Promise<{id:string}>}) {
    const {id} = await params;
  return <AddOrderItem id={id}/>;
}
