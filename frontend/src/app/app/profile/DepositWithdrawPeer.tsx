import Image from "next/image";
import React, { useState } from 'react';
import Logo from "../../../../public/images/LogoBlack.svg";
import USDC from "../../../../public/images/usdc.png"
import { ChevronDown, Cog } from "lucide-react";

const DepositWithdrawPeer = () => {
    const [amount, setAmount] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Deposit");

    const marketOptions = ["Deposit", "Withdraw"];
    const handleSelectChange = (option: string) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    return (
        <div className='border border-[#0000001A] bg-white p-6 rounded-[1rem] md:flex-grow flex-col relative text-black w-full md:h-full'>
            <div className='pb-4 flex justify-end'>
                <div className='flex items-center border py-2 px-4 rounded-3xl border-black cursor-pointer' onClick={() => setIsOpen(!isOpen)}>
                    {selectedOption}
                    <ChevronDown size={22} color="#000000" strokeWidth={1.25} />
                </div>
                {isOpen && (
                    <div className="absolute mt-10 w-[7rem] md:w-[8.5rem] rounded-md shadow-lg bg-white">
                        <div className="py-1">
                            {marketOptions.map((option) => (
                                <button key={option} onClick={() => handleSelectChange(option)} className={`block w-full text-left px-4 py-2 text-sm ${option === selectedOption ? "bg-gray-100" : ""}`}>
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <hr className='border-t pb-4' />
            <div className='bg-smoke-white py-2 px-6 rounded-lg'>
                <div className='flex justify-between mb-4'>
                    <p>Your deposit</p>
                    <div className=''>
                        <p className='text-xs text-right'>Priority fee</p>
                        <div className='flex items-center border px-3 py-1 rounded-3xl bg-[#0000000D]'>
                            <p className='text-xs'>Minimum</p>
                            <Cog size={15} className="m-0.5" color="#000000" strokeWidth={2.25} />
                        </div>
                    </div>
                </div>
                <div className='flex gap-4 w-full'>
                    <div className='flex items-center justify-center bg-[#0000000D] py-2 px-4 rounded-xl'>
                        <div className="flex gap-3 items-center">
                        <Image src={USDC} width={25} height={25} alt="USDC-Image"/>
                        <p className='mr-2'>USDC</p>
                        </div>
                        <div className='flex-shrink-0 pl-6'>
                            <ChevronDown size={22} color="#000000" strokeWidth={1.85} />
                        </div>
                    </div>

                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="text-right text-[1.4rem] font-bold bg-transparent outline-none w-[60%] md:w-auto"
                    />
                </div>
                <p className='text-xs'>Available:</p>
                <div className='flex gap-2 justify-end'>
                    {["25%", "50%", "75%", "100%"].map((percent, index) => (
                        <button key={index} className='bg-[#0000000D] text-xs px-2 py-1 rounded-md'>{percent}</button>
                    ))}
                </div>
            </div>
            <button className='bg-black text-white rounded-full w-full py-3 mt-4'>Deposit</button>
            <div className='flex justify-center gap-2 mt-4'>
                <p className='text-xs opacity-50'>Powered by Peer Protocol</p>
                <Image src={Logo} height={15} width={15} alt='logo-icon' />
            </div>
        </div>
    );
};

export default DepositWithdrawPeer;
