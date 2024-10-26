import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { ReactNode } from "react";

export default function BlogRootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main data-theme className="flex flex-col min-h-svh">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
