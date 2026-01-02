import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "LakeShore Kennels",
    description: "Premium Pet Management Experience",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "LakeShore",
    },
    icons: {
        apple: "/icon-192x192.png",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-premium-dark text-premium-text antialiased selection:bg-premium-gold selection:text-black`}>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                    },
                    function(err) {
                    }
                  );
                });
              }
            `,
                    }}
                />
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </body>
        </html>
    );
}
