import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'RentWise — Tenant Portal',
    template: '%s | RentWise',
  },
  description: 'Pay rent, track maintenance requests, and manage your home — all from one beautiful dashboard.',
  applicationName: 'RentWise',
  keywords: ['rent', 'tenant portal', 'property management', 'maintenance', 'invoices', 'lease'],
  authors: [{ name: 'RentWise' }],
  creator: 'RentWise',
  metadataBase: new URL('https://propertyapi.rohodev.com'),
  openGraph: {
    type: 'website',
    title: 'RentWise — Tenant Portal',
    description: 'Pay rent, track maintenance requests, and manage your home — all from one beautiful dashboard.',
    siteName: 'RentWise',
  },
  twitter: {
    card: 'summary',
    title: 'RentWise — Tenant Portal',
    description: 'Pay rent, track maintenance requests, and manage your home — all from one beautiful dashboard.',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#c2703e',
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
        className={`${plusJakarta.variable} ${outfit.variable} ${jetBrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-[var(--brand-600)] focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
