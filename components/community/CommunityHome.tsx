'use client';
import { useState } from 'react';
import Feed from './Feed';
import NewPostSheet from './NewPostSheet';

export default function CommunityHome() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Feed onNewPost={() => setOpen(true)} />
      <NewPostSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
