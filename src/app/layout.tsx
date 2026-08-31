import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Source_Serif_4 } from 'next/font/google'
import { ThemeProvider } from '@/components/common/theme-provider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const sourceSerif4 = Source_Serif_4({ subsets: ['latin'], display: 'swap', weight: ['400', '600', '700'] });

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
      <body className={`font-body antialiased ${inter.className} ${sourceSerif4.className}`}>
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
