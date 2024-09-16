import { useAtom, useAtomValue } from "jotai";
import { PencilLine } from "lucide-react";
import { Link } from "react-router-dom";

import {
  connectedAtom,
  globalFeeRateAtom,
  userInfoAtom,
} from "../../store/user";

import Avatar from "../Public/Avatar";
import CustomAvatar from "../Public/CustomAvatar";

import { useMemo, useState } from "react";
import { IBtcConnector } from "@metaid/metaid";
import AboutModal from "../Modals/AboutModal";
import NavabarMobileMenu from "./NavabarMobileMenu";
import NewBuzzModal from "../Modals/NewBuzzModal";
import {
  ConnectModal,
  useSuiClient,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSignAndExecuteTransaction,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { network, PackageId, Module, StateId } from "../../config";

type IProps = {
  onWalletConnectStart: () => Promise<void>;
  onLogout: () => void;
  btcConnector: IBtcConnector;
};

const Navbar = ({ onWalletConnectStart, onLogout, btcConnector }: IProps) => {
  const [globalFeeRate, setGlobalFeeRate] = useAtom(globalFeeRateAtom);

  const connected = useAtomValue(connectedAtom);
  const userInfo = useAtomValue(userInfoAtom);

  const [open, setOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { isConnected, currentWallet } = useCurrentWallet();

  const onBuzzStart = async () => {
    // await checkMetaletInstalled();
    // await checkMetaletConnected(connected);
    // await checkUserNameExisted(userInfo?.name ?? "");
    if (!isConnected) {
      setOpen(true);
      return;
    }

    const doc_modal = document.getElementById(
      "new_buzz_modal"
    ) as HTMLDialogElement;
    doc_modal.showModal();
  };

  const onEditProfileStart = async () => {
    const doc_modal = document.getElementById(
      "edit_metaid_modal"
    ) as HTMLDialogElement;
    doc_modal.showModal();
  };

  const address = useMemo(
    () => currentWallet?.accounts[0].address,
    [currentWallet]
  );

  const { data: profileInfo } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: address!,
      filter: {
        StructType: `${PackageId}::${Module}::Profile`,
      },
      options: {
        showContent: true,
      },
    },
    {
      gcTime: 10000,
      enabled: !!address,
      select: (profileData) => {
        const content = profileData.data?.[0]?.data?.content as any;
        return {
          id: content.fields.id.id,
          name: content.fields.username,
          address: content.fields.address,
          avatarUrl: content.fields.photo_blob,
        };
      },
    }
  );

  return (
    <>
      <AboutModal />

      <div className="z-10 navbar py-3 px-0 bg-main absolute top-0">
        <div className="container flex justify-between">
          <Link to={"/"} className="md:block hidden">
            <img src="/logo_navbar.png" className="w-[100px] h-[26px]" />
          </Link>
          <NavabarMobileMenu />

          <div className="flex items-center gap-2">
            <div className="gap-4 hidden md:flex">
              <a
                href="https://docs.metaid.io/"
                className="text-lime-900 font-bold hover:underline hover:text-lime-700"
                target="_blank"
              >
                Docs
              </a>
              <button
                className="text-lime-900 font-bold hover:underline hover:text-lime-700"
                onClick={() => {
                  const doc_modal = document.getElementById(
                    "about_modal"
                  ) as HTMLDialogElement;
                  doc_modal.showModal();
                }}
              >
                About
              </button>
              <div className="border-r border border-[#1D2F2F]/50 mr-2"></div>
            </div>

            <div className="flex items-center gap-x-1 hidden">
              <img
                src="/charging-pile.png"
                className="w-[30px] h-[35px] hidden md:block"
              />
              <input
                inputMode="numeric"
                type="number"
                min={0}
                max={"100000"}
                style={{
                  appearance: "textfield",
                }}
                aria-hidden
                className="w-[65px] h-[32px] input input-xs  bg-[black]  shadow-inner !pr-0 border-none focus:border-main text-main focus:outline-none  hidden md:block"
                step={1}
                value={globalFeeRate}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setGlobalFeeRate(v);
                }}
              />
              <div className="text-[#1D2F2F] hidden md:block">sat/vB</div>
            </div>

            <PencilLine
              className="border rounded-full text-main bg-[black] p-2 cursor-pointer ml-2 w-9 h-9 md:w-12 md:h-12"
              // size={45}
              onClick={onBuzzStart}
            />

            {connected ? (
              <div className="dropdown dropdown-hover hidden">
                <div
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer md:hidden block"
                >
                  <CustomAvatar userInfo={userInfo!} size="36px" />
                </div>
                <div
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer md:block hidden"
                >
                  <CustomAvatar userInfo={userInfo!} />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu px-4 py-4 gap-3 shadow bg-main rounded-box w-[170px] border border-[#131519] right-0"
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0px 4px 10px 0px rgba(169, 211, 18, 0.5)",
                  }}
                >
                  <li
                    className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative"
                    onClick={onEditProfileStart}
                  >
                    <img
                      src="/profile-icon.png"
                      width={55}
                      height={55}
                      className="absolute left-0 top-0"
                    />
                    <a
                      className="text-[#1D2F2F] text-[14px]"
                      style={{ textIndent: "2.2em" }}
                    >{`Edit Profile`}</a>
                  </li>
                  <div className="border border-[#1D2F2F]/50 w-[80%] mx-auto"></div>
                  <li
                    className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative"
                    onClick={onLogout}
                  >
                    <img
                      src="/logout-icon.png"
                      width={55}
                      height={55}
                      className="absolute left-0 top-0"
                    />
                    <a
                      className="text-[#1D2F2F] text-[14px]"
                      style={{ textIndent: "2.5em" }}
                    >
                      Disconnect
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <div
                className="btn-sm w-[120px] text-[12px] md:text-[14px] md:btn-md md:w-[180px] btn btn-outline hover:bg-[black] hover:text-main rounded-full font-medium hidden"
                onClick={onWalletConnectStart}
              >
                Connect Wallet
              </div>
            )}
            {isConnected ? (
              <div className="dropdown dropdown-hover">
                <div
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer md:hidden block"
                >
                  <Avatar userInfo={profileInfo!} size="36px" />
                </div>
                <div
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer md:block hidden"
                >
                  <Avatar userInfo={profileInfo!} />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu px-4 py-4 gap-3 shadow bg-main rounded-box w-[170px] border border-[#131519] right-0"
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0px 4px 10px 0px rgba(169, 211, 18, 0.5)",
                  }}
                >
                  <li
                    className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative"
                    onClick={onEditProfileStart}
                  >
                    <img
                      src="/profile-icon.png"
                      width={55}
                      height={55}
                      className="absolute left-0 top-0"
                    />
                    <button
                      className="text-[#1D2F2F] text-[14px]"
                      style={{ textIndent: "2.2em" }}
                      // onClick={async () => {
                      //   try {
                      //     const tx = new Transaction();

                      //     tx.moveCall({
                      //       target: `${PackageId}::${Module}::create_tweet`,
                      //       arguments: [
                      //         tx.pure.string(
                      //           "https://aggregator-devnet.walrus.space/v1/HsXlmeyxonw6ZLxktmO21yAyMU7Pu-plJ7nymi_YcQs"
                      //         ),
                      //         tx.object(StateId),
                      //       ],
                      //     });

                      //     tx.setGasBudget(10000000);

                      //     const { digest } = await signAndExecuteTransaction({
                      //       transaction: tx,
                      //       chain: `sui:${network}`,
                      //     });
                      //     console.log("digest", digest);
                      //   } catch (error) {
                      //     console.log("error", error);
                      //   }
                      // }}
                    >{`Edit Profile`}</button>
                  </li>
                  <div className="border border-[#1D2F2F]/50 w-[80%] mx-auto"></div>
                  <li
                    className="hover:bg-[rgba(219, 243, 136, 0.5)] rounded-box relative"
                    onClick={() => {
                      disconnect();
                      window.location.reload();
                    }}
                  >
                    <img
                      src="/logout-icon.png"
                      width={55}
                      height={55}
                      className="absolute left-0 top-0"
                    />
                    <a
                      className="text-[#1D2F2F] text-[14px]"
                      style={{ textIndent: "2.5em" }}
                    >
                      Disconnect
                    </a>
                  </li>
                </ul>
              </div>
            ) : (
              <ConnectModal
                trigger={
                  <button
                    disabled={!!currentAccount}
                    className="btn-sm w-[120px] text-[12px] md:text-[14px] md:btn-md md:w-[180px] btn btn-outline hover:bg-[black] hover:text-main rounded-full font-medium"
                  >
                    Connect Wallet
                  </button>
                }
                open={open}
                onOpenChange={(isOpen) => setOpen(isOpen)}
              />
            )}
          </div>
        </div>
      </div>
      <NewBuzzModal btcConnector={btcConnector} />
    </>
  );
};

export default Navbar;
