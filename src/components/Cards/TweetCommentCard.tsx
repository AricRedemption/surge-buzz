import { LucideLink } from "lucide-react";
import dayjs from "../../utils/dayjsConfig";
import { IBtcConnector } from "@metaid/metaid";
import { Comment } from "../../api/request";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Module, PackageId, SuiNetwork } from "../../config";
import Avatar from "../Public/Avatar";
import { useEffect, useState } from "react";
import { parseData } from "../../utils/walrus";

type Iprops = {
  commentRes: Comment & { content: string; digest: string; timestamp: number };
  btcConnector: IBtcConnector;
};

const CommentCard = ({ commentRes }: Iprops) => {
  console.log("commentRes", commentRes);

  const { data: currentUserInfoData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: commentRes.commenter,
      filter: {
        StructType: `${PackageId}::${Module}::Profile`,
      },
      options: {
        showContent: true,
      },
    },
    {
      gcTime: 10000,
      enabled: !!commentRes.creator,
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

  const [content, setContent] = useState<{
    content: string;
    images: string[];
  }>();

  useEffect(() => {
    const fetchData = async () => {
      if (commentRes.content) {
        const data = await parseData(commentRes.content);
        setContent(data);
      }
    };

    fetchData();
  }, [commentRes.content]);

  return (
    <>
      <div className="flex gap-2.5">
        <Avatar size="36px" userInfo={currentUserInfoData} />
        <div className="flex flex-col gap-2 mt-2 w-full">
          <div>{currentUserInfoData?.name ?? "MetaID-User"}</div>
          <div>{content?.content}</div>
          <div className="flex justify-between text-gray text-xs mt-2">
            <div className=" flex gap-2">
              <div className="flex gap-1 items-center hover:text-slate-300 cursor-pointer">
                <LucideLink size={12} />
                <div
                  onClick={() => {
                    window.open(
                      `https://suiscan.xyz/${SuiNetwork}/tx/${commentRes.digest}`,
                      "_blank"
                    );
                  }}
                >
                  {(commentRes?.digest ?? "").slice(0, 8) + "..."}
                </div>
              </div>
              <div>
                {dayjs(Number(commentRes.timestamp)).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
              </div>
            </div>
            {/* <div
              className='hover:text-slate-300 cursor-pointer'
              onClick={async () => {
                await checkMetaletInstalled();
                await checkMetaletConnected(connected);
                (document.getElementById(
                  'reply_buzz_modal_' + commentPin.id
                ) as HTMLDialogElement)!.showModal();
              }}
            >
              Reply
            </div> */}
          </div>
          {/* {hasSubComment && (
            <SubCommentCard
              commentPin={commentPin}
              btcConnector={btcConnector!}
              commentUserInfo={commentUserInfo}
            />
          )} */}
        </div>
      </div>
      {/* <ReplyModal
        commentPin={commentPin}
        btcConnector={btcConnector!}
        commentToUser={commentUserInfo}
      /> */}
    </>
  );
};

export default CommentCard;
