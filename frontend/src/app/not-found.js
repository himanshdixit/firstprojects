import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="card-surface p-8 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The page you requested does not exist.</p>
      <Link href="/" className="mt-4 inline-flex">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
