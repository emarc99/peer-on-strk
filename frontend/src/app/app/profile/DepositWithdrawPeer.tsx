"use client";

import Image from "next/image";
import React, { useState } from 'react';
import { uint256 } from 'starknet';
import { useContract, useAccount, useNetwork } from '@starknet-react/core';
import protocolAbi from "../../../../public/abi/protocol.json";
import mockTokenAbi from "../../../../public/abi/mock_token.json";
import Logo from "../../../../public/images/LogoBlack.svg";
import STRK from "../../../../public/images/starknet.png"
import { ChevronDown, Cog } from "lucide-react";

// Contract Addresses
const PROTOCOL_ADDRESS = "";
const TOKEN_ADDRESS = "";

export default function DepositWithdrawPeer() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Deposit");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { account, address } = useAccount();

  const { contract: tokenContract } = useContract({
    abi: mockTokenAbi,
    address: TOKEN_ADDRESS,
  });

  const { contract: protocolContract } = useContract({
    abi: protocolAbi,
    address: PROTOCOL_ADDRESS,
  });

  const getUint256FromDecimal = (decimalAmount: string) => {
    try {
      const amount = Number(decimalAmount);
      const multiplied = amount * Math.pow(10, 18);
      return uint256.bnToUint256(multiplied.toString());
    } catch (err) {
      throw new Error('Invalid amount format');
    }
  };

  const handleApprove = async () => {
    if (!tokenContract || !account) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const amountUint256 = getUint256FromDecimal(amount);
      
      const approvalCall = tokenContract.populate('approve', [
        PROTOCOL_ADDRESS,
        amountUint256
      ]);
      
      const approvalTx = await account.execute(approvalCall);
      
      await account.waitForTransaction(approvalTx.transaction_hash);
      setSuccess('Token approval successful');
      return true;
    } catch (err: any) {
      setError(`Approval failed: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setAmount(value);
    }
  }

  const handleDeposit = async () => {
    if (!protocolContract || !account) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const isApproved = await handleApprove();
      if (!isApproved) return;
      
      const amountUint256 = getUint256FromDecimal(amount);
      
      const depositCall = protocolContract.populate('deposit', [
        TOKEN_ADDRESS,
        amountUint256
      ]);
      
      const depositTx = await account.execute(depositCall);
      
      await account.waitForTransaction(depositTx.transaction_hash);
      setSuccess('Deposit successful');
    } catch (err: any) {
      setError(`Deposit failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!protocolContract || !account) {
      setError('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const amountUint256 = getUint256FromDecimal(amount);
      
      const withdrawCall = protocolContract.populate('withdraw', [
        TOKEN_ADDRESS,
        amountUint256
      ]);
      
      const withdrawTx = await account.execute(withdrawCall);
      
      await account.waitForTransaction(withdrawTx.transaction_hash);
      setSuccess('Withdrawal successful');
    } catch (err: any) {
      setError(`Withdrawal failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const marketOptions = ["Deposit", "Withdraw"];

  if (!address) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center text-red-500">
          Please connect your wallet first
        </div>
      </div>
    );
  }

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
                <p>Your {selectedOption.toLowerCase()}</p>
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
                    <Image src={STRK} width={25} height={25} alt="STRK-Image"/>
                    <p className='mr-2'>STRK</p>
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
        <button 
          className='bg-black text-white rounded-full w-full py-3 mt-4'
          onClick={selectedOption === "Deposit" ? handleDeposit : handleWithdraw}
          disabled={loading}
        >
          {loading ? 'Processing...' : selectedOption}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
        <div className='flex justify-center gap-2 mt-4'>
            <p className='text-xs opacity-50'>Powered by Peer Protocol</p>
            <Image src={Logo} height={15} width={15} alt='logo-icon' />
        </div>
    </div>
  );
}