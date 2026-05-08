import { getTravelInfo } from '@/lib/queries';
import TravelInfoClient from '@/components/TravelInfoClient';

export default async function TravelInfoPage() {
  const travelInfoData = await getTravelInfo();
  return <TravelInfoClient travelInfoData={travelInfoData} />;
}