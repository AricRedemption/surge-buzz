/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { createBuzz } from '../api/buzz';
import BuzzForm from "./BuzzForm";
import TweetForm, { BuzzData } from "./TweetForm";
// import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import LoadingOverlay from "react-loading-overlay-ts";
// import dayjs from 'dayjs';
import { useAtomValue } from "jotai";
import { isEmpty, isNil } from "ramda";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { globalFeeRateAtom } from "../../store/user";
// import { sleep } from '../../utils/time';
import { SubmitHandler, useForm } from "react-hook-form";
import { image2Attach, removeFileFromList } from "../../utils/file";
import useImagesPreview from "../../hooks/useImagesPreview";
import { CreateOptions, IBtcConnector, IBtcEntity } from "@metaid/metaid";
import { environment } from "../../utils/environments";
import { Pin, Tweet } from "../../api/request";
import { Module, PackageId, StateId, SuiNetwork } from "../../config";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { parseData, store } from "../../utils/walrus";

type Iprops = {
  btcConnector: IBtcConnector;
  quotePin?: Pin | Tweet;
};

const BuzzFormWrap = ({ quotePin }: Iprops) => {
  const isQuoted = !isNil(quotePin);
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);

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

  // const globalFeerate = useAtomValue(globalFeeRateAtom);
  // const queryClient = useQueryClient();
  const buzzFormHandle = useForm<BuzzData>();
  const files = buzzFormHandle.watch("images");
  console.log(files);

  const [filesPreview, setFilesPreview] = useImagesPreview(files);

  const onClearImageUploads = () => {
    setFilesPreview([]);
    buzzFormHandle.setValue("images", [] as any);
  };

  const onCreateSubmit: SubmitHandler<BuzzData> = async (data) => {
    await handleAddBuzz(data);
  };

  const handleAddBuzz = async (buzz: { content: string; images: FileList }) => {
    setIsAdding(true);
    try {
      const images = await Promise.all(
        Array.from(buzz.images).map((image) => {
          return store(image, false);
        })
      );

      const url = await store({
        ...buzz,
        images,
      });

      const info = await parseData(url);

      console.log("info", info);

      const tx = new Transaction();

      if (isQuoted) {
        tx.moveCall({
          target: `${PackageId}::${Module}::comment`,
          arguments: [
            tx.object(quotePin.id),
            tx.pure.string(url),
            tx.object(StateId),
          ],
        });
      } else {
        tx.moveCall({
          target: `${PackageId}::${Module}::create_tweet`,
          arguments: [tx.pure.string(url), tx.object(StateId)],
        });
      }

      tx.setGasBudget(10000000);

      const { digest } = await signAndExecuteTransaction({
        transaction: tx,
        chain: `sui:${SuiNetwork}`,
      });
      console.log("digest", digest);

      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      window.location.reload();

      toast.success(`${isQuoted ? "repost" : "create"} buzz successfully`);
      buzzFormHandle.reset();
      onClearImageUploads();

      const doc_modal = document.getElementById(
        isQuoted ? "repost_buzz_modal_" + quotePin.id : "new_buzz_modal"
      ) as HTMLDialogElement;
      doc_modal.close();
    } catch (error) {
      console.log("error", error);
      const errorMessage = (error as any)?.message ?? error;
      const toastMessage = errorMessage?.includes(
        "Cannot read properties of undefined"
      )
        ? "User Canceled"
        : errorMessage;

      toast.error(toastMessage, {
        className:
          "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // const handleAddBuzz = async (buzz: {
  //   content: string;
  //   images: AttachmentItem[];
  // }) => {
  //   setIsAdding(true);
  //   const buzzEntity: IBtcEntity = await btcConnector.use('buzz');
  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const finalBody: any = {
  //       content: buzz.content,
  //       contentType: 'text/plain',
  //     };
  //     if (!isEmpty(buzz.images)) {
  //       const fileOptions: CreateOptions[] = [];

  //       const fileEntity = await btcConnector!.use('file');

  //       for (const image of buzz.images) {
  //         fileOptions.push({
  //           body: Buffer.from(image.data, 'hex').toString('base64'),
  //           contentType: `${image.fileType};binary`,
  //           encoding: 'base64',
  //           flag: environment.flag,
  //         });
  //       }
  //       const imageRes = await fileEntity.create({
  //         dataArray: fileOptions,
  //         options: {
  //           noBroadcast: 'no',
  //           feeRate: Number(globalFeerate),
  //           service: {
  //             address: environment.service_address,
  //             satoshis: environment.service_staoshi,
  //           },
  //           // network: environment.network,
  //         },
  //       });

  //       console.log('imageRes', imageRes);
  //       finalBody.attachments = imageRes.revealTxIds.map(
  //         (rid) => 'metafile://' + rid + 'i0'
  //       );
  //     }
  //     //   await sleep(5000);

  //     console.log('finalBody', finalBody);
  //     if (!isNil(quotePin)) {
  //       finalBody.quotePin = quotePin.id;
  //     }

  //     const createRes = await buzzEntity!.create({
  //       dataArray: [
  //         {
  //           body: JSON.stringify(finalBody),
  //           contentType: 'text/plain;utf-8',
  //           flag: environment.flag,
  //         },
  //       ],
  //       options: {
  //         noBroadcast: 'no',
  //         feeRate: Number(globalFeerate),
  //         service: {
  //           address: environment.service_address,
  //           satoshis: environment.service_staoshi,
  //         },
  //         // network: environment.network,
  //       },
  //     });
  //     console.log('create res for inscribe', createRes);
  //     if (!isNil(createRes?.revealTxIds[0])) {
  //       // await sleep(5000);
  //       queryClient.invalidateQueries({ queryKey: ['buzzes'] });
  //       toast.success(`${isQuoted ? 'repost' : 'create'} buzz successfully`);
  //       buzzFormHandle.reset();
  //       onClearImageUploads();

  //       const doc_modal = document.getElementById(
  //         isQuoted ? 'repost_buzz_modal_' + quotePin.id : 'new_buzz_modal'
  //       ) as HTMLDialogElement;
  //       doc_modal.close();
  //     }
  //   } catch (error) {
  //     console.log('error', error);
  //     const errorMessage = (error as any)?.message ?? error;
  //     const toastMessage = errorMessage?.includes(
  //       'Cannot read properties of undefined'
  //     )
  //       ? 'User Canceled'
  //       : errorMessage;
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     toast.error(toastMessage, {
  //       className:
  //         '!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg',
  //     });
  //     setIsAdding(false);
  //   }
  //   setIsAdding(false);
  // };

  // console.log('select feerate', selectFeeRate);
  // console.log('feerate data', feeRateData);
  const handleRemoveImage = (index: number) => {
    setFilesPreview(filesPreview.filter((_, i) => i !== index));
    buzzFormHandle.setValue(
      "images",
      removeFileFromList(buzzFormHandle.watch("images"), index)
    );
    // remove item from  files object with index
  };

  return (
    <>
      {/* <img src="" alt="" /> */}
      <LoadingOverlay active={isAdding} spinner text="Creating Buzz...">
        {(quotePin as Pin)?.metaid ? (
          <BuzzForm
            onCreateSubmit={onCreateSubmit}
            handleRemoveImage={handleRemoveImage}
            buzzFormHandle={buzzFormHandle}
            onClearImageUploads={onClearImageUploads}
            filesPreview={filesPreview}
            quotePin={quotePin as Pin}
          />
        ) : (
          <TweetForm
            onCreateSubmit={onCreateSubmit}
            handleRemoveImage={handleRemoveImage}
            buzzFormHandle={buzzFormHandle}
            onClearImageUploads={onClearImageUploads}
            filesPreview={filesPreview}
            quotePin={quotePin as Tweet}
          />
        )}
      </LoadingOverlay>
    </>
  );
};

export default BuzzFormWrap;

// const AddBuzz = () => {
// 	const queryClient = useQueryClient();

// 	const createBuzzMutation = useMutation({
// 		mutationFn: createBuzz,
// 		onSuccess: async () => {
// 			await queryClient.invalidateQueries({ queryKey: ["buzzes"] });
// 			toast.success("create buzz success!");
// 			const doc_modal = document.getElementById("new_buzz_modal") as HTMLDialogElement;
// 			doc_modal.close();
// 		},
// 	});

// 	const handleAddBuzz = (buzz: BuzzNewForm) => {kl
// 		const id = uuidv4();
// 		createBuzzMutation.mutate({
// 			...buzz,
// 			id,
// 			createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
// 			user: "vae",
// 			isFollowed: false,
// 			txid: id,
// 		});
// 	};

// 	return (
// 		<LoadingOverlay active={createBuzzMutation.isPending} spinner text="Buzz is Creating...">
// 			<BuzzForm onSubmit={handleAddBuzz} initialValue={{ content: "", createTime: "" }} />{" "}
// 		</LoadingOverlay>
// 	);
// };

// export default AddBuzz;
