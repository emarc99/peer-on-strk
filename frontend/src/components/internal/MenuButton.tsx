import NetworkSwitcher from "../lib/NetworkSwitcher";
import GenericModal from "./util/GenericModal";
import TransactionsButton from "../lib/Transactions";
import { Menu, X } from "lucide-react";

const MenuButton = () => {
  const togglePopover = ({ targetId }: { targetId: string }) => {
    const popover = document.getElementById(targetId);
    // @ts-ignore
    popover.togglePopover();
    if (popover) {
      popover.addEventListener("toggle", () => {
        if (popover.matches(":popover-open")) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      });
    }
  };
  return (
    <>
      <GenericModal
        popoverId="transaction-modal"
        style="mt-[5rem] h-screen w-full bg-transparent backdrop:mt-[5rem] md:mt-[4rem] md:backdrop:mt-[9rem]"
      >
        <div className="user-modal mx-auto flex w-full max-w-[--header-max-w] flex-col items-center py-8 md:items-end md:px-12">
          <div className="zoom flex w-[90vw] max-w-[25rem] flex-col gap-4 rounded-[24px] bg-black p-8 pt-8 shadow-popover-shadow transition-colors duration-500 ease-linear md:max-w-[30rem] text-white">
            <div className="mb-8 flex justify-between">
              <h3 className="text-l text-[--headings]">Transactions</h3>
              <button
                //@ts-ignore
                popovertarget="transaction-modal"
                className="text-[--headings]"
              >
              <X />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-text-primary">Select Network</p>
              <NetworkSwitcher />
            </div>
            <div>
              <TransactionsButton />
            </div>
            <div>
              <button
                aria-haspopup="dialog"
                // @ts-ignore
                popovertarget="add-token-popover"
                className="w-full rounded-[12px] bg-white p-3 text-black md:p-4"
              >
                Add Token
              </button>
            </div>
          </div>
        </div>
      </GenericModal>

      <button
        aria-haspopup="dialog"
        onClick={() => togglePopover({ targetId: "transaction-modal" })}
        className="grid h-10 w-10 place-content-center rounded-full bg-accent-secondary text-[1.5em] text-background-primary-light md:h-12 md:w-12"
      >
       <Menu color="black" />
      </button>
    </>
  );
};

export default MenuButton;
