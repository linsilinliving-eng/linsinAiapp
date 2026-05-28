import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/nprogress/styles.css";
import "./globals.css";
import { ColorSchemeScript, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { NavigationProgress } from "@mantine/nprogress";
import { StoreProvider } from "@/context/StoreContext";
import { SessionProvider } from "next-auth/react";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import ScriptClean from "@/components/ScriptClean";

const theme = createTheme({
  /** Put your mantine theme override here */
});

const sarabun = Sarabun({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "บริษัท ลินศิลิน ลิฟวิ่ง จำกัด",
  description: "Linsirin Living Co., Ltd.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sarabun.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScriptClean />
        <SessionProvider>
          <ThemeWrapper>
            <StoreProvider>
              <NavigationProgress />
              <Notifications />
              <ModalsProvider>{children}</ModalsProvider>
            </StoreProvider>
          </ThemeWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
