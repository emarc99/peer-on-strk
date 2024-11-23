"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const Nav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getActiveClass = (route: string) =>
    pathname === route ? "border-b-2 border-black " : "hover:text-black";

  return (
    <nav className="flex justify-between items-center p-4 w-full">
      {/* Logo that toggles sidebar */}
      <div className="lg:hidden flex">
        <Image
          src="/images/LogoBlack.svg"
          height={30}
          width={30}
          alt="Logo"
          className="cursor-pointer"
          onClick={toggleSidebar} 
        />
      </div>

      <div className="hidden lg:flex gap-6 items-center ml-auto">
        <Link
          href="/explore"
          className={`text-black ${getActiveClass("/explore")}`}
        >
          Explore
        </Link>

        <Link
          href="/leaderboard"
          className={`text-black ${getActiveClass("/leaderboard")}`}
        >
          Leaderboard
        </Link>
        <button className="flex items-center border border-black gap-2 px-[20px] py-[4px] text-black rounded-full">
          <Image
            src="/images/twitterx.png"
            alt="X Icon"
            height={15}
            width={15}
            className="inline"
          />
          Duchekelvin
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center gap-4">
        <button onClick={toggleMobileMenu}>
          <Image
            src="/images/hamburger.png"
            height={30}
            width={30}
            alt="Mobile Menu"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 w-[90%] bg-white text-black z-50 flex flex-col gap-4 rounded-md p-4 shadow-lg">
          <button
            onClick={toggleMobileMenu}
            className="self-end mb-4 text-black hover:text-gray-600"
          >
            <X size={24} />
          </button>

          <button className="flex items-center w-36 justify-center border border-black gap-2  py-[4px] text-black rounded-full">
            <Image
              src="/images/twitterx.png"
              alt="X Icon"
              height={15}
              width={15}
              className="inline"
            />
            Duchekelvin
          </button>

          <Link href="/leaderboard" className={`text-base  px-2`}>
            Leaderboard
          </Link>
          <Link
            href="/explore"
            className={`text-base ${getActiveClass("/explore")} px-2`}
          >
            Explore
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Nav;

