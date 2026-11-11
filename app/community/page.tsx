import type { Metadata } from 'next';
import CommunityHome from '@/components/community/CommunityHome';

export const metadata: Metadata = {
  title: 'Community | PinkCheck',
  description: 'Demo community: swap tips and Pink Tax discussion.',
};

export default function CommunityPage() {
  return <CommunityHome />;
}
