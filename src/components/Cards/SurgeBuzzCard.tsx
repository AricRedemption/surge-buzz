/* eslint-disable @typescript-eslint/no-explicit-any */
// import FollowButton from "../Buttons/FollowButton";
import { Heart, Link as LucideLink, MessageCircle } from "lucide-react";
import { Send } from "lucide-react";
import { isEmpty, isNil } from "ramda";
import cls from "classnames";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  btcConnectorAtom,
  connectedAtom,
  globalFeeRateAtom,
  myFollowingListAtom,
  userInfoAtom,
} from "../../store/user";
import { useAtom, useAtomValue } from "jotai";
// import { sleep } from '../../utils/time';
import { toast } from "react-toastify";
import {
  fetchCurrentBuzzComments,
  fetchCurrentBuzzLikes,
  fetchFollowDetailPin,
  fetchFollowingList,
  getPinDetailByPid,
} from "../../api/buzz";
import {
  checkMetaletConnected,
  checkMetaletInstalled,
  checkUserNameExisted,
} from "../../utils/wallet";
import { environment } from "../../utils/environments";
import FollowButton from "../Buttons/FollowButton";
import { Tweet } from "../../api/request";
import { useNavigate } from "react-router-dom";
import ProfileCard from "./ProfileCard";
import ForwardBuzzCard from "./ForwardBuzzCard";
import { fetchTranlateResult, ResultArray } from "../../api/baidu-translate";
import { useEffect, useMemo, useState } from "react";
import dayjs from "../../utils/dayjsConfig";
import CommentModal from "../Modals/CommentModal";
import RepostModal from "../Modals/TweetRepostModal";
import { Module, PackageId, StateId, SuiNetwork } from "../../config";
import {
  useCurrentWallet,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientInfiniteQuery,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { parseData } from "../../utils/walrus";
import { getMetaId } from "../../utils/metaId";
import Avatar from "../Public/Avatar";
import { errors } from "../../utils/errors";
import { Transaction } from "@mysten/sui/transactions";

type IProps = {
  buzzItem: Tweet;
  onBuzzDetail?: (txid: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  showFollowButton?: boolean;
};

const BuzzCard = ({
  buzzItem,
  onBuzzDetail,
  innerRef,
  showFollowButton = true,
}: IProps) => {
  const [showTranslateResult, setShowTranslateResult] = useState(false);
  const [translateResult, setTranslateResult] = useState<ResultArray>([]);
  const [myFollowingList, setMyFollowingList] = useAtom(myFollowingListAtom);
  const connected = useAtomValue(connectedAtom);
  const btcConnector = useAtomValue(btcConnectorAtom);
  const globalFeeRate = useAtomValue(globalFeeRateAtom);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [content, setContent] = useState<{
    content: string;
    images: string[];
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if (buzzItem.content) {
        const data = await parseData(buzzItem.content);
        setContent(data);
      }
    };

    fetchData();
  }, [buzzItem.content]);

  const { isConnected, currentWallet } = useCurrentWallet();

  const address = useMemo(
    () => currentWallet?.accounts[0].address,
    [currentWallet]
  );

  // console.log('buzzitem', buzzItem);
  let summary = buzzItem!.content;
  const isSummaryJson = summary.startsWith("{") && summary.endsWith("}");
  // console.log("isjson", isSummaryJson);
  // console.log("summary", summary);
  const parseSummary = isSummaryJson ? JSON.parse(summary) : {};

  summary = isSummaryJson ? parseSummary.content : summary;

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

  const { data: likes } = useSuiClientInfiniteQuery(
    "queryTransactionBlocks",
    {
      filter: {
        // FIXME: add FromAddress or ToAddress
        // FromAddress: address,
        // ToAddress: address,
        MoveFunction: {
          package: PackageId,
          module: Module,
          function: "like_tweet",
        },
      },
      options: {
        showEvents: true,
        showEffects: true,
      },
    },
    {
      gcTime: 10000,
      select: (data) => {
        if (!data || !data.pages) {
          throw new Error("No pages found in the provided data.");
        }

        return data.pages.flatMap(
          (page: any) =>
            page.data?.flatMap(
              (item: any) =>
                item.events
                  ?.map((event: any) => ({
                    ...event.parsedJson,
                  }))
                  .filter((item: any) => item.tweet_id === buzzItem.id) || []
            ) || []
        );
      },
    }
  );

  const { data: comments } = useSuiClientInfiniteQuery(
    "queryTransactionBlocks",
    {
      filter: {
        // FIXME: add FromAddress or ToAddress
        // FromAddress: address,
        // ToAddress: address,
        MoveFunction: {
          package: PackageId,
          module: Module,
          function: "comment",
        },
      },
      options: {
        showEvents: true,
        showEffects: true,
      },
    },
    {
      gcTime: 10000,
      select: (data) => {
        if (!data || !data.pages) {
          throw new Error("No pages found in the provided data.");
        }

        return data.pages.flatMap(
          (page: any) =>
            page.data?.flatMap(
              (item: any) =>
                item.events
                  ?.map((event: any) => ({
                    ...event.parsedJson,
                  }))
                  .filter((item: any) => {
                    return item.tweet_id === buzzItem.id;
                  }) || []
            ) || []
        );
      },
    }
  );

  const translateMutate = useMutation({
    mutationKey: ["transDetail", buzzItem?.id],
    mutationFn: (summary: string) =>
      fetchTranlateResult({ sourceText: summary }),
  });

  const quotePinId =
    isSummaryJson && !isEmpty(parseSummary?.quotePin ?? "")
      ? parseSummary.quotePin
      : "";
  const { isLoading: isQuoteLoading, data: quoteDetailData } = useQuery({
    enabled: !isEmpty(quotePinId),
    queryKey: ["buzzDetail", quotePinId],
    queryFn: () => getPinDetailByPid({ pid: quotePinId }),
  });

  const isLikeByCurrentUser = useMemo(() => {
    if (address && likes?.length) {
      return (likes ?? []).find((d) => {
        return d?.liker === address && d?.tweet_id === buzzItem.id;
      });
    }
    return false;
  }, [likes, address, buzzItem.id]);

  const { data: currentUserInfoData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: buzzItem.creator,
      filter: {
        StructType: `${PackageId}::${Module}::Profile`,
      },
      options: {
        showContent: true,
      },
    },
    {
      gcTime: 10000,
      enabled: !!buzzItem.creator,
      select: (profileData) => {
        const content = profileData.data?.[profileData.data.length - 1]?.data
          ?.content as any;
        return {
          id: content.fields.id.id,
          name: content.fields.username,
          address: content.fields.address,
          avatarUrl: content.fields.photo_blob,
        };
      },
    }
  );
  const metaid = getMetaId(buzzItem.creator);

  const { data: myFollowingListData } = useQuery({
    queryKey: ["myFollowing", btcConnector?.metaid],
    enabled: !isEmpty(btcConnector?.metaid ?? ""),
    queryFn: () =>
      fetchFollowingList({
        metaid: btcConnector?.metaid ?? "",
        params: { cursor: "0", size: "100", followDetail: false },
      }),
  });

  const { data: followDetailData } = useQuery({
    queryKey: ["followDetail", btcConnector?.metaid, metaid],
    enabled: !isEmpty(btcConnector?.metaid ?? "") && !isEmpty(metaid),
    queryFn: () =>
      fetchFollowDetailPin({
        metaId: metaid ?? "",
        followerMetaId: btcConnector?.metaid ?? "",
      }),
  });

  const renderImages = (imgUrls: string[]) => {
    if (imgUrls.length === 1) {
      return (
        <>
          <img
            onClick={() => {
              handleImagePreview(imgUrls[0]);
            }}
            className="image h-[60%] w-[60%] !rounded-md"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={imgUrls[0]}
            alt=""
            key={imgUrls[0]}
          />
          <dialog id={`preview_modal_${imgUrls[0]}`} className="modal  !z-20">
            <div className="modal-box bg-[#191C20] !z-20 py-5  w-[90%] lg:w-[50%]">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5">
                  ✕
                </button>
              </form>
              <h3 className="font-medium text-white text-[16px] text-center">
                Image Preview
              </h3>

              <img
                className="image w-auto mt-6 !rounded-md"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                  width: "100%",
                  height: "100%",
                }}
                src={imgUrls[0]}
                alt=""
              />
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </>
      );
    }
    return (
      <>
        <div className="grid grid-cols-3 gap-2 place-items-center">
          {imgUrls.map((imgUrl) => {
            return (
              <div key={imgUrl}>
                <img
                  className="image !rounded-md self-center"
                  onClick={() => {
                    handleImagePreview(imgUrl);
                  }}
                  style={{
                    objectFit: "cover",
                    // objectPosition: 'center',

                    width: "250px",
                    height: "250px",
                  }}
                  src={imgUrl}
                  alt=""
                  key={imgUrl}
                />
                <dialog id={`preview_modal_${imgUrl}`} className="modal  !z-20">
                  <div className="modal-box bg-[#191C20] !z-20 py-5 w-[90%] lg:w-[50%]">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button className="border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5">
                        ✕
                      </button>
                    </form>
                    <h3 className="font-medium text-white text-[16px] text-center">
                      Image Preview
                    </h3>
                    <img
                      className="image h-[48px] w-auto mt-6 !rounded-md"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        width: "100%",
                        height: "100%",
                      }}
                      src={imgUrl}
                      alt=""
                    />
                  </div>
                  <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                  </form>
                </dialog>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const handleImagePreview = (pinId: string) => {
    const preview_modal = document.getElementById(
      `preview_modal_${pinId}`
    ) as HTMLDialogElement;
    preview_modal.showModal();
  };

  const detectUrl = (summary: string) => {
    const urlReg = /(https?:\/\/[^\s]+)/g;

    const urls = summary.match(urlReg);

    if (urls) {
      urls.forEach(function (url) {
        // const replacement = (
        //   <div
        //     dangerouslySetInnerHTML={{
        //       __html: `<a href="${url}" style="text-decoration: underline;">${url}</a>`,
        //     }}
        //   />
        // );
        summary = summary.replace(
          url,
          `<a href="${url}" target="_blank" style="text-decoration: underline;">${url}</a>`
        );
      });
    }

    return summary;
  };

  const handleSpecial = (summary: string) => {
    summary = summary
      .replace("<metaid_flag>", "metaid_flag")
      .replace("<operation>", "operation")
      .replace("<path>", "path")
      .replace("<encryption>", "encryption")
      .replace("<version>", "version")
      .replace("<content-type>", "content-type")
      .replace("<payload>", "payload");
    return summary;
  };

  const renderTranslteResults = (results: ResultArray) => {
    return (
      <div className="flex flex-col gap-2.5">
        {results.map((result, index) => (
          <span key={index} className="break-all">
            <div>{result.dst.replace("<br>", "")}</div>

            {/* <br /> */}
          </span>
        ))}
      </div>
    );
  };

  const renderBasicSummary = (summary: string) => {
    return (
      <div className="flex flex-col gap-2.5">
        {(summary ?? "").split("\n").map((line, index) => (
          <span key={index} className="break-all">
            <div
              dangerouslySetInnerHTML={{
                __html: handleSpecial(detectUrl(line)),
              }}
            />
          </span>
        ))}
      </div>
    );
  };

  const renderSummary = (summary: string, showDetail: boolean) => {
    return (
      <>
        {showDetail ? (
          <>
            {summary.length < 800 ? (
              renderBasicSummary(content?.content || "")
            ) : (
              <div className="flex flex-col gap-0">
                {renderBasicSummary(summary.slice(0, 800) + "...")}
                <span className=" text-main">{" more >>"}</span>
              </div>
            )}
          </>
        ) : (
          renderBasicSummary(summary)
        )}
      </>
    );
  };

  const handleLike = async (tweetId: string) => {
    if (!isConnected) {
      toast.error(errors.NO_WALLET_CONNECTED, {
        className:
          "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
      });
      return;
    }

    if (isLikeByCurrentUser) {
      toast.error("You have already liked that buzz...", {
        className:
          "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
      });
      return;
    }

    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${PackageId}::${Module}::like_tweet`,
        arguments: [tx.object(tweetId), tx.object(StateId)],
      });

      tx.setGasBudget(10000000);

      const { digest } = await signAndExecuteTransaction({
        transaction: tx,
        chain: `sui:${SuiNetwork}`,
      });
      console.log("digest", digest);
      toast.success("like buzz successfully");
      // if (!isNil(likeRes?.revealTxIds[0])) {
      //   queryClient.invalidateQueries({ queryKey: ["buzzes"] });
      //   queryClient.invalidateQueries({ queryKey: ["payLike", buzzItem!.id] });
      //   // await sleep(5000);
      // }
    } catch (error) {
      console.log("error", error);
      const errorMessage = (error as any)?.message ?? error;
      const toastMessage = errorMessage?.includes(
        "Cannot read properties of undefined"
      )
        ? "User Canceled"
        : errorMessage;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error(toastMessage, {
        className:
          "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
      });
    }
  };

  const handleFollow = async () => {
    await checkMetaletInstalled();
    await checkMetaletConnected(connected);

    // const tx = new Transaction();
    // tx.moveCall({
    //   target: `${PackageId}::${Module}::create_tweet`,
    //   arguments: [tx.pure.string(url), tx.object(StateId)],
    // });

    // const doc_modal = document.getElementById(
    //   'confirm_follow_modal'
    // ) as HTMLDialogElement;
    // doc_modal.showModal();

    if (
      !isNil(followDetailData) &&
      (myFollowingListData?.list ?? []).includes(metaid)
    ) {
      try {
        const unfollowRes = await btcConnector!.inscribe({
          inscribeDataArray: [
            {
              operation: "revoke",
              path: `@${followDetailData.followPinId}`,
              contentType: "text/plain;utf-8",
              flag: environment.flag,
            },
          ],
          options: {
            noBroadcast: "no",
            feeRate: Number(globalFeeRate),
            service: {
              address: environment.service_address,
              satoshis: environment.service_staoshi,
            },
            // network: environment.network,
          },
        });
        if (!isNil(unfollowRes?.revealTxIds[0])) {
          queryClient.invalidateQueries({ queryKey: ["buzzes"] });
          setMyFollowingList((d) => {
            return d.filter((i) => i !== metaid);
          });
          // await sleep(5000);
          toast.success(
            "Unfollowing successfully!Please wait for the transaction to be confirmed."
          );
        }
      } catch (error) {
        console.log("error", error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          "Cannot read properties of undefined"
        )
          ? "User Canceled"
          : errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error(toastMessage, {
          className:
            "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
        });
      }
    } else {
      try {
        const followRes = await btcConnector!.inscribe({
          inscribeDataArray: [
            {
              operation: "create",
              path: "/follow",
              body: metaid,
              contentType: "text/plain;utf-8",

              flag: environment.flag,
            },
          ],
          options: {
            noBroadcast: "no",
            feeRate: Number(globalFeeRate),
            service: {
              address: environment.service_address,
              satoshis: environment.service_staoshi,
            },
            // network: environment.network,
          },
        });
        if (!isNil(followRes?.revealTxIds[0])) {
          queryClient.invalidateQueries({ queryKey: ["buzzes"] });
          setMyFollowingList((d: string[]) => {
            return [...d, metaid!];
          });
          // queryClient.invalidateQueries({
          //   queryKey: ['payLike', buzzItem!.id],
          // });
          // await sleep(5000);
          toast.success(
            "Follow successfully! Please wait for the transaction to be confirmed!"
          );
        }
      } catch (error) {
        console.log("error", error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          "Cannot read properties of undefined"
        )
          ? "User Canceled"
          : errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error(toastMessage, {
          className:
            "!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg",
        });
      }
    }
  };

  const onProfileDetail = (address: string) => {
    navigate(`/profile/${address}`);
  };

  const handleTranslate = async () => {
    if (isEmpty(translateResult)) {
      const res = await translateMutate.mutateAsync(content?.content || "");
      setTranslateResult(res?.trans_result ?? []);
    }
    setShowTranslateResult(!showTranslateResult);
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (isNil(buzzItem)) {
    return <div>can't fetch this buzz</div>;
  }

  return (
    <>
      <div
        className={cls(
          "w-full border border-white rounded-xl flex flex-col gap-4"
        )}
        ref={innerRef}
      >
        <div className="flex items-center justify-between pt-4 px-4">
          <div className="dropdown dropdown-hover dropdown-right">
            <div
              tabIndex={0}
              role="button"
              className="flex gap-2 items-center cursor-pointer"
            >
              {isNil(currentUserInfoData) ? (
                <div className="avatar placeholder">
                  <div className="bg-[#2B3440] text-[#D7DDE4] rounded-full w-12">
                    <span>{buzzItem!.id.slice(0, 6)}</span>
                  </div>
                </div>
              ) : (
                <Avatar
                  userInfo={currentUserInfoData}
                  onProfileDetail={onProfileDetail}
                />
              )}
              <div className="flex flex-col md:text-md text-sm">
                <div className="text-slate-200">
                  {isNil(currentUserInfoData?.name) ||
                  isEmpty(currentUserInfoData?.name)
                    ? "metaid-user-" + buzzItem.creator.slice(0, 6)
                    : currentUserInfoData?.name}
                </div>
                <div className="text-gray text-xs">
                  {(metaid ?? "").slice(0, 6)}
                </div>
              </div>
            </div>

            <div tabIndex={0} className="dropdown-content">
              <ProfileCard address={buzzItem.creator} isDropdown />
            </div>
          </div>

          {/* <FollowButton
            isFollowed={(myFollowingListData?.list ?? []).includes(metaid)}
            isFollowingPending={
              (myFollowingList ?? []).includes(metaid ?? "") &&
              !(myFollowingListData?.list ?? []).includes(metaid)
            }
            isUnfollowingPending={
              !(myFollowingList ?? []).includes(metaid ?? "") &&
              (myFollowingListData?.list ?? []).includes(metaid)
            }
            handleFollow={handleFollow}
          /> */}
        </div>
        <div
          className={cls("border-y  border-white p-4", {
            "cursor-pointer": !isNil(onBuzzDetail),
          })}
        >
          <div
            className="flex flex-col gap-2"
            onClick={() => onBuzzDetail && onBuzzDetail(buzzItem.id)}
          >
            {showTranslateResult
              ? renderTranslteResults(translateResult)
              : renderSummary(content?.content || "", !isNil(onBuzzDetail))}
            <div className="text-main mb-4 cursor-pointer">
              {translateMutate.isPending ? (
                <div className="loading loading-dots"></div>
              ) : (
                <div
                  onClick={async (e) => {
                    e.stopPropagation();
                    handleTranslate();
                  }}
                >
                  {showTranslateResult ? "show original content" : "translate"}
                </div>
              )}
            </div>
          </div>
          <div>
            {content?.images &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderImages(content?.images)}
          </div>
          {!isEmpty(quotePinId) && (
            <div className="mb-8">
              {isQuoteLoading ? (
                <div className="flex items-center gap-2 justify-center text-gray h-[150px]">
                  <div>Loading repost content...</div>
                  <span className="loading loading-bars loading-md grid "></span>
                </div>
              ) : (
                <ForwardBuzzCard buzzItem={quoteDetailData} />
              )}
            </div>
          )}

          <div className="flex justify-between text-gray mt-2">
            <div
              className="flex gap-2 items-center hover:text-slate-300 md:text-md text-xs"
              onClick={() => {
                window.open(
                  `https://suiscan.xyz/${SuiNetwork}/tx/${buzzItem.digest}`,
                  "_blank"
                );
              }}
            >
              <LucideLink size={12} />
              <div>{buzzItem.digest.slice(0, 8) + "..."}</div>
            </div>
            <div className="flex gap-2 md:text-md text-xs items-center">
              {dayjs(Number(buzzItem.timestamp)).format("YYYY-MM-DD HH:mm:ss")}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pb-4 px-4">
          <div className="flex gap-3 items-center">
            <div className="flex gap-1 items-center">
              <Heart
                className={cls(
                  { "text-[red]": isLikeByCurrentUser },
                  "cursor-pointer"
                )}
                fill={isLikeByCurrentUser ? "red" : ""}
                onClick={() => handleLike(buzzItem!.id)}
              />
              {!isNil(likes) ? likes.length !== 0 && likes.length : null}
            </div>
            <div className="flex gap-1 items-center cursor-pointer">
              {/* <Send */}
              <MessageCircle
                onClick={async () => {
                  (document.getElementById(
                    "repost_buzz_modal_" + buzzItem.id
                  ) as HTMLDialogElement)!.showModal();
                }}
              />
              {!isNil(comments?.length)
                ? comments.length !== 0 && comments.length
                : null}
            </div>
            {/* <div className="flex gap-1 items-center cursor-pointer">
              <MessageCircle
                onClick={async () => {
                  await checkMetaletInstalled();
                  await checkMetaletConnected(connected);
                  await checkUserNameExisted(userInfo?.name ?? "");

                  (document.getElementById(
                    "comment_buzz_modal_" + buzzItem.id
                  ) as HTMLDialogElement)!.showModal();
                }}
              />
              {!isNil(commentData?.data) ? commentData?.data.length : null}
            </div> */}
          </div>
          <div className="btn btn-sm rounded-full hidden">Want To Buy</div>
        </div>
      </div>

      <RepostModal quotePin={buzzItem} btcConnector={btcConnector!} />

      {/* <CommentModal
        commentPin={buzzItem}
        commentToUser={currentUserInfoData?.data}
        btcConnector={btcConnector!}
      /> */}
    </>
  );
};

export default BuzzCard;
