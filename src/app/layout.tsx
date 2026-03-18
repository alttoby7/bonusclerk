import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BonusClerk — Track Every Bank Bonus Worth Your Time',
    template: '%s | BonusClerk',
  },
  description:
    'Find and track the best bank account bonuses. Checking, savings, HYSA, and CD offers with verified requirements, expiration dates, and direct deposit hacks.',
  metadataBase: new URL('https://bonusclerk.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BonusClerk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
