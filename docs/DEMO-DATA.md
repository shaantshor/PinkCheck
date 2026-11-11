# Adding to data/demo.json (for teammates)

Rules (CLAUDE.md rule 1): real prices only, read from the retailer product page, never from memory.
- Each pair has 2 products. products[0] is the women's-marketed one (the app treats it as the target), products[1] the cheaper-looking equivalent (men's, unisex or own brand).
- Fill: name, brand, retailer, price_gbp, quantity, unit ("ml", "g", "blade", "item"), gender_target, source "demo", source_url (the product page), checked_on (YYYY-MM-DD).
- If a price is a temporary offer, say so in the pair's explanation.
- Leave a field empty or null if you did not see it. A pair with any missing price is skipped, never guessed.
- Empty slots ready for you: deodorant-2, shaving-gel-2, body-wash-2. You can also add new pairs.
- Before pushing: `git pull --rebase`, then `npm run build`. Only edit data/demo.json to avoid conflicts.
