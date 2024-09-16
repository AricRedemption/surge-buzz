import { useParams } from "react-router-dom";
import BackButton from "../components/Buttons/BackButton";
import BuzzCard from "../components/Cards/SurgeBuzzCard";

import CommentCard from "../components/Cards/TweetCommentCard";
import { useAtomValue } from "jotai";
import { btcConnectorAtom } from "../store/user";
import cls from "classnames";
import { useSuiClientInfiniteQuery, useSuiClientQuery } from "@mysten/dapp-kit";
import { Module, PackageId } from "../config";
import { useMemo } from "react";

const Buzz = () => {
  const { id: tempId } = useParams();
  const btcConnector = useAtomValue(btcConnectorAtom);

  const { data: tweets, isLoading } = useSuiClientInfiniteQuery(
    "queryTransactionBlocks",
    {
      filter: {
        MoveFunction: {
          package: PackageId,
          module: Module,
          function: "create_tweet",
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
            page.data
              ?.flatMap(
                (item: any) =>
                  item.events?.map((event: any) => ({
                    ...event.parsedJson,
                    digest: item.digest,
                    timestamp: item.timestampMs,
                  })) || []
              )
              .filter((item: any) => item.id === tempId) || []
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
                    digest: item.digest,
                    timestamp: item.timestampMs,
                  }))
                  .filter((item: any) => {
                    return item.tweet_id === tempId;
                  }) || []
            ) || []
        );
      },
    }
  );

  const commentsNum = useMemo(() => comments?.length || 0, [comments]);

  const { data: commentsInfoData } = useSuiClientQuery(
    "getObject",
    {
      id: tempId!,
      options: {
        showContent: true,
      },
    },
    {
      gcTime: 10000,
      enabled: !!tempId,
      select: (data: any) => {
        if (
          data.data &&
          data.data.content &&
          data.data.content.fields &&
          data.data.content.fields.comments
        ) {
          return data.data.content.fields.comments.reverse();
        } else {
          throw new Error("No comments found in the provided data.");
        }
      },
    }
  );

  return (
    <>
      <div>
        <BackButton />
        <div className="mt-6">
          {isLoading ? (
            <div className="grid place-items-center h-[200px]">
              <span className="loading loading-ring loading-lg grid text-white"></span>
            </div>
          ) : (
            <BuzzCard buzzItem={tweets![0]} />
          )}
        </div>
        <div className="my-6">{`Comment (${commentsNum})`}</div>
        <div
          className={cls({
            "border border-white rounded-md p-4": commentsNum > 0,
          })}
        >
          {(comments ?? []).map((comment, index) => {
            return (
              <div key={comment.id}>
                <CommentCard
                  commentRes={{
                    ...comment,
                    content: commentsInfoData?.[index] || "",
                  }}
                  btcConnector={btcConnector!}
                />
                {index + 1 !== commentsNum && commentsNum > 1 && (
                  <div className="  border-gray/20 !border-t-[0.1px] my-4"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Buzz;
