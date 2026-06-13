import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function ToolLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
