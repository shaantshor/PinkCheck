import demoRaw from '@/data/demo.json';
import type { Product } from '@/lib/types';
import type { Comment, Post, PostPrice } from './types';

// Hard-coded EXAMPLE posts. Every one is labelled "Example post" in the UI.
// No real people. No invented prices: any price shown is looked up from data/demo.json by
// product name, so the price and source URL are copied exactly (never retyped here).

type DemoPair = { products: Product[] };
const demoProducts = (demoRaw as unknown as DemoPair[]).flatMap((p) => p.products);

const N = {
  venus3: 'Venus Smooth Sensitive Disposable Razors 3 pack',
  blue3x12: 'Gillette Blue3 Disposable Razors x12',
  venusX4: 'Venus Simply Disposable Razors x4',
  doveDeo: 'Dove Advanced Care Original Anti-Perspirant Aerosol 150 ml',
  satinGel: 'Venus Satin Care Shaving Gel Sensitive Aloe Vera Glide 200ml',
  doveWash: 'Dove Nourishing Body Wash 450 ml',
} as const;

/** Price + source copied from data/demo.json. Returns undefined if the product is missing or has no price/source. */
function demoPrice(name: string): PostPrice | undefined {
  const p = demoProducts.find((d) => d.name === name);
  if (!p || p.price_gbp == null || !p.source_url) return undefined;
  return {
    price_gbp: p.price_gbp,
    source_url: p.source_url,
    retailer: p.retailer || undefined,
    checked_on: p.checked_on || undefined,
  };
}

// Offsets are relative to first use, so the feed always looks recent in a live demo.
const BASE = Date.now();
const ago = (minutes: number) => new Date(BASE - minutes * 60_000).toISOString();

export const SEED_POSTS: Post[] = [
  {
    id: 'ex-1',
    type: 'question',
    category: 'Razors',
    title: 'Is there a cheaper alternative to the Venus 3 pack?',
    body:
      'I buy the Venus Smooth Sensitive 3 pack every few months and wondered whether I may be paying more per razor than I need to. Has anyone compared it with a bigger multipack?',
    product_name: N.venus3,
    author: 'Sunny Otter',
    created_at: ago(35),
    votes: 31,
    example: true,
  },
  {
    id: 'ex-2',
    type: 'swap',
    category: 'Razors',
    title: 'Swapped to a multipack of three blade disposables',
    body:
      'Same brand, same three blades, but a 12 pack. The pack sizes are very different, so compare per razor and not per pack. Price and link below are from the demo data.',
    product_name: N.blue3x12,
    price: demoPrice(N.blue3x12),
    author: 'Quiet Fox',
    created_at: ago(180),
    votes: 46,
    example: true,
  },
  {
    id: 'ex-3',
    type: 'question',
    category: 'Deodorant',
    title: 'Dove deodorant: does the men’s one cost less?',
    body:
      'I always buy the women’s Dove spray. Is the men’s version actually cheaper, or am I just assuming it is?',
    product_name: N.doveDeo,
    author: 'Mellow Panda',
    created_at: ago(60 * 7),
    votes: 18,
    example: true,
  },
  {
    id: 'ex-4',
    type: 'discussion',
    category: 'Shaving gel',
    title: 'Good news for once: a women’s shaving gel that was cheaper',
    body:
      'Pink Tax stories are usually about paying more, but it goes the other way sometimes. Here the women’s gel came out cheaper per ml than the men’s one, so it is worth checking both before you assume.',
    product_name: N.satinGel,
    price: demoPrice(N.satinGel),
    author: 'Brave Heron',
    created_at: ago(60 * 26),
    votes: 27,
    example: true,
  },
  {
    id: 'ex-5',
    type: 'swap',
    category: 'Razors',
    title: 'Same size 4 pack: the women’s one was slightly cheaper',
    body:
      'I compared like for like, 4 razors against 4 razors. The Venus pack was a little cheaper per razor at the time. It was on offer, so the gap may change when the offer ends.',
    product_name: N.venusX4,
    price: demoPrice(N.venusX4),
    author: 'Cosy Finch',
    created_at: ago(60 * 52),
    votes: 14,
    example: true,
  },
  {
    id: 'ex-6',
    type: 'question',
    category: 'Body wash',
    title: 'Body wash vs a men’s 3-in-1: is it a fair comparison?',
    body:
      'The women’s bottle is a different size from the men’s 3-in-1, and the men’s one is also meant for hair and face. How do you compare these fairly?',
    product_name: N.doveWash,
    price: demoPrice(N.doveWash),
    author: 'Calm Badger',
    created_at: ago(60 * 80),
    votes: 9,
    example: true,
  },
  {
    id: 'ex-7',
    type: 'discussion',
    category: 'Razors',
    title: 'Pack sizes explain a lot of "pink tax" gaps. How do you compare?',
    body:
      'One 2023 study (Moshary, Tuchman and Bhatia, Marketing Science) found no systematic premium once similar ingredients were compared, and said many gaps come from product differences and pack sizes. That is why I look at the price per unit, not per pack. What do you do?',
    author: 'Gentle Lynx',
    created_at: ago(60 * 110),
    votes: 22,
    example: true,
  },
  {
    id: 'ex-8',
    type: 'discussion',
    category: 'Other',
    title: 'Is gender-based pricing even legal?',
    body:
      'It depends where you live. New York (2020) and California (2023) ban gender-based pricing of substantially similar goods. In the UK it is not illegal, but public pressure has led some shops to change prices. Anyone know of other places?',
    author: 'Bright Wren',
    created_at: ago(60 * 150),
    votes: 35,
    example: true,
  },
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'exc-1',
    post_id: 'ex-1',
    parent_id: null,
    author: 'Quiet Fox',
    body: 'A men’s multipack from the same brand worked for me. Compare the price per razor, not the pack price.',
    created_at: ago(20),
    example: true,
  },
  {
    id: 'exc-2',
    post_id: 'ex-1',
    parent_id: 'exc-1',
    author: 'Sunny Otter',
    body: 'Thanks, that makes sense. I will check the per razor price before buying next time.',
    created_at: ago(12),
    example: true,
  },
  {
    id: 'exc-3',
    post_id: 'ex-1',
    parent_id: null,
    author: 'Mellow Panda',
    body: 'Try the Check this with PinkCheck button above. It does the per razor maths for you and shows the source.',
    created_at: ago(8),
    example: true,
  },
  {
    id: 'exc-4',
    post_id: 'ex-2',
    parent_id: null,
    author: 'Cosy Finch',
    body: 'Handy. Thanks for sharing the source link too.',
    created_at: ago(120),
    example: true,
  },
  {
    id: 'exc-5',
    post_id: 'ex-3',
    parent_id: null,
    author: 'Brave Heron',
    body: 'I checked this one: same size, same brand, and the prices looked the same, so you may not be paying extra here.',
    created_at: ago(60 * 5),
    example: true,
  },
  {
    id: 'exc-6',
    post_id: 'ex-4',
    parent_id: null,
    author: 'Gentle Lynx',
    body: 'Good to see the honest version. Not every women’s product costs more.',
    created_at: ago(60 * 20),
    example: true,
  },
  {
    id: 'exc-7',
    post_id: 'ex-7',
    parent_id: null,
    author: 'Calm Badger',
    body: 'Same here. I also check that the two products do the same job, otherwise the comparison is not fair.',
    created_at: ago(60 * 100),
    example: true,
  },
  {
    id: 'exc-8',
    post_id: 'ex-8',
    parent_id: null,
    author: 'Sunny Otter',
    body: 'Useful summary. It would be good to see a source for each place.',
    created_at: ago(60 * 140),
    example: true,
  },
];
