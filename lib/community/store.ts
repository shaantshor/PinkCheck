'use client';
import { useSyncExternalStore } from 'react';
import { SEED_COMMENTS, SEED_POSTS } from './seed';
import { cleanHttpsUrl, cleanPrice, cleanText, LIMITS } from './sanitize';
import { CATEGORIES, POST_TYPES, type Category, type Comment, type Post, type PostType } from './types';

// A tiny local store: hard-coded SEED posts merged with the visitor's own posts, votes and
// comments, saved only in this browser (localStorage). Every read and write is wrapped in
// try/catch so the page still renders (in memory) when storage is blocked.

const KEY = 'pinkcheck.community.v1';
const MAX_LOCAL_POSTS = 50;
const MAX_LOCAL_COMMENTS = 200;

type Saved = {
  posts: Post[];
  comments: Comment[];
  votes: string[]; // post ids the visitor upvoted
  hidden: string[]; // post ids the visitor reported/hid
  nickname: string | null;
};

export type PostView = Post & {
  score: number; // base votes + visitor's own upvote
  voted: boolean;
  hidden: boolean;
  mine: boolean;
  commentCount: number;
};

export type Snapshot = {
  ready: boolean; // false on the server and during hydration
  storageOk: boolean; // false when localStorage is blocked: posts then live in memory only
  posts: PostView[];
  comments: Comment[];
  nickname: string;
};

const EMPTY: Snapshot = { ready: false, storageOk: true, posts: [], comments: [], nickname: '' };

const ADJ = ['Sunny', 'Quiet', 'Mellow', 'Brave', 'Cosy', 'Gentle', 'Bright', 'Calm', 'Lucky', 'Witty', 'Kind', 'Zesty'];
const ANIMAL = ['Otter', 'Fox', 'Panda', 'Heron', 'Finch', 'Badger', 'Lynx', 'Wren', 'Robin', 'Hare', 'Koala', 'Swan'];
export const randomNickname = () =>
  `${ADJ[Math.floor(Math.random() * ADJ.length)]} ${ANIMAL[Math.floor(Math.random() * ANIMAL.length)]}`;

let saved: Saved = { posts: [], comments: [], votes: [], hidden: [], nickname: null };
let storageOk = true;
let loaded = false;
let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();

// ---- validation of anything read back from storage (it is untrusted) ----
const isType = (t: unknown): t is PostType => POST_TYPES.some((p) => p.id === t);
const isCat = (c: unknown): c is Category => CATEGORIES.includes(c as Category);
const isoOk = (s: unknown): s is string => typeof s === 'string' && Number.isFinite(Date.parse(s));

function readPost(raw: unknown): Post | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const title = cleanText(r.title, LIMITS.title);
  if (typeof r.id !== 'string' || !title || !isType(r.type) || !isoOk(r.created_at)) return null;
  const url = cleanHttpsUrl((r.price as { source_url?: unknown } | undefined)?.source_url);
  const amount = cleanPrice((r.price as { price_gbp?: unknown } | undefined)?.price_gbp);
  const product = cleanText(r.product_name, LIMITS.product);
  return {
    id: r.id.slice(0, 40),
    type: r.type,
    category: isCat(r.category) ? r.category : 'Other',
    title,
    body: cleanText(r.body, LIMITS.body, { multiline: true }),
    product_name: product || undefined,
    price: url && amount ? { price_gbp: amount, source_url: url } : undefined, // never an unsourced price
    author: cleanText(r.author, LIMITS.nickname) || 'Anonymous',
    created_at: r.created_at,
    votes: 0,
    example: false,
  };
}

function readComment(raw: unknown): Comment | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const body = cleanText(r.body, LIMITS.comment, { multiline: true });
  if (typeof r.id !== 'string' || typeof r.post_id !== 'string' || !body || !isoOk(r.created_at)) return null;
  return {
    id: r.id.slice(0, 40),
    post_id: r.post_id.slice(0, 40),
    parent_id: typeof r.parent_id === 'string' ? r.parent_id.slice(0, 40) : null,
    author: cleanText(r.author, LIMITS.nickname) || 'Anonymous',
    body,
    created_at: r.created_at,
    example: false,
  };
}

const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 500) : []);

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const txt = window.localStorage.getItem(KEY);
    if (txt) {
      const j = JSON.parse(txt) as Record<string, unknown>;
      saved = {
        posts: (Array.isArray(j.posts) ? j.posts : []).map(readPost).filter((p): p is Post => !!p),
        comments: (Array.isArray(j.comments) ? j.comments : []).map(readComment).filter((c): c is Comment => !!c),
        votes: strList(j.votes),
        hidden: strList(j.hidden),
        nickname: cleanText(j.nickname, LIMITS.nickname) || null,
      };
    }
    storageOk = true;
  } catch {
    storageOk = false; // blocked or corrupt: carry on in memory
  }
  if (!saved.nickname) {
    saved.nickname = randomNickname();
    persist();
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(saved));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

function build(): Snapshot {
  const votes = new Set(saved.votes);
  const hidden = new Set(saved.hidden);
  const comments = [...SEED_COMMENTS, ...saved.comments];
  const counts = new Map<string, number>();
  comments.forEach((c) => counts.set(c.post_id, (counts.get(c.post_id) ?? 0) + 1));
  const posts: PostView[] = [...SEED_POSTS, ...saved.posts].map((p) => {
    const voted = votes.has(p.id);
    return {
      ...p,
      score: p.votes + (voted ? 1 : 0),
      voted,
      hidden: hidden.has(p.id),
      mine: !p.example,
      commentCount: counts.get(p.id) ?? 0,
    };
  });
  return { ready: true, storageOk, posts, comments, nickname: saved.nickname ?? '' };
}

function commit() {
  persist();
  snapshot = build();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!loaded) {
    load();
    snapshot = build();
  }
  return () => listeners.delete(l);
}

const getSnapshot = () => {
  if (!loaded && typeof window !== 'undefined') {
    load();
    snapshot = build();
  }
  return snapshot;
};
const getServerSnapshot = () => EMPTY;

export function useCommunity(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---- sorting ----
export function sortPosts(posts: PostView[], mode: 'new' | 'top'): PostView[] {
  const byNew = (a: PostView, b: PostView) => Date.parse(b.created_at) - Date.parse(a.created_at);
  return [...posts].sort(mode === 'new' ? byNew : (a, b) => b.score - a.score || byNew(a, b));
}

// ---- actions ----
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export type NewPostInput = {
  type: PostType;
  category: Category;
  title: string;
  body: string;
  product_name?: string;
  price?: string; // typed text, parsed here
  source_url?: string;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function addPost(input: NewPostInput): Result<Post> {
  load();
  const title = cleanText(input.title, LIMITS.title);
  if (title.length < 5) return { ok: false, error: 'Add a title of at least 5 characters.' };
  const body = cleanText(input.body, LIMITS.body, { multiline: true });
  const product = cleanText(input.product_name, LIMITS.product);
  const priceText = (input.price ?? '').trim();
  const urlText = (input.source_url ?? '').trim();
  let price: Post['price'];
  if (priceText || urlText) {
    // A price is only allowed together with an https source link, and the other way round.
    const amount = cleanPrice(priceText);
    const url = cleanHttpsUrl(urlText);
    if (!amount) return { ok: false, error: 'Enter the price as a number, for example 4.99.' };
    if (!url) return { ok: false, error: 'A price needs a source link that starts with https://. Add one or clear the price.' };
    price = { price_gbp: amount, source_url: url };
  }
  const post: Post = {
    id: uid('p'),
    type: isType(input.type) ? input.type : 'discussion',
    category: isCat(input.category) ? input.category : 'Other',
    title,
    body,
    product_name: product || undefined,
    price,
    author: saved.nickname ?? randomNickname(),
    created_at: new Date().toISOString(),
    votes: 0,
    example: false,
  };
  saved.posts = [post, ...saved.posts].slice(0, MAX_LOCAL_POSTS);
  commit();
  return { ok: true, value: post };
}

export function addComment(postId: string, body: string, parentId: string | null): Result<Comment> {
  load();
  const text = cleanText(body, LIMITS.comment, { multiline: true });
  if (!text) return { ok: false, error: 'Write something first.' };
  const comment: Comment = {
    id: uid('c'),
    post_id: postId,
    parent_id: parentId,
    author: saved.nickname ?? randomNickname(),
    body: text,
    created_at: new Date().toISOString(),
    example: false,
  };
  saved.comments = [...saved.comments, comment].slice(-MAX_LOCAL_COMMENTS);
  commit();
  return { ok: true, value: comment };
}

export function toggleVote(postId: string) {
  load();
  saved.votes = saved.votes.includes(postId) ? saved.votes.filter((v) => v !== postId) : [...saved.votes, postId];
  commit();
}

export function hidePost(postId: string) {
  load();
  if (!saved.hidden.includes(postId)) saved.hidden = [...saved.hidden, postId];
  commit();
}

export function unhidePost(postId: string) {
  load();
  saved.hidden = saved.hidden.filter((h) => h !== postId);
  commit();
}

export function unhideAll() {
  load();
  saved.hidden = [];
  commit();
}

export function setNickname(name: string): Result<string> {
  load();
  const n = cleanText(name, LIMITS.nickname);
  if (n.length < 2) return { ok: false, error: 'Nicknames need at least 2 characters.' };
  saved.nickname = n;
  commit();
  return { ok: true, value: n };
}
