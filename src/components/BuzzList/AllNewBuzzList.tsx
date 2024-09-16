import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { IBtcConnector } from "@metaid/metaid";
import { environment } from "../../utils/environments";
import { isNil } from "ramda";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBuzzs } from "../../api/buzz";
import { Pin, Tweet } from "../../api/request";
import BuzzCard from "../Cards/BuzzCard";
import SurgeBuzzCard from "../Cards/SurgeBuzzCard";
import { btcConnectorAtom } from "../../store/user";
import { useSuiClientInfiniteQuery } from "@mysten/dapp-kit";
import { Module, PackageId } from "../../config";

type Iprops = {
  address?: string;
  queryKey?: string[];
  showFollowButton?: boolean;
};

const AllNewBuzzList = ({
  address,
  showFollowButton = true,
  queryKey = ["buzzes", environment.network],
}: Iprops) => {
  const [total, setTotal] = useState<null | number>(null);

  const navigate = useNavigate();
  const { ref, inView } = useInView();

  const btcConnector = useAtomValue(btcConnectorAtom);
  const getTotal = async (btcConnector: IBtcConnector) => {
    setTotal(
      await btcConnector?.totalPin({
        network: environment.network,
        path: ["/protocols/simplebuzz", "/protocols/banana"],
      })
    );
  };

  useEffect(() => {
    if (!isNil(btcConnector)) {
      getTotal(btcConnector!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [btcConnector]);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: [...queryKey],
      enabled: !isNil(btcConnector),

      queryFn: ({ pageParam }) =>
        fetchBuzzs({
          page: pageParam,
          limit: 5,
          btcConnector: btcConnector!,
          network: environment.network,
          path: ["/protocols/simplebuzz", "/protocols/banana"],
          address,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = lastPage?.length ? allPages.length + 1 : undefined;
        if (allPages.length * 5 >= (total ?? 0)) {
          return;
        }
        return nextPage;
      },
    });

  const { data: tweets } = useSuiClientInfiniteQuery(
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
      queryKey: ["tweets"],
      gcTime: 10000,
      select: (data) => {
        if (!data || !data.pages) {
          throw new Error("No pages found in the provided data.");
        }

        return data.pages.flatMap(
          (page: any) =>
            page.data?.flatMap(
              (item: any) =>
                item.events?.map((event: any) => ({
                  ...event.parsedJson,
                  digest: item.digest,
                  timestamp: item.timestampMs,
                })) || []
            ) || []
        );
      },
    }
  );

  // const buzzes = data?.pages.map((pins: Pin[] | null) =>
  //   (pins ?? []).map((pin) => {
  //     console.log("pin", pin);
  //     return (
  //       <BuzzCard
  //         key={pin.id}
  //         buzzItem={pin}
  //         onBuzzDetail={(txid) => navigate(`/buzz/${txid}`)}
  //         showFollowButton={showFollowButton}
  //       />
  //     );
  //   })
  // );

  const surgBuzzes = tweets?.map((tweet: Tweet) => (
    <SurgeBuzzCard
      key={tweet.id}
      buzzItem={tweet}
      onBuzzDetail={(txid) => navigate(`/tweet/${txid}`)}
      showFollowButton={showFollowButton}
    />
  ));

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  return (
    <>
      {isLoading ? (
        <div className="flex items-center gap-2 justify-center h-[200px]">
          <div>Buzz Feed is Coming</div>
          <span className="loading loading-bars loading-md grid text-white"></span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 my-4">
          {surgBuzzes}
          {/* {buzzes} */}
          <button
            ref={ref}
            className="btn"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {hasNextPage && isFetchingNextPage ? (
              <div className="flex items-center gap-1">
                <div>Loading </div>
                <span className="loading loading-dots loading-md grid text-white"></span>
              </div>
            ) : (
              //:
              // hasNextPage ? (
              // 	<div className="bg-[black]  grid w-full place-items-center">
              // 		Load More
              // 	</div>
              // )
              <div className=" place-items-center">No more results</div>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default AllNewBuzzList;
