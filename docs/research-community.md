# Community tab: quick research (3-minute timebox)

Written from general knowledge of Reddit-style forums. No sources were fetched, so treat it as design guidance, not data.

## Layout on a phone
- One column of full-width cards. Each card: a small meta line (post-type tag, nickname, time ago), a bold title (max 2 to 3 lines), an optional 2-line body preview, then an action row.
- Action row: upvote button with the count on the left (thumb reach), comment count, and the product chip if any. Tap anywhere else on the card to open the post.
- Votes: a single upvote (no downvote) keeps a demo simple and kind. Show the count, fill the arrow when voted, update instantly (optimistic).
- Comments: one level of replies is enough on a 390 px screen. Deeper threads get cramped. Indent replies with a left border.
- Sorting: two tabs, **New** (newest first) and **Top** (most votes, ties by newest). Sticky near the top, always visible.
- Filters: horizontally scrolling category chips under the sort tabs. The chip bar scrolls, the page never does.

## Post types that suit the Pink Tax theme
- **Question: is there a cheaper alternative?** (the most useful, and the best hook for the "Check this with PinkCheck" button)
- **I found a swap** (a shopper shares an equivalent product, with an optional price only alongside a source link)
- **Discussion** (general talk: pack sizes, laws, brand changes)

## Trust and safety for a demo
- Label seed posts "Example post" so nobody mistakes them for real people.
- Prices only with an https source URL; never show an unsourced price.
- Render everything as plain text. Cap lengths (title 120, body 1000, comment 500).
- Hedged, fair wording: "may be paying more", and be honest about reverse gaps.
- A "Report" button that hides the post on this device is enough for a demo.

## Why it helps the pitch
A feed that looks alive, plus a tap on **Check this with PinkCheck** that pulls the same result card used in Search, shows that the community and the price engine work together.

## How to use and demo it
**Where:** open `/community` (Device A adds the tab or link). No API key, database or sign in is needed. Posts, votes, comments and hidden posts live in this browser's localStorage only, so a different phone or a private window starts fresh.

**60-second demo path (on a phone):**
1. Open Community. Point at the banner: it is a demo, and the posts are labelled "Example post".
2. Tap **Top**, then the **Razors** chip.
3. Open "Is there a cheaper alternative to the Venus 3 pack?" and tap **Check this with PinkCheck**. The same result card as Search appears inline (score 90, High, with sources).
4. Go back, open the shaving gel post and check it too: it shows the "Good news" reverse gap, which makes the point that the app is fair.
5. Tap **+ New post**, write a title, and try adding a price without a link to show the rule: no price without a source.

**Rules kept:** seed prices and links are copied from `data/demo.json`; user prices show only with an https source link, labelled "shared by the poster, check the source"; Report only hides a post on this device; all text is rendered as plain text.

**Files:** `app/community/**`, `components/community/**`, `lib/community/**`. To reset the demo, clear this site's data (key `pinkcheck.community.v1`).
