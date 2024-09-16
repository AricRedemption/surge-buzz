/* eslint-disable @typescript-eslint/no-explicit-any */
import LoadingOverlay from "react-loading-overlay-ts";
import { useState } from "react";
import { useEffect } from "react";

import { toast } from "react-toastify";
import { useAtom, useAtomValue } from "jotai";
import { globalFeeRateAtom, userInfoAtom } from "../../store/user";
import EditMetaIdInfoForm from "./EditMetaIdInfoForm";
import { useQueryClient } from "@tanstack/react-query";
import { IBtcConnector } from "@metaid/metaid";
import { MetaidUserInfo } from "./CreateMetaIDFormWrap";
import { environment } from "../../utils/environments";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Module, PackageId, StateId, SuiNetwork } from "../../config";
import { store } from "../../utils/walrus";

// export type MetaidUserInfo = {
// 	name: string;
// 	bio?: string;
// 	avatar?: string;
// };

type Iprops = {
  btcConnector: IBtcConnector;
};

const EditMetaIDFormWrap = ({ btcConnector }: Iprops) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const globalFeeRate = useAtomValue(globalFeeRateAtom);
  const [userInfoStartValues, setUserInfoStartValues] =
    useState<MetaidUserInfo>({
      name: userInfo?.name ?? "",
      bio: userInfo?.bio ?? "",
      avatar: userInfo?.avatar ?? undefined,
    });

  const client = useSuiClient();

  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      execute: async ({ bytes, signature }) =>
        await client.executeTransactionBlock({
          transactionBlock: bytes,
          signature,
          options: {
            showInput: false,
            showEvents: false,
            showEffects: true,
            showRawInput: false,
            showRawEffects: true,
            showObjectChanges: false,
            showBalanceChanges: false,
          },
        }),
    });

  useEffect(() => {
    setUserInfoStartValues({
      name: userInfo?.name ?? "",
      bio: userInfo?.bio ?? "",
      avatar: userInfo?.avatar ?? undefined,
    });
  }, [userInfo]);

  // const queryClient = useQueryClient();
  // console.log("userInfo", userInfo);
  const handleEditMetaID = async (userInfo: MetaidUserInfo) => {
    console.log("userInfo", userInfo);
    
    
    setIsEditing(true);

    try {
      const url = await store(userInfo.avatar, false);
      console.log("url", url);
      
      const tx = new Transaction();

      tx.moveCall({
        target: `${PackageId}::${Module}::create_account`,
        arguments: [
          tx.pure.string(userInfo.name),
          tx.pure.string(url),
          tx.object(StateId),
        ],
      });

      tx.setGasBudget(10000000);

      const { digest } = await signAndExecuteTransaction({
        transaction: tx,
        chain: `sui:${SuiNetwork}`,
      });
      console.log("digest", digest);
      setIsEditing(false);
      const doc_modal = document.getElementById(
        "edit_metaid_modal"
      ) as HTMLDialogElement;
      doc_modal.close();
    } catch (error) {
      console.log("error", error);
    }

    // const res = await btcConnector
    //   .updateUserInfo({
    //     userData: { ...userInfo },
    //     options: {
    //       feeRate: Number(globalFeeRate),
    //       network: environment.network,
    //     },
    //   })
    //   .catch((error: any) => {
    //     console.log('error', error);
    //     const errorMessage = (error as any)?.message ?? error;
    //     const toastMessage = errorMessage?.includes(
    //       'Cannot read properties of undefined'
    //     )
    //       ? 'User Canceled'
    //       : errorMessage;
    //     toast.error(toastMessage, {
    //       className:
    //         '!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg',
    //     });
    //     setIsEditing(false);
    //     setUserInfoStartValues(userInfoStartValues);
    //     //   console.log('error get user', await btcConnector.getUser());
    //     //   setUserInfo(await btcConnector.getUser());
    //   });
    // console.log('update res', res);
    // if (res) {
    //   setUserInfo(await btcConnector.getUser({ network: environment.network }));
    //   queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    //   toast.success('Updating Your Profile Successfully!');
    // }

    // setIsEditing(false);
    // const doc_modal = document.getElementById(
    //   'edit_metaid_modal'
    // ) as HTMLDialogElement;
    // doc_modal.close();
  };

  return (
    <LoadingOverlay active={isEditing} spinner text="Updating profile...">
      <EditMetaIdInfoForm
        onSubmit={handleEditMetaID}
        initialValues={userInfoStartValues}
      />
    </LoadingOverlay>
  );
};

export default EditMetaIDFormWrap;
