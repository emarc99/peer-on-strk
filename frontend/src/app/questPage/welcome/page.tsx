// app/questPage/(welcome)/page.tsx
'use client'

import { useRouter } from 'next/navigation'

import { DarkModeContext } from "../components/DarkMode";

import { useContext } from 'react';

export default function WelcomePage() {
    const { isDarkMode, toggleDark } = useContext(DarkModeContext);
    const router = useRouter()

    return (
        <div className="flex flex-col justify-between items-center xl:w-2/3 gap-[10rem]  lg:w-4/6 md:w-5/6 sm:w-6/6 mx-auto h-[60vh] md:h-[90vh] sm:h-[91vh]">
            <div className='flex flex-col justify-center gap-[2rem] items-center relative w-2/3 mx-auto h-[85vh] md:h-[85vh] sm:h-[50vh]'>
            <div className="flex flex-col justify-center items-center ">
                <h4

                    className={` text-center font-bold xl:text-[4rem] lg:text-[3.7rem] md:text-[3.3rem] sm:text-[2rem] xs:text-[1.5rem] sm:mt-[-1rem] text-[3rem] xl:mt-[-1rem] lg:mt-[-2rem] md:mt-[-2rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Welcome to
                    Peerprotocol’s Quests</h4>
                <p

                    className={` xl:max-w-[70%] mx-auto text-center opacity-60 md:w-[80%] md:text-sm text-[0.6rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Journey through each Period and succeed by completing the
                    Quests, stack your XPs - and wait for magic.</p>
            </div>

            <button
                className={`border border-black px-6 py-2 rounded-3xl ${isDarkMode ? "hover:bg-white hover:text-black bg-black text-white" : "hover:bg-black hover:text-white  text-black"}`}
                style={{ position: 'relative' }}
            >
                Login with 𝕏
            </button>
            </div>
      

            <img src="/images/questHero.svg"  className=' scale-125 w-screen justify-end' alt="" />
            {/* <Image
              src={
              `/images/questHero.svg` 
              }
              width={7000}
              height={654}
              className=' justify-end'
              alt=""
            /> */}
        </div>
    )
}