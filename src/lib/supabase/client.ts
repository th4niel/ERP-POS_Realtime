import { environment } from "@/configs/environment";
import { createBrowserClient } from "@supabase/ssr";

//getFromClientSide
export function createClient() {
    const {SUPABASE_URL, SUPABASE_ANON_KEY} = environment;
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}


    //Or you can directly using the template from SUPABASE itself
// import { createBrowserClient } from '@supabase/ssr'
// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   )
// }