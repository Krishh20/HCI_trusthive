"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAppAuth } from "@/hooks/use-app-auth";

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavItem({ href, label }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "font-medium transition-colors",
        active
          ? "text-indigo-600"
          : "text-gray-600 hover:text-indigo-600",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const { loading, user } = useAppAuth();
  const router = useRouter();
  async function handleLogout() {
    await signOut({ redirect: false });
    router.replace("/login");
    router.refresh();
  }
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-indigo-600"
          >
            TrustHive
          </Link>
        </div>

        <nav className="flex items-center justify-center gap-8 flex-1">
          <NavItem href="/" label="Home" />
          <NavItem href="/recommendations/new" label="Recommend" />
        </nav>

        <div className="flex-1 flex justify-end items-center gap-4">
          {!loading && user ? (
            <>
              <Link href="/profile" className="group" aria-label="Profile">
                <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <IconUser className="w-5 h-5" />
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Log out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
