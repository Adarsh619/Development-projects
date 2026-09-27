import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Prompt Lab — AI workspace", description: "A focused workspace for testing prompts and models." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
