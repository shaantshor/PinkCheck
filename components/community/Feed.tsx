'use client';
import { useMemo, useState } from 'react';
import { sortPosts, unhideAll, useCommunity } from '@/lib/community/store';
import { CATEGORIES, type Category, type SortMode } from '@/lib/community/types';
import PostCard from './PostCard';

export const DEMO_BANNER = 'Demo community: example posts, and your posts are saved only on this device';

function Skeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse motion-reduce:animate-none rounded-2xl border border-pink-100 p-4">
          <div className="h-3 w-1/3 rounded bg-pink-100" />
          <div className="mt-3 h-4 w-5/6 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
          <div className="mt-4 h-9 w-24 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export default function Feed({ onNewPost }: { onNewPost: () => void }) {
  const { ready, storageOk, posts } = useCommunity();
  const [sort, setSort] = useState<SortMode>('new');
  const [cat, setCat] = useState<Category | 'All'>('All');

  const visible = useMemo(() => {
    const shown = posts.filter((p) => !p.hidden && (cat === 'All' || p.category === cat));
    return sortPosts(shown, sort);
  }, [posts, sort, cat]);
  const hiddenCount = posts.filter((p) => p.hidden).length;

  return (
    <div className="px-4 pt-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Community</h1>
          <p className="text-sm text-gray-600">Swap tips and Pink Tax talk.</p>
        </div>
        <button
          type="button"
          onClick={onNewPost}
          className="press min-h-11 shrink-0 rounded-full bg-pink-600 px-4 text-sm font-bold text-white shadow-sm"
        >
          + New post
        </button>
      </header>

      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
        {DEMO_BANNER}
      </p>
      {!storageOk && (
        <p className="mt-2 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-700" role="status">
          Your browser is blocking storage, so new posts will disappear when you leave this page. Try a normal
          (not private) window to keep them.
        </p>
      )}

      {/* Sort tabs */}
      <div className="mt-4 flex gap-2" role="tablist" aria-label="Sort posts">
        {(['new', 'top'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={sort === m}
            onClick={() => setSort(m)}
            className={`press min-h-11 flex-1 rounded-full text-sm font-semibold ${
              sort === m ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-700'
            }`}
          >
            {m === 'new' ? 'New' : 'Top'}
          </button>
        ))}
      </div>

      {/* Category chips: this row scrolls sideways, the page does not */}
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by category">
        {(['All', ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={`press min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium ${
              cat === c ? 'border-pink-600 bg-pink-100 text-pink-800' : 'border-gray-200 bg-white text-gray-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        {!ready ? (
          <Skeleton />
        ) : visible.length === 0 ? (
          <div className="anim-fade-up rounded-2xl border border-dashed border-pink-200 p-6 text-center">
            <p className="font-semibold text-gray-900">
              {cat === 'All' ? 'No posts yet.' : `No posts in ${cat} yet.`}
            </p>
            <p className="mt-1 text-sm text-gray-600">Be the first to ask a question or share a swap.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onNewPost}
                className="press min-h-11 rounded-full bg-pink-600 px-5 text-sm font-bold text-white"
              >
                Write a post
              </button>
              {cat !== 'All' && (
                <button
                  type="button"
                  onClick={() => setCat('All')}
                  className="press min-h-11 rounded-full bg-gray-100 px-5 text-sm font-medium text-gray-700"
                >
                  Show all posts
                </button>
              )}
            </div>
          </div>
        ) : (
          visible.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
        )}
      </div>

      {ready && hiddenCount > 0 && (
        <p className="mt-4 text-center text-xs text-gray-500">
          You hid {hiddenCount} post{hiddenCount === 1 ? '' : 's'} on this device.{' '}
          <button type="button" onClick={unhideAll} className="min-h-11 px-2 font-medium text-pink-600 underline">
            Show again
          </button>
        </p>
      )}
    </div>
  );
}
