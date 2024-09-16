import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Buzz from "./pages/Buzz";
import Tweet from "./pages/Tweet";
import Home from "./pages/Home";
import EditBuzz from "./pages/EditBuzz";
import { ToastContainer, toast } from "react-toastify";
import "./globals.css";
import "./react-toastify.css";
// import "react-toastify/dist/ReactToastify.css";
import { MetaletWalletForBtc, btcConnect } from "@metaid/metaid";

import { useAtom, useSetAtom } from "jotai";
import {
  btcConnectorAtom,
  connectedAtom,
  myFollowingListAtom,
  userInfoAtom,
  walletAtom,
  walletRestoreParamsAtom,
} from "./store/user";
import { buzzEntityAtom } from "./store/buzz";
import { errors } from "./utils/errors";
import { isNil } from "ramda";
import { checkMetaletInstalled, confirmCurrentNetwork } from "./utils/wallet";
// import { conirmMetaletTestnet } from "./utils/wallet";
import CreateMetaIDModal from "./components/MetaIDFormWrap/CreateMetaIDModal";
import EditMetaIDModal from "./components/MetaIDFormWrap/EditMetaIDModal";
import { useCallback, useEffect, useRef } from "react";
import { BtcNetwork } from "./api/request";
import InsertMetaletAlertModal from "./components/Modals/InsertMetaletAlertModal";
import { environment } from "./utils/environments";
import { useMutation } from "@tanstack/react-query";
import { fetchFollowingList } from "./api/buzz";
import Profile from "./pages/Profile";
import FollowDetail from "./pages/followDetail";

function App() {
  const ref = useRef<null | HTMLDivElement>(null);

  const [connected, setConnected] = useAtom(connectedAtom);
  const setWallet = useSetAtom(walletAtom);
  const [btcConnector, setBtcConnector] = useAtom(btcConnectorAtom);
  const setUserInfo = useSetAtom(userInfoAtom);
  const [walletParams, setWalletParams] = useAtom(walletRestoreParamsAtom);
  const setMyFollowingList = useSetAtom(myFollowingListAtom);
  const setBuzzEntity = useSetAtom(buzzEntityAtom);

  const mutateMyFollowing = useMutation({
    mutationKey: ["myFollowing", btcConnector?.metaid],
    mutationFn: (metaid: string) =>
      fetchFollowingList({
        metaid: metaid,
        params: { cursor: "0", size: "100", followDetail: false },
      }),
  });

  const onLogout = () => {
    setConnected(false);
    setBtcConnector(null);
    setBuzzEntity(null);
    setUserInfo(null);
    setWalletParams(undefined);
    setMyFollowingList([]);
    window.metaidwallet.removeListener("accountsChanged");
    window.metaidwallet.removeListener("networkChanged");
  };

  const onWalletConnectStart = async () => {
    await checkMetaletInstalled();
    const _wallet = await MetaletWalletForBtc.create();
    if (_wallet.address === undefined) {
      const metalet = window?.metaidwallet;
      const isConnected = await metalet.isConnected();
      if (typeof isConnected === "object" && isConnected.status === "locked") {
        toast.error(errors.METALET_LOCKED, {
          className:
            "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
        });
        throw new Error(errors.METALET_LOCKED);
      }
    }

    await confirmCurrentNetwork();
    setWallet(_wallet);
    setWalletParams({
      address: _wallet.address,
      pub: _wallet.pub,
    });
    if (isNil(_wallet?.address)) {
      toast.error(errors.NO_METALET_LOGIN, {
        className:
          "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
      });
      throw new Error(errors.NO_METALET_LOGIN);
    }

    //////////////////////////

    const _btcConnector = await btcConnect({
      network: environment.network,
      wallet: _wallet,
    });

    setBtcConnector(_btcConnector);

    const myFollowingListData = await mutateMyFollowing.mutateAsync(
      _btcConnector?.metaid ?? ""
    );
    setMyFollowingList(myFollowingListData?.list ?? []);
    // const doc_modal = document.getElementById(
    //   'create_metaid_modal'
    // ) as HTMLDialogElement;
    // doc_modal.showModal();
    // console.log("getUser", await _btcConnector.getUser());

    const resUser = await _btcConnector.getUser({
      network: environment.network,
    });
    console.log("user now", resUser);

    setUserInfo(resUser);
    setConnected(true);
    setBuzzEntity(await _btcConnector.use("buzz"));
    console.log("your btc address: ", _btcConnector.address);
  };

  const getBuzzEntity = async () => {
    // await conirmMetaletMainnet();
    const _btcConnector = await btcConnect({ network: environment.network });
    setBtcConnector(_btcConnector);
    const _buzzEntity = await _btcConnector.use("buzz");
    setBuzzEntity(_buzzEntity);
  };

  useEffect(() => {
    getBuzzEntity();
  }, []);
  const handleBeforeUnload = async () => {
    if (!isNil(walletParams)) {
      const _wallet = MetaletWalletForBtc.restore({
        ...walletParams,
        internal: window.metaidwallet,
      });
      setWallet(_wallet);
      const _btcConnector = await btcConnect({
        wallet: _wallet,
        network: environment.network,
      });
      setBtcConnector(_btcConnector);
      setUserInfo(_btcConnector.user);
      // setConnected(true);
      // console.log('refetch user', _btcConnector.user);
    }
  };

  const wrapHandleBeforeUnload = useCallback(handleBeforeUnload, [
    walletParams,
    setUserInfo,
  ]);

  useEffect(() => {
    setTimeout(() => {
      wrapHandleBeforeUnload();
    }, 1000);
  }, [wrapHandleBeforeUnload]);

  const handleAcccountsChanged = () => {
    onLogout();
    toast.error("Wallet Account Changed ----Please login again...");
  };

  const handleNetworkChanged = async (network: BtcNetwork) => {
    if (connected) {
      onLogout();
    }
    toast.error("Wallet Network Changed  ");
    if (network !== environment.network) {
      toast.error(errors.SWITCH_NETWORK_ALERT, {
        className:
          "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
      });
      await window.metaidwallet.switchNetwork({ network: environment.network });

      throw new Error(errors.SWITCH_NETWORK_ALERT);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (!isNil(window?.metaidwallet)) {
        if (connected) {
          window.metaidwallet.on("accountsChanged", handleAcccountsChanged);
        }

        window.metaidwallet.on("networkChanged", handleNetworkChanged);
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, window?.metaidwallet]);

  const onScrollToTop = () => {
    ref.current!.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative overflow-auto">
      <div ref={ref}>
        <Navbar
          onWalletConnectStart={onWalletConnectStart}
          onLogout={onLogout}
          btcConnector={btcConnector!}
        />
      </div>

      <div className="container pt-[100px] bg-[black] text-white h-screen">
        <Routes>
          <Route path="/" element={<Home onScrollToTop={onScrollToTop} />} />
          <Route path="/buzz/:id" element={<Buzz />} />
          <Route path="/tweet/:id" element={<Tweet />} />
          <Route path="/buzz/:id/edit" element={<EditBuzz />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/follow-detail/:id" element={<FollowDetail />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-left"
        toastStyle={{
          position: "absolute",
          top: "0px",
          left: "120px",
          width: "380px",
          zIndex: 9999,
        }}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        closeButton={false}
      />

      <CreateMetaIDModal
        btcConnector={btcConnector!}
        onWalletConnectStart={onWalletConnectStart}
      />
      <EditMetaIDModal btcConnector={btcConnector!} />
      <InsertMetaletAlertModal />
    </div>
  );
}

export default App;
