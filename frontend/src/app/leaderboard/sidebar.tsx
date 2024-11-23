import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";

const Sidebar = ({ isVisible, toggleSidebar }: { isVisible: boolean; toggleSidebar: () => void }) => {
  const [activeLink, setActiveLink] = useState<string>("");

  // Function to handle setting the active link
  const handleLinkClick = (linkName: string) => {
    setActiveLink(linkName);
  };

  return (
    <div
      className={`bg-black lg:w-[15%] h-screen rounded-r-[2.5rem] py-8 lg:flex flex-col lg:sticky top-0 transition-transform duration-300 ${
        isVisible ? "block absolute left-0" : "hidden"
      }`}
    >
      {/* Cancel Button */}
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 lg:hidden"
        onClick={toggleSidebar}
      >
        <X size={24} />
      </button>

      <Image
        className="mx-[30%] cursor-pointer"
        src="/images/LogoWhite.svg"
        width={50}
        height={20}
        alt="Logo"
        onClick={toggleSidebar}
      />
      <div className="mt-10 px-3 flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-10 flex-grow ">
          <Link
            href="#"
            className={`flex w-full gap-3 items-center  py-1   cursor-pointer font-['Raleway'] ${
              activeLink === "Market" ? "border border-white rounded-md  " : ""
            }`}
            onClick={() => handleLinkClick("Market")}
          >
            <Image
              src="/images/LogoWhite.svg"
              width={20}
              height={20}
              alt="Market"
              className="ml-8"
            />
            <p>Market</p>
          </Link>
          <Link
            href="#"
            className={`flex w-full gap-3 items-center py-1 cursor-pointer font-['Raleway'] ${
              activeLink === "Liquidity" ? "border rounded-md p-auto border-white" : ""
            }`}
            onClick={() => handleLinkClick("Liquidity")}
          >
            <Image
              src="/images/liquidity.png"
              width={20}
              height={20}
              alt="Liquidity"
                className="ml-8"
            />
            <p>Liquidity</p>
          </Link>

          <Link
            href="#"
            className={`flex gap-3 items-center py-1 w-full   cursor-pointer font-['Raleway'] ${
              activeLink === "Swap" ? " border border-white rounded-md" : ""
            }`}
            onClick={() => handleLinkClick("Swap")}
          >
            <Image
              src="/images/swapicon.png"
              width={20}
              height={20}
              alt="Liquidity"
                className="ml-8"
            />
            <p>Swap</p>
          </Link>

          <Link
            href="#"
            className={`flex gap-3 items-center py-1 cursor-pointer font-['Raleway'] ${
              activeLink === "Portfolio" ? "border rounded-md border-white" : ""
            }`}
            onClick={() => handleLinkClick("Portfolio")}
          >
            <Image
              src="/images/portfolio.png"
              width={20}
              height={20}
              alt="Liquidity"
                className="ml-8"
            />
            <p>Portfolio</p>
          </Link>

          <Link
            href="#"
            type="disabled"
            className={`flex gap-3 items-center py-1 cursor-pointer font-['Raleway'] ${
              activeLink === "AssetManager" ? "border p-auto rounded-md border-white" : ""
            }`}
            onClick={() => handleLinkClick("AssetManager")}
          >
            <Image
              src="/images/asset.png"
              width={15}
              height={15}
              alt="Business"
                className="ml-8 "
            />
            <p className="mr-4">Asset manager</p>
          </Link>

          <Link
            href="#"
            type="disabled"
            className={`flex gap-3 items-center cursor-pointer font-['Raleway'] mt-16 ${
              activeLink === "Settings" ? "border border-white rounded-md" : ""
            }`}
            onClick={() => handleLinkClick("Settings")}
          >
            <Image
              src="/images/settings.png"
              width={15}
              height={15}
              alt="Business"
              className="ml-8"
            />
            <p>Settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;









