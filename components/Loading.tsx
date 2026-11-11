export default function Loading({ text = 'Finding cheaper equivalents…' }: { text?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-2xl bg-pink-50 p-4 text-pink-700">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-pink-300 border-t-pink-600" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
