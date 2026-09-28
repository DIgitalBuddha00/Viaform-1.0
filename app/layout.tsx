import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { resolveAppearanceTheme } from "@/app/lib/appearance";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viaform · Gymnastics Coaching",
  description: "Coach decision-support platform for artistic gymnastics.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme=resolveAppearanceTheme((await cookies()).get("viaform_theme")?.value);
  return <html lang="en" data-theme={theme}><body>{children}</body></html>;
}
