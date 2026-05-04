import HomePage from '@/components/HomePage';

export default async function App({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  return <HomePage page={currentPage} />;
}