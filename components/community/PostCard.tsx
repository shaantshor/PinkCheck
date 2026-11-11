'use client';
import Link from 'next/link';
import { toggleVote, type PostView } from '@/lib/community/store';
import { CommentIcon, ExampleTag, TimeAgo, TypeTag, VoteButton } from './bits';

export default function PostCard({ post, index }: { post: PostView; index: number }) {
  const preview = post.body.length > 140 ? post.body.slice(0, 140).trimEnd() + '…' : post.body;
  return (
    <article
      className="anim-fade-up relative rounded-2xl border border-pink-100 bg-white p-4 shadow-sm"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
        <TypeTag type={post.type} />
        {post.example && <ExampleTag />}
        <span className="min-w-0 truncate">{post.author}</span>
        <span aria-hidden="true">·</span>
        <TimeAgo iso={post.created_at} />
      </div>

      {/* The title link stretches over the whole card (after:inset-0) so any tap opens the post. */}
      <h2 className="mt-2 text-base font-bold leading-snug text-gray-900">
        <Link
          href={`/community/${post.id}`}
          className="break-words after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          {post.title}
        </Link>
      </h2>
      {preview && <p className="mt-1 break-words text-sm text-gray-600">{preview}</p>}
      {post.product_name && (
        <p className="mt-2 inline-block max-w-full truncate rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
          {post.product_name}
        </p>
      )}

      <div className="relative z-10 mt-3 flex items-center gap-2">
        <VoteButton
          voted={post.voted}
          count={post.score}
          onVote={() => toggleVote(post.id)}
          label={post.title}
        />
        <Link
          href={`/community/${post.id}`}
          className="press inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gray-50 px-3 text-sm font-medium text-gray-700"
          aria-label={`${post.commentCount} comments`}
        >
          <CommentIcon />
          {post.commentCount}
        </Link>
        <span className="ml-auto text-xs font-medium text-gray-400">{post.category}</span>
      </div>
    </article>
  );
}
