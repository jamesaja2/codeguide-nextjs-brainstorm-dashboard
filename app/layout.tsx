import type { Metadata } from "next";
import { Geist, Geist_Mono, Parkinsans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { UserAgentProvider } from "@/contexts/UserAgentContext";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brainstorm Dashboard",
  description:
    "Next.js trading dashboard with news feed, stock transactions, and portfolio management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${parkinsans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserAgentProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>{children}</main>
            </div>
          </UserAgentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
