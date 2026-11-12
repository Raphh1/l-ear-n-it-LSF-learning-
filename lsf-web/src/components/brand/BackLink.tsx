import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn btn-ghost btn-sm w-fit -ml-1 px-2">
      <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> {children}
    </Link>
  );
}
