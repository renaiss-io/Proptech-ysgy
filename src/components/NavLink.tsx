"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        active ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
