'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIMITS } from '@/lib/community/sanitize';
import { addPost, randomNickname, setNickname, useCommunity } from '@/lib/community/store';
import { CATEGORIES, POST_TYPES, type Category, type PostType } from '@/lib/community/types';

const field =
  'mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200';

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-xs ${n >= max ? 'text-pink-700' : 'text-gray-400'}`}>{n}/{max}</span>;
}

export default function NewPostSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { nickname } = useCommunity();
  const [type, setType] = useState<PostType>('question');
  const [category, setCategory] = useState<Category>('Razors');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [nick, setNick] = useState('');
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setNick(nickname);
    setError(null);
    const t = setTimeout(() => titleRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // nickname is read once when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nick.trim() && nick.trim() !== nickname) {
      const r = setNickname(nick);
      if (!r.ok) return setError(r.error);
    }
    const res = addPost({ type, category, title, body, product_name: product, price, source_url: url });
    if (!res.ok) return setError(res.error);
    setTitle('');
    setBody('');
    setProduct('');
    setPrice('');
    setUrl('');
    onClose();
    router.push(`/community/${res.value.id}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="New post">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={submit}
        className="anim-fade-up relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 pb-8 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-gray-900">New post</h2>
          <button
            type="button"
            onClick={onClose}
            className="press min-h-11 rounded-full bg-gray-100 px-4 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
        </div>

        <fieldset className="mt-3">
          <legend className="text-sm font-semibold text-gray-800">What kind of post?</legend>
          <div className="mt-2 space-y-2">
            {POST_TYPES.map((t) => (
              <label
                key={t.id}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                  type === t.id ? 'border-pink-600 bg-pink-50 font-semibold text-pink-800' : 'border-gray-200 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  className="h-4 w-4 accent-pink-600"
                  checked={type === t.id}
                  onChange={() => setType(t.id)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block text-sm font-semibold text-gray-800">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-semibold text-gray-800">
          <span className="flex justify-between">
            Title <Counter n={title.length} max={LIMITS.title} />
          </span>
          <input
            ref={titleRef}
            value={title}
            maxLength={LIMITS.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Is there a cheaper swap for my razors?"
            className={field}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-gray-800">
          <span className="flex justify-between">
            Details (optional) <Counter n={body.length} max={LIMITS.body} />
          </span>
          <textarea
            value={body}
            maxLength={LIMITS.body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="What are you comparing? Pack sizes help."
            className={field}
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-gray-800">
          Product name (optional)
          <input
            value={product}
            maxLength={LIMITS.product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Venus Smooth Sensitive razors 3 pack"
            className={field}
          />
          <span className="mt-1 block text-xs font-normal text-gray-500">
            Readers can then tap &ldquo;Check this with PinkCheck&rdquo;.
          </span>
        </label>

        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="text-sm font-semibold text-gray-800">Add a price (optional)</p>
          <p className="text-xs text-gray-600">A price only shows if you add a source link too (https only).</p>
          <div className="mt-2 flex gap-2">
            <label className="w-28 shrink-0 text-xs font-medium text-gray-700">
              Price (£)
              <input
                value={price}
                inputMode="decimal"
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4.99"
                className={field}
              />
            </label>
            <label className="min-w-0 flex-1 text-xs font-medium text-gray-700">
              Source link
              <input
                value={url}
                inputMode="url"
                autoCapitalize="none"
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className={field}
              />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-800">
            Your nickname
            <div className="flex gap-2">
              <input
                value={nick}
                maxLength={LIMITS.nickname}
                onChange={(e) => setNick(e.target.value)}
                className={field}
              />
              <button
                type="button"
                onClick={() => setNick(randomNickname())}
                className="press mt-1 min-h-12 shrink-0 rounded-xl bg-pink-50 px-3 text-sm font-semibold text-pink-700"
              >
                Shuffle
              </button>
            </div>
          </label>
          <p className="mt-1 text-xs text-gray-500">No sign in. Saved only on this device.</p>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="press mt-5 min-h-12 w-full rounded-full bg-pink-600 text-base font-bold text-white shadow-sm"
        >
          Post
        </button>
      </form>
    </div>
  );
}
