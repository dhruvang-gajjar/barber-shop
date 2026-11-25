import type { Metadata } from "next";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";

export const metadata: Metadata = {
  title: "THE BARBER SHOP",
  description: "Barber Shop Queue Management and WhatsApp Hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
