import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viaform · Gymnastics Coaching",
  description: "Coach decision-support platform for artistic gymnastics.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const raw=(await cookies()).get("viaform_theme")?.value;
  const theme=raw==="BOLD"||raw==="FOCUS"||raw==="REFINED"?raw:"REFINED";
  return <html lang="en" data-theme={theme}><body>{children}</body></html>;
}
