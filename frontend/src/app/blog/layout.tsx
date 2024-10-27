"use client"
import { DarkModeContext } from "@/components/LandingPage/DarkMode";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { ReactNode, useContext } from "react";

export default function BlogRootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <main className={`flex flex-col min-h-svh ${isDarkMode ? "bg-[#0d101711] text-white" : "bg-[#F5F5F5] text-black"} w-full`}>
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
