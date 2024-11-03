import React, { useState } from "react";
import { tableData } from "../../../data/TransactionHistory";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAccount, useContractRead } from "@starknet-react/core";
import protocolAbi from "../../../../public/abi/protocol.json"
import { ETH_SEPOLIA, PROTOCOL_ADDRESS, STRK_SEPOLIA } from "@/components/internal/helpers/constant";
import STRK from "../../../../public/images/starknet.png"
import ETH from "../../../../public/images/ethereumlogo.svg"
import { toHex, formatCurrency } from "@/components/internal/helpers";

const Table: React.FC = () => {
    // State to manage the active tab
    const [activeTab, setActiveTab] = useState("Transaction History");

    // Pagination setup
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    interface TokenInfo {
      symbol: string
      address: string
      icon: any
      decimals: number
    }
    const tokens: TokenInfo[] = [
      {
        symbol: "STRK",
        address: STRK_SEPOLIA,
        icon: STRK,
        decimals: 18
      },
      {
        symbol: "ETH",
        address: ETH_SEPOLIA,
        icon: ETH,
        decimals: 18
      }
    ]

    // Read User Assets
    const {address: user} = useAccount();
    const {data: userDeposits, isLoading: isLoadingUserDeposits, refetch: refetchUserDeposits, isFetching: isFetchingUserDeposits} = useContractRead({
      abi: protocolAbi,
      address: PROTOCOL_ADDRESS,
      functionName: "get_user_deposits",
      args: user ? [user] : [],
    });

    // Filter data based on the active tab
    const getDataForActiveTab = () => {
        switch (activeTab) {
            case "Transaction History":
                return tableData;
            case "Assets":
              return Array.isArray(userDeposits) ? userDeposits : [];
            case "Position Overview":
                // Return an empty array for tabs without data
                return [];
            default:
                return [];
        }
    };

    // Get the data for the current page
    const dataForCurrentTab = getDataForActiveTab();
    const totalPages = Math.ceil(dataForCurrentTab?.length / rowsPerPage);
    const currentRows = dataForCurrentTab?.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Logic for pagination with 5 buttons visible
    const maxVisibleButtons = 5;
    const startPage = Math.floor((currentPage - 1) / maxVisibleButtons) * maxVisibleButtons + 1;
    const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="p-6">
            {/* Buttons: Assets, Position Overview, Transaction History, Filter */}
            <div className="mb-6 flex justify-between mt-3 gap-4">
                <div className="flex flex-wrap md:flex-row space-x-2 md:space-x-4">
                    <button
                        className={`px-4 py-2 rounded-full ${activeTab === "Assets" ? "bg-black text-white" : "bg-transparent text-black"}`}
                        onClick={() => {
                            setActiveTab("Assets");
                            setCurrentPage(1); // Reset to first page when changing tabs
                        }}
                    >
                        Assets
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${activeTab === "Position Overview" ? "bg-black text-white" : "bg-transparent text-black"}`}
                        onClick={() => {
                            setActiveTab("Position Overview");
                            setCurrentPage(1); // Reset to first page when changing tabs
                        }}
                    >
                        Position Overview
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${activeTab === "Transaction History" ? "bg-black text-white" : "bg-transparent text-black"}`}
                        onClick={() => {
                            setActiveTab("Transaction History");
                            setCurrentPage(1); // Reset to first page when changing tabs
                        }}
                    >
                        Transaction History
                    </button>
                </div>
                <div className="relative">
                    <select className="px-4 py-2 border rounded-full text-black  pr-8 appearance-none">
                        <option value="borrow">Borrow</option>
                        <option value="lend">Lend</option>
                    </select>
                    <ChevronDown
                      className="cursor-pointer absolute top-3 right-2 w-5 h-5 text-gray-500"
                    />
                </div>
            </div>

            {/* Table */}
            {activeTab === "Assets" &&
              <div className="overflow-x-auto text-black my-6">
                  <table className="w-full border-collapse">
                      <thead>
                          <tr className="border bg-smoke-white">
                              <th className="p-4 text-left border-b font-semibold">Token</th>
                              <th className="p-4 text-left border-b font-semibold">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                        {
                          dataForCurrentTab.length === 0 ? (
                              <tr>
                                  <td colSpan={5} className="p-4 text-center" style={{ minHeight: '100px' }}>
                                      No data available
                                  </td>
                              </tr>
                          ) : isLoadingUserDeposits || isFetchingUserDeposits ?
                            (
                                 <div className="ml-2 mt-3">Getting your assets...</div>
                            ) :
                            (currentRows.map((row, index: number) => {
                                  const tokenAddressHex = toHex(row.token).toString();
                                  const token = tokens.find(token => token.address === tokenAddressHex);
                                  return (<tr key={index}>
                                      <td className="p-4 border-b border-l flex gap-3 items-center">
                                          {
                                            token && (
                                              <>
                                                <Image src={token.icon} width={20} height={20} alt={`${token.symbol} Token`} />
                                                <span>{token.symbol}</span>
                                              </>
                                            )
                                          }
                                      </td>
                                      <td className="p-4 border-b border-l">{Number(formatCurrency(row.amount?.toString())).toFixed(3)}</td>
                                  </tr>)}))
                          }
                      </tbody>
                  </table>
              </div>
            }
            {activeTab === "Transaction History" &&
              <div className="overflow-x-auto text-black my-6">
                  <table className="w-full border-collapse">
                      <thead>
                          <tr className="border bg-smoke-white">
                              <th className="p-4 text-left border-b font-semibold">
                                  Transaction Type
                              </th>
                              <th className="p-4 text-left border-b font-semibold">Market</th>
                              <th className="p-4 text-left border-b font-semibold">Quantity</th>
                              <th className="p-4 text-left border-b font-semibold">Value ($)</th>
                              <th className="p-4 text-left border-b font-semibold">
                                  Interest (%)
                              </th>
                          </tr>
                      </thead>
                      <tbody>
                          {dataForCurrentTab.length === 0 ? (
                              <tr>
                                  <td colSpan={5} className="p-4 text-center" style={{ minHeight: '100px' }}>
                                      No data available
                                  </td>
                              </tr>
                          ) : (
                              currentRows.map((row, index) => (
                                  <tr key={index}>
                                      <td className="p-4 border-b border-l">{row.transactionType}</td>
                                      <td className="p-4 border-b flex items-center">
                                          <Image
                                              src={row.marketImage}
                                              alt={row.marketName}
                                              width={24}
                                              height={24}
                                              className="rounded-full mr-2"
                                          />
                                          {row.marketName}
                                      </td>
                                      <td className="p-4 border-b">{row.quantity}</td>
                                      <td className="p-4 border-b">{row.value}</td>
                                      <td className="p-4 border-b border-r">{row.interest}</td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              </div>
            }

            {/* Pagination Component */}
            {dataForCurrentTab.length > 0 && (
                <div className="flex justify-end mt-4 items-center">
                    {/* Previous button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`mx-1 px-4 py-2 border text-black rounded-md ${currentPage === 1 ? "cursor-not-allowed" : ""}`}
                    >
                        <ChevronLeft size={20} color="#000000" strokeWidth={2.5} />
                    </button>

                    {/* Visible page buttons */}
                    {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                        const page = startPage + index;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`mx-1 px-4 py-2 border rounded-md ${currentPage === page ? "bg-black text-white" : "bg-white text-black"}`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    {/* Next button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`mx-1 px-4 py-2 border text-black rounded-md ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                        <ChevronRight size={20} color="#000000" strokeWidth={2.5} />
                    </button>
                </div>
            )}

        </div>
    );
};

export default Table;
