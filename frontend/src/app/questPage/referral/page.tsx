// app/QuestPage/page.tsx
'use client'
// import { ChevronDown } from "lucide-react";
import { useContext, useState } from 'react'
import { DarkModeContext } from "../components/DarkMode";
import Task from '../components/Tasks'
import Image from "next/image";
interface Quest {
  id: number;
  title: string;
  description: string;
  reward: string;
  status: 'available' | 'in_progress' | 'completed';
}

export default function Referral() {
  const { isDarkMode, toggleDark } = useContext(DarkModeContext);


  const [isOpen, setIsOpen] = useState<Boolean>(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <section className="md:p-4 flex flex-col gap-6">
      <div className='flex flex-col gap-2'>
        <h1 className={`font-[600] xl:text-[3.1rem] lg:text-[2.9rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>Referral</h1>

        <p className={` xl:max-w-[70%] opacity-60 md:w-[80%] md:text-lg text-[0.6rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Invite friends and earn 10% of friend’s points</p>

      </div>
      <div className='flex flex-col gap-6 pt-[5.2rem]'>
        <div className="bg-[#F5F5F5] rounded-2xl border-2 p-[1rem]">
          <div className="flex justify-between px-2 items-center">
            <p className="text-gray-600">Total participants</p>
            <h1 className={`md:text-lg font-light text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
              20,465,485 players
            </h1>
          </div>
        </div>



        <div className="winner my-4 bg-white rounded-2xl border-2 p-[1rem]">
          <div className="flex justify-between px-2 items-center">
            <div className='flex flex-row gap-2'>
              <Image
                src="/images/LogoBlack.svg"
                height={50}
                width={50}
                alt="Logo"
                className="cursor-pointer p-2 bg-[#F5F5F5] rounded-lg "
              />
              <div className='flex flex-col gap-1'>
                <p className={`md:text-lg  text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Duchekelvin</p>
                <h1 className={`md:text-sm font-light text-[0.3rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
                  #20,035
                </h1>
              </div>

            </div>
            <h1 className={`md:text-lg font-light text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
              2,564,466 xps
            </h1>
          </div>
        </div>

        <div className='grid-cols-1 border-2 py-6 rounded-2xl'>
          <div className="rounded-2xl  p-[1rem]">
            <div className="flex justify-between px-2 items-center">
              <div className='flex flex-row gap-2'>
                <Image
                  src="/images/LogoBlack.svg"
                  height={50}
                  width={50}
                  alt="Logo"
                  className="cursor-pointer p-2 bg-white  rounded-lg "
                />
                <div className='flex flex-col gap-1'>
                <p className={`md:text-lg  text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Duchekelvin</p>
                <Image
                  src="/images/questGold.svg"
                  height={20}
                  width={24}
                  alt="Logo"
                  className="cursor-pointer  "
                />

                </div>

              </div>
              <h1 className={`md:text-lg font-light text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
                2,564,466 xps
              </h1>
            </div>
            </div>
          <div className='border-2  w-full'></div>
          <div className="rounded-2xl  p-[1rem]">
            <div className="flex justify-between px-2 items-center">
              <div className='flex flex-row gap-2'>
                <Image
                  src="/images/LogoBlack.svg"
                  height={50}
                  width={50}
                  alt="Logo"
                  className="cursor-pointer p-2 bg-white  rounded-lg "
                />
                <div className='flex flex-col gap-1'>
                <p className={`md:text-lg  text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Duchekelvin</p>
                <Image
                  src="/images/questsilver.svg"
                  height={20}
                  width={24}
                  alt="Logo"
                  className="cursor-pointer  "
                />

                </div>

              </div>
              <h1 className={`md:text-lg font-light text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
                2,564,466 xps
              </h1>
            </div>
          </div>
          <div className='border-2  w-full'></div>
          <div className="rounded-2xl  p-[1rem]">
            <div className="flex justify-between px-2 items-center">
              <div className='flex flex-row gap-2'>
                <Image
                  src="/images/LogoBlack.svg"
                  height={50}
                  width={50}
                  alt="Logo"
                  className="cursor-pointer p-2 bg-white  rounded-lg "
                />
                <div className='flex flex-col gap-1'>
                <p className={`md:text-lg  text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Duchekelvin</p>
                <Image
                  src="/images/questBronze.svg"
                  height={20}
                  width={24}
                  alt="Logo"
                  className="cursor-pointer  "
                />

                </div>

              </div>
              <h1 className={`md:text-lg font-light text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
                2,564,466 xps
              </h1>
            </div>
          </div>
          <div className='border-2  w-full'></div>
          <div className="rounded-2xl  p-[1rem]">
            <div className="flex justify-between px-2 items-center">
              <div className='flex flex-row gap-2'>
                <Image
                  src="/images/LogoBlack.svg"
                  height={50}
                  width={50}
                  alt="Logo"
                  className="cursor-pointer p-2 bg-white  rounded-lg "
                />
                <div className='flex flex-col gap-1'>
                <p className={`md:text-lg  text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Duchekelvin</p>
                <p className={`md:text-lg  text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>#4</p>
               

                </div>

              </div>
              <h1 className={`md:text-lg font-light text-[0.4rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>
                2,564,466 xps
              </h1>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}