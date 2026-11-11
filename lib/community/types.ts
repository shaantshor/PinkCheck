// Community demo types. Everything here is plain data; no HTML is ever stored or rendered.

export type PostType = 'question' | 'swap' | 'discussion';
export type Category = 'Razors' | 'Deodorant' | 'Shaving gel' | 'Body wash' | 'Other';

export const CATEGORIES: Category[] = ['Razors', 'Deodorant', 'Shaving gel', 'Body wash', 'Other'];

export const POST_TYPES: { id: PostType; label: string; short: string }[] = [
  { id: 'question', label: 'Question: is there a cheaper alternative?', short: 'Question' },
  { id: 'swap', label: 'I found a swap', short: 'Swap' },
  { id: 'discussion', label: 'Discussion', short: 'Discussion' },
];

/** A price is only ever shown together with an https source link. */
export type PostPrice = {
  price_gbp: number;
  source_url: string; // https only
  retailer?: string;
  checked_on?: string; // ISO date, shown next to the price
};

export type Post = {
  id: string;
  type: PostType;
  category: Category;
  title: string;
  body: string;
  product_name?: string;
  price?: PostPrice;
  author: string; // nickname
  created_at: string; // ISO
  votes: number; // base votes; the visitor's own upvote is added on top
  example: boolean; // true for hard-coded seed posts
};

export type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null; // one level of replies only
  author: string;
  body: string;
  created_at: string;
  example: boolean;
};

export type SortMode = 'new' | 'top';
