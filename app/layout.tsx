import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Vanguard Kennel Systems",
    description: "Premium Pet Management Experience",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Vanguard",
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
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </body>
        </html>
    );
}
