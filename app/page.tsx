import { redirect } from 'next/navigation';

/**
 * Root route — sends visitors straight into the experience.
 * Keeps a single, clean entry point: yoursite.com/ -> /envelope
 */
export default function RootPage() {
  redirect('/envelope');
  return null;
}
