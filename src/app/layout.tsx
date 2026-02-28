import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropertyManager — Admin Dashboard",
  description: "Multi-location property management admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var key = 'pm_theme_setting';
                  var stored = localStorage.getItem(key);
                  var setting = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
                  var isDark = setting === 'dark' || (setting === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--brand-600)] focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
