'use client'
import { DarkModeContext } from "@/components/LandingPage/DarkMode";
import Sidebar from './components/sidebar'
import Nav from './components/Nav'
import NavMain from './components/NavMain'
import { ReactNode, useContext } from "react";
import { usePathname } from 'next/navigation'

export default function QuestRootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { isDarkMode } = useContext(DarkModeContext);
  const pathname = usePathname();
  
  // Check if the current path is the welcome page
  const isWelcomePage = pathname === '/questPage/welcome';

  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex h-screen">
        {!isWelcomePage && <Sidebar />}
        <div className={`flex-1 flex flex-col h-full max-h-screen overflow-auto ${isWelcomePage ? 'w-full' : ''}`}>
        {!isWelcomePage && <NavMain/>}
          {isWelcomePage && <Nav/>}
          <main className={`flex-1 px-3 md:px-6 ${isWelcomePage ? 'w-full' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </main>
  );
}