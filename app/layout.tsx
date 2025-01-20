import "./globals.css";
import { Inter } from "next/font/google";

import { ThemeContextProvider } from "@/context/ThemeContext";
import ThemeProvider from "@/provider/ThemeProvider";
import AuthProvider from "@/provider/authProvider";
import Navbar from "@/components/navbar/Navbar";
import useGoogleApi from "@/hooks/useGoogleApi";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "WhiteCarrot",
  description: "Calendar app for managing your events",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <div className="px-8 md:px-20 bg-[var(--bg)] text-[var(--textColor)] h-screen w-full">
                <Navbar />

                {children}
              </div>
              {/* <Footer /> */}
            </ThemeProvider>
          </ThemeContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
