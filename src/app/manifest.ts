import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RentWise — Tenant Portal',
    short_name: 'RentWise',
    description: 'Pay rent, track maintenance, and manage your home from one beautiful dashboard.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f5f2',
    theme_color: '#c2703e',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
