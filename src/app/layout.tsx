import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Scroll Tear Portfolio — local template', description: 'Original Torn Postcard Portfolio by Kedhareswer Naidu.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
