import type { Metadata } from "next";
import "./globals.css";
import Providers from "./provider";

export const metadata: Metadata = {
  title: "Stock Dashboard",
  description: "Real-time stocks Data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
