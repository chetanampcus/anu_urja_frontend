"use client";

import { usePathname } from "next/navigation";
import Header from "./component/Header";

const HIDDEN_HEADER_PREFIXES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const showHeader = !HIDDEN_HEADER_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  );

  return (
    <>
      {showHeader ? <Header /> : null}
      {children}
    </>
  );
}
