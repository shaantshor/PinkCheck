'use client';
import Link from 'next/link';
import { hidePost, toggleVote, unhidePost, useCommunity } from '@/lib/community/store';
import { ExampleTag, PriceLine, TimeAgo, TypeTag, VoteButton } from './bits';
import CheckWithPinkCheck from './CheckWithPinkCheck';
import Comments from './Comments';
import { DEMO_BANNER } from './Feed';

function Back() {
  return (
    <Link href="/community" className="press inline-flex min-h-11 items-center text-sm font-semibold text-pink-700">
      ← Community
    </Link>
  );
}

export default function PostDetail({ id }: { id: string }) {
  const { ready, posts, comments } = useCommunity();
  const post = posts.find((p) => p.id === id);

  if (!ready) {
    return (
      <div className="px-4 pt-4" aria-busy="true">
        <Back />
        <div className="mt-3 animate-pulse motion-reduce:animate-none space-y-3" aria-hidden="true">
          <div className="h-3 w-1/3 rounded bg-pink-100" />
          <div className="h-6 w-5/6 rounded bg-gray-200" />
          <div className="h-20 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-4 pt-4">
        <Back />
        <div className="anim-fade-up mt-6 rounded-2xl border border-dashed border-pink-200 p-6 text-center">
          <p className="font-semibold text-gray-900">We can&apos;t find that post.</p>
          <p className="mt-1 text-sm text-gray-600">
            Posts you write are saved only on the device you wrote them on, so this link may not work elsewhere.
          </p>
          <Link
            href="/community"
            className="press mt-4 inline-flex min-h-11 items-center rounded-full bg-pink-600 px-5 text-sm font-bold text-white"
          >
            Back to the feed
          </Link>
        </div>
      </div>
    );
  }

  if (post.hidden) {
    return (
      <div className="px-4 pt-4">
        <Back />
        <div className="anim-fade-up mt-6 rounded-2xl bg-gray-50 p-6 text-center">
          <p className="font-semibold text-gray-900">You hid this post on this device.</p>
          <p className="mt-1 text-sm text-gray-600">It stays hidden in your feed. Nobody else is affected.</p>
          <button
            type="button"
            onClick={() => unhidePost(post.id)}
            className="press mt-4 min-h-11 rounded-full bg-pink-600 px-5 text-sm font-bold text-white"
          >
            Show it again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <Back />
      <p className="mt-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
        {DEMO_BANNER}
      </p>

      <article className="anim-fade-up mt-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <TypeTag type={post.type} />
          {post.example && <ExampleTag />}
          <span>{post.author}</span>
          <span aria-hidden="true">·</span>
          <TimeAgo iso={post.created_at} />
          <span className="ml-auto text-gray-400">{post.category}</span>
        </div>
        <h1 className="mt-2 break-words text-xl font-extrabold leading-snug text-gray-900">{post.title}</h1>
        {post.body && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">{post.body}</p>}
        {post.price && <PriceLine price={post.price} product={post.product_name} />}

        <div className="mt-3 flex items-center gap-2">
          <VoteButton voted={post.voted} count={post.score} onVote={() => toggleVote(post.id)} label={post.title} />
          <button
            type="button"
            onClick={() => hidePost(post.id)}
            className="press ml-auto min-h-11 rounded-full px-3 text-xs font-medium text-gray-500"
            aria-label="Report this post (hides it on this device)"
          >
            Report
          </button>
        </div>
      </article>

      {post.product_name && <CheckWithPinkCheck key={post.id} productName={post.product_name} />}

      <Comments postId={post.id} comments={comments} />
    </div>
  );
}
