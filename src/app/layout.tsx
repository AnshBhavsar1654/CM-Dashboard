import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Nunito_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/common/theme-provider';

const nunitoSans = Nunito_Sans({ weight: ['400', '600', '700'], subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Gujarat Outreach Insights',
  description: 'Dashboard for CM Outreach Activities in Gujarat',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""/>
      </head>
      <body className={`font-body antialiased ${nunitoSans.className}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
