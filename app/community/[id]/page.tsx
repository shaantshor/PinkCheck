import type { Metadata } from 'next';
import PostDetail from '@/components/community/PostDetail';
import { SEED_POSTS } from '@/lib/community/seed';

export const metadata: Metadata = {
  title: 'Post | PinkCheck Community',
};

// The example posts are prerendered. Posts written by a visitor live only in that visitor's
// browser, so any other id is rendered on request and looked up on the client.
export function generateStaticParams() {
  return SEED_POSTS.map((p) => ({ id: p.id }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostDetail id={id} />;
}
