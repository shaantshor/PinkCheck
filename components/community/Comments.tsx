'use client';
import { useState } from 'react';
import { LIMITS } from '@/lib/community/sanitize';
import { addComment } from '@/lib/community/store';
import type { Comment } from '@/lib/community/types';
import { ExampleTag, TimeAgo } from './bits';

function Composer({
  postId,
  parentId,
  autoFocus,
  onDone,
  placeholder,
}: {
  postId: string;
  parentId: string | null;
  autoFocus?: boolean;
  onDone?: () => void;
  placeholder: string;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = addComment(postId, text, parentId);
    if (!r.ok) return setError(r.error);
    setText('');
    setError(null);
    onDone?.();
  };
  return (
    <form onSubmit={submit} className="mt-2">
      <textarea
        value={text}
        autoFocus={autoFocus}
        maxLength={LIMITS.comment}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
      />
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          {text.length}/{LIMITS.comment}
        </span>
        <div className="flex gap-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="press min-h-11 rounded-full bg-gray-100 px-4 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="press min-h-11 rounded-full bg-pink-600 px-5 text-sm font-bold text-white"
          >
            {parentId ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

function Item({ c, reply, children }: { c: Comment; reply?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`anim-fade-up ${reply ? 'ml-4 border-l-2 border-pink-100 pl-3' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{c.author}</span>
        {c.example && <ExampleTag />}
        <TimeAgo iso={c.created_at} />
      </div>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">{c.body}</p>
      {children}
    </div>
  );
}

export default function Comments({ postId, comments }: { postId: string; comments: Comment[] }) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const mine = comments.filter((c) => c.post_id === postId);
  const ids = new Set(mine.map((c) => c.id));
  // Top-level comments, oldest first. Replies to a reply are shown under the top-level comment (one level only).
  const rootOf = (c: Comment): string | null => {
    if (!c.parent_id || !ids.has(c.parent_id)) return null;
    const p = mine.find((x) => x.id === c.parent_id)!;
    return p.parent_id && ids.has(p.parent_id) ? rootOf(p) : p.id;
  };
  const byTime = (a: Comment, b: Comment) => Date.parse(a.created_at) - Date.parse(b.created_at);
  const roots = mine.filter((c) => rootOf(c) === null).sort(byTime);

  return (
    <section className="mt-6" aria-label="Comments">
      <h2 className="text-base font-bold text-gray-900">
        {mine.length === 0 ? 'Comments' : `${mine.length} comment${mine.length === 1 ? '' : 's'}`}
      </h2>
      <Composer postId={postId} parentId={null} placeholder="Add a comment" />

      <div className="mt-4 space-y-4">
        {roots.length === 0 && (
          <p className="rounded-xl border border-dashed border-pink-200 p-4 text-center text-sm text-gray-600">
            No comments yet. Share a tip or ask a follow-up question.
          </p>
        )}
        {roots.map((c) => {
          const replies = mine.filter((r) => rootOf(r) === c.id).sort(byTime);
          return (
            <Item key={c.id} c={c}>
              <button
                type="button"
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="press min-h-11 pr-3 text-xs font-semibold text-pink-700"
              >
                Reply
              </button>
              {replies.length > 0 && (
                <div className="mt-1 space-y-3">
                  {replies.map((r) => (
                    <Item key={r.id} c={r} reply />
                  ))}
                </div>
              )}
              {replyTo === c.id && (
                <div className="ml-4">
                  <Composer
                    postId={postId}
                    parentId={c.id}
                    autoFocus
                    placeholder={`Reply to ${c.author}`}
                    onDone={() => setReplyTo(null)}
                  />
                </div>
              )}
            </Item>
          );
        })}
      </div>
    </section>
  );
}
