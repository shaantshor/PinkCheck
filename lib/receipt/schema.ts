import { z } from 'zod';

const num = z.preprocess((v) => (typeof v === 'string' && v.trim() !== '' ? Number(v.replace(/[£,\s]/g, '')) : v), z.number());

export const ReceiptItemZ = z
  .object({
    raw_text: z.string().default(''),
    name: z.string().default(''),
    qty: num.pipe(z.number().positive()).catch(1),
    line_total: num.nullable().catch(null),
    gender_target: z.enum(['female', 'male', 'neutral', 'unknown']).catch('unknown'),
    unreadable: z.boolean().catch(false),
  })
  .transform((it) => {
    // Never guess: an unreadable line, or one without a price, is flagged and has no price.
    const unreadable = it.unreadable || it.line_total == null;
    return {
      ...it,
      name: it.name.trim() || it.raw_text.trim(),
      line_total: unreadable ? null : it.line_total,
      unreadable,
    };
  });

export const ReceiptZ = z.object({
  store: z.string().nullable().catch(null),
  items: z.array(ReceiptItemZ),
  receipt_total: num.nullable().catch(null),
});

export type ReceiptRead = z.infer<typeof ReceiptZ>;
