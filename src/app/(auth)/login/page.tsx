import Login from './_components/login';

//doesnt need use client, because meta data immediately using ssr
export const metadata = {
  title: 'th4niel Cafe | Login',
};

export default function LoginPage() {
  return <Login />;
}