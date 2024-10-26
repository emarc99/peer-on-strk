"use client";
import BackButton from "../../../../public/images/back-button.svg";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import Nav from "../Nav";
import Sidebar from "../sidebar";
import { BorrowerData } from "../../../data/BorrowerData";

type ModalType = "create" | "counter";

const ITEMS_PER_PAGE = 7;

const TableHeader = () => (
  <div className="grid grid-cols-7 bg-smoke-white py-4 rounded-t-xl min-w-[800px]">
    <div className="text-center font-semibold">Merchant</div>
    <div className="text-center font-semibold">Quantity</div>
    <div className="text-center font-semibold">Value ($)</div>
    <div className="text-center font-semibold">Interest Rate</div>
    <div className="text-center font-semibold">Duration</div>
    <div className="text-center font-semibold">Completed Deals</div>
    <div className="text-center font-semibold">Action</div>
  </div>
);

const TableRow = ({ row, onCounterProposal }: { row: any; onCounterProposal: () => void }) => (
  <div className="grid grid-cols-7 border-t border-gray-300 min-w-[800px]">
    <div className="flex items-center justify-center px-4 py-6">
      <Image className="ml-3" src="/images/phantom-icon.svg" height={20} width={20} alt="phantomicon" />
      <p className="font-medium ml-2">{row.borrowers}</p>
    </div>
    <div className="text-center px-4 py-6">
      <p className="font-medium">{row.quantity}</p>
    </div>
    <div className="text-center px-4 py-6">
      <p className="font-medium">{row.amountNeeded}</p>
    </div>
    <div className="text-center px-4 py-6">
      <p className="font-medium">{row.interestRate}%</p>
    </div>
    <div className="text-center px-4 py-6">
      <p className="font-medium">{row.term} days</p>
    </div>
    <div className="text-center px-4 py-6">
      <p className="font-medium">{row.completedDeal}</p>
    </div>
    <div className="flex justify-center items-center gap-2 px-4 py-6">
      <button className="px-2 text-sm rounded-full bg-[rgba(0,0,0,0.8)] text-white w-20 h-8">
        Borrow
      </button>
      <button onClick={onCounterProposal}>
        <Image
          src="/images/edit.svg"
          alt="counter-proposal"
          width={15}
          height={20}
          className="cursor-pointer"
        />
      </button>
    </div>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex justify-end p-4">
    <div className="flex gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          className={`px-4 py-2 ${currentPage === index + 1
            ? "bg-[rgba(0,0,0,0.8)] text-white"
            : "bg-[#F5F5F5] text-black border-black border"
            } rounded-lg`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  </div>
);

const ProposalModal = ({
  isOpen,
  onClose,
  modalType,
  interestRate,
  interestRateInput,
  onInterestRateChange,
  onManualInputChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  modalType: ModalType;
  interestRate: number;
  interestRateInput: string;
  onInterestRateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onManualInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md relative pt-8 pb-7">
        <button className="absolute top-4 right-4 text-black text-xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-center text-lg text-black">
          {modalType === "create" ? "Create a Proposal" : "Counter Proposal"}
        </h2>

        <div className="space-y-4 px-6 py-6">
          <div>
            <label className="text-sm text-gray-500 pl-2">Quantity</label>
            <div className="p-3 border rounded-xl border-gray-600">
              <input type="text" className="w-full outline-none pl-2 text-black" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 pl-2">Duration (Days)</label>
            <div className="p-3 border rounded-xl border-gray-600">
              <input type="text" className="w-full outline-none pl-2 text-black" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 pl-2">Interest Rate (%)</label>
            <div className="flex flex-col items-center text-black">
              <input
                type="range"
                min="0"
                max="100"
                value={interestRate}
                onChange={onInterestRateChange}
                className="w-full h-2 rounded-lg cursor-pointer appearance-none focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #1e1e1e ${interestRate}%, #e0e0e0 ${interestRate}%)`,
                }}
              />
              <div className="flex justify-between w-full text-black">
                <span className="text-black font-medium">{interestRate}%</span>
                <input
                  type="number"
                  value={interestRateInput}
                  onChange={onManualInputChange}
                  className="border border-gray-300 mt-2 rounded p-1 w-16 text-center focus:outline-none focus:ring-0 focus:border-gray-400"
                  placeholder="Rate"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-4">
          <button className="bg-[rgba(0,0,0,0.8)] text-white px-4 py-2 rounded-full" onClick={onClose}>
            Submit
          </button>
        </div>

        <div className="flex mt-8 items-center gap-2 justify-center absolute bottom-3 left-1/2 transform -translate-x-1/2">
          <small className="text-gray-500">Powered By Peer Protocol</small>
          <Image src="/images/LogoBlack.svg" height={20} width={20} alt="peer-protocol-logo" className="opacity-50" />
        </div>
      </div>
    </div>
  );
};

const BorrowersMarket = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("create");
  const [interestRate, setInterestRate] = useState(0);
  const [interestRateInput, setInterestRateInput] = useState("");

  const totalPages = Math.ceil(BorrowerData.length / ITEMS_PER_PAGE);
  const currentData = BorrowerData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const openModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
    setInterestRate(0);
    setInterestRateInput("");
  };
  const closeModal = () => setModalOpen(false);

  const handleInterestRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setInterestRate(value);
    setInterestRateInput(event.target.value);
  };

  const handleManualInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInterestRateInput(value);
    setInterestRate(Number(value));
  };

  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />
          <div className="flex justify-left items-center gap-3 p-4">
            <Link href="/app">
              <Image src={BackButton} height={40} width={40} alt="back-button" className="cursor-pointer" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-black text-2xl md:text-4xl">Borrow Market</h1>
              <div className="flex gap-2 border rounded-3xl text-black border-gray-500 px-3 py-1 items-center">
                <Image src="/images/starknet.png" height={20} width={20} alt="starknet-logo" />
                <p className="text-xs">Starknet</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto text-black border mx-4 mb-4 rounded-xl">
            <TableHeader />
            <div>
              {currentData.map((row, index) => (
                <TableRow key={index} row={row} onCounterProposal={() => openModal("counter")} />
              ))}
            </div>
          </div>
          <button
            onClick={() => openModal("create")}
            className="relative flex items-center gap-2 px-6 py-3 rounded-3xl bg-[#F5F5F5] text-black border border-[rgba(0,0,0,0.8)] mx-auto font-light hover:bg-[rgba(0,0,0,0.8)] hover:text-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <p>Create a Proposal</p>
            <Plus
              size={22}
              strokeWidth={3}
              absoluteStrokeWidth
              className={`transition-colors duration-300 ease-in-out ${isHovered ? "text-white" : "text-black"}`}
            />
          </button>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          <ProposalModal
            isOpen={isModalOpen}
            onClose={closeModal}
            modalType={modalType}
            interestRate={interestRate}
            interestRateInput={interestRateInput}
            onInterestRateChange={handleInterestRateChange}
            onManualInputChange={handleManualInputChange}
          />
        </div>
      </div>
    </main>
  );
};

export default BorrowersMarket;
