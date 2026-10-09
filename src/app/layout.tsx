import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://astraa1.vercel.app'),
  alternates: { canonical: '/' },
  title: 'Astraa — A developer with an eye for the interface.',
  description: 'Astraa, a fullstack developer in Vietnam focused on expressive UI and thoughtful motion. Explore Nét Studio, Garden Dreams, ProZ0, and more.',
  authors: [{ name: 'Astraa', url: 'https://github.com/5erax' }],
  icons: { icon: '/media/avatar-personal.png' },
  openGraph: {
    url: '/',
    title: 'Astraa — A developer with an eye for the interface.',
    description: 'Web apps, mobile experiences, and worlds to explore. Selected work by Astraa.',
    type: 'website',
    locale: 'en_US',
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
