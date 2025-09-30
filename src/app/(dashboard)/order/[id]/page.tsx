import Script from "next/script";
import DetailOrder from "./_components/detail-order";
import { environment } from "@/configs/environment";

export const metadata = {
 title: 'th4niel Cafe | Detail Order',
 
};

declare global {
    interface Window{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap: any;
    }
}

export default async function DetailOrderPage({params}: {params: Promise<{id:string}>}) {
    const {id} = await params;
  return (
    <div className="w-full">
      <Script 
        src={`${environment.MIDTRANS_API_URL}/snap/snap.js`} 
        data-client-key={environment.MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <DetailOrder id={id}/>
    </div>
  );
}
