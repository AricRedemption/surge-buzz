/* eslint-disable @typescript-eslint/no-explicit-any */
import LoadingOverlay from 'react-loading-overlay-ts';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import CreateMetaIdInfoForm from './CreateMetaIdInfoForm';
import { useAtomValue, useSetAtom } from 'jotai';
import { globalFeeRateAtom, userInfoAtom, walletAtom } from '../../store/user';
import { isNil } from 'ramda';
import { IBtcConnector } from '@metaid/metaid';
import { environment } from '../../utils/environments';
import { useQueryClient } from '@tanstack/react-query';

export type MetaidUserInfo = {
  name: string;
  bio?: string;
  avatar?: string;
  feeRate?: number;
};

const CreateMetaIDFormWrap = ({
  btcConnector,
}: {
  btcConnector: IBtcConnector;
  onWalletConnectStart?: () => void;
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [balance, setBalance] = useState('0');

  const setUserInfo = useSetAtom(userInfoAtom);

  const wallet = useAtomValue(walletAtom);

  const globalFeeRate = useAtomValue(globalFeeRateAtom);

  const getBtcBalance = async () => {
    if (!isNil(wallet)) {
      setBalance(((await wallet?.getBalance())?.confirmed ?? 0).toString());
    }
  };

  useEffect(() => {
    getBtcBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);
  const queryClient = useQueryClient();

  const handleCreateMetaID = async (userInfo: MetaidUserInfo) => {
    console.log("userInfo", userInfo);
    // console.log(
    //   'wallet balance',

    //   await wallet?.getBalance()
    // );
    // setBalance(
    //   ((await window.metaidwallet?.btc.getBalance())?.confirmed ?? 0).toString()
    // );
    // setIsCreating(true);

    // const res = await btcConnector
    //   .createUserInfo({
    //     userData: { ...userInfo },
    //     options: {
    //       feeRate: Number(globalFeeRate),
    //       network: environment.network,
    //     },
    //   })
    //   .catch((error: any) => {
    //     setIsCreating(false);

    //     const errorMessage = TypeError(error).message;

    //     const toastMessage = errorMessage?.includes(
    //       'Cannot read properties of undefined'
    //     )
    //       ? 'User Canceled'
    //       : errorMessage;
    //     toast.error(toastMessage);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   });

    // if (!res) {
    //   toast.error('Create Failed');
    // } else {
    //   // toast.success("Successfully created!Now you can connect your wallet again!");
    //   setUserInfo(await btcConnector.getUser({ network: environment.network }));
    //   queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    //   const success_modal = document.getElementById(
    //     'create_metaid_success_modal'
    //   ) as HTMLDialogElement;
    //   success_modal.showModal();
    // }

    // setIsCreating(false);
    // console.log('your metaid', btcConnector.metaid);
    // const doc_modal = document.getElementById(
    //   'create_metaid_modal'
    // ) as HTMLDialogElement;
    // doc_modal.close();
    // await onWalletConnectStart();
  };

  return (
    <LoadingOverlay active={isCreating} spinner text='Creating MetaID...'>
      <CreateMetaIdInfoForm
        onSubmit={handleCreateMetaID}
        address={wallet?.address ?? ''}
        balance={balance}
      />
    </LoadingOverlay>
  );
};

export default CreateMetaIDFormWrap;
