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

const OG_TITLE = 'Welcome to RentWise'
const OG_DESCRIPTION =
  'RentWise is the smarter way to be a tenant. Pay rent instantly, get notified the moment an invoice drops, log and track maintenance requests in real time, review your lease and payment history anytime, and manage your entire home — all from one beautifully simple dashboard. Available on web and Android.'

export const metadata: Metadata = {
  title: {
    default: 'RentWise — Tenant Portal',
    template: '%s | RentWise',
  },
  description: OG_DESCRIPTION,
  applicationName: 'RentWise',
  keywords: ['rent', 'tenant portal', 'pay rent online', 'property management', 'maintenance requests', 'lease management', 'invoices', 'rental app'],
  authors: [{ name: 'RentWise' }],
  creator: 'RentWise',
  metadataBase: new URL('https://propertyapi.rohodev.com'),
  openGraph: {
    type: 'website',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    siteName: 'RentWise',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
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
