import type { Metadata } from "next";
import "./globals.css";
import "./temml.css";

export const metadata: Metadata = {
  title: "LaTeX to MathML Converter — Studio",
  description: "A private, offline-first LaTeX to MathML workspace. Convert with TeMMl or KaTeX, inspect, copy and export accessible math.",
  icons: { icon: "/favicon.png", shortcut: "/favicon.ico" },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
