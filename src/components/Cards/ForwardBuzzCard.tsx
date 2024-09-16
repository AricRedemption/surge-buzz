/* eslint-disable @typescript-eslint/no-explicit-any */
// import FollowButton from "../Buttons/FollowButton";
import { Link as LucideLink } from 'lucide-react';
import { isEmpty, isNil } from 'ramda';
import cls from 'classnames';
import dayjs from 'dayjs';
import { useQueries, useQuery } from '@tanstack/react-query';
import { btcConnectorAtom } from '../../store/user';
import { useAtomValue } from 'jotai';
import CustomAvatar from '../Public/CustomAvatar';
// import { sleep } from '../../utils/time';
import { getPinDetailByPid } from '../../api/buzz';
import { environment } from '../../utils/environments';
import { Pin } from '../../api/request';
import ProfileCard from './ProfileCard';

type IProps = {
  buzzItem: Pin | undefined;
};

const ForwardBuzzCard = ({ buzzItem }: IProps) => {
  const hideActionButtons = true;

  const btcConnector = useAtomValue(btcConnectorAtom);

  const isFromBtc = buzzItem?.chainName === 'btc';
  let summary = buzzItem!.contentSummary;
  const isSummaryJson = summary.startsWith('{') && summary.endsWith('}');
  // console.log("isjson", isSummaryJson);
  // console.log("summary", summary);
  const parseSummary = isSummaryJson ? JSON.parse(summary) : {};

  summary = isSummaryJson ? parseSummary.content : summary;

  const attachPids =
    isSummaryJson && !isEmpty(parseSummary?.attachments ?? []) && isFromBtc
      ? (parseSummary?.attachments ?? []).map(
          (d: string) => d.split('metafile://')[1]
        )
      : [];

  // const attachPids = ["6950f69d7cb83a612fc773d95500a137888f157f1d377cc69c2dd703eebd84eei0"];
  // console.log("current address", buzzItem!.address);

  const currentUserInfoData = useQuery({
    queryKey: ['userInfo', buzzItem!.address, environment.network],
    queryFn: () =>
      btcConnector?.getUser({
        network: environment.network,
        currentAddress: buzzItem!.address,
      }),
  });
  const metaid = currentUserInfoData?.data?.metaid;

  const attachData = useQueries({
    queries: attachPids.map((id: string) => {
      return {
        queryKey: ['post', id],
        queryFn: () => getPinDetailByPid({ pid: id }),
      };
    }),
    combine: (results: any) => {
      return {
        data: results.map((result: any) => result.data),
        pending: results.some((result: any) => result.isPending),
      };
    },
  });

  const renderImages = (pinIds: string[]) => {
    if (pinIds.length === 1) {
      return (
        <>
          <img
            onClick={() => {
              handleImagePreview(pinIds[0]);
            }}
            className='image h-[60%] w-[60%] !rounded-md'
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            src={`${environment.base_man_url}/content/${pinIds[0]}`}
            alt=''
            key={pinIds[0]}
          />
          <dialog id={`preview_modal_${pinIds[0]}`} className='modal  !z-20'>
            <div className='modal-box bg-[#191C20] !z-20 py-5  w-[90%] lg:w-[50%]'>
              <form method='dialog'>
                {/* if there is a button in form, it will close the modal */}
                <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
                  ✕
                </button>
              </form>
              <h3 className='font-medium text-white text-[16px] text-center'>
                Image Preview
              </h3>

              <img
                className='image w-auto mt-6 !rounded-md'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%',
                }}
                src={`${environment.base_man_url}/content/${pinIds[0]}`}
                alt=''
              />
            </div>
            <form method='dialog' className='modal-backdrop'>
              <button>close</button>
            </form>
          </dialog>
        </>
      );
    }
    return (
      <>
        <div className='grid grid-cols-3 gap-2 place-items-center'>
          {pinIds.map((pinId) => {
            return (
              <div key={pinId}>
                <img
                  className='image !rounded-md'
                  onClick={() => {
                    handleImagePreview(pinId);
                  }}
                  style={{
                    objectFit: 'cover',
                    // objectPosition: 'center',

                    width: '220px',
                    height: '200px',
                  }}
                  src={`${environment.base_man_url}/content/${pinId}`}
                  alt=''
                  key={pinId}
                />
                <dialog id={`preview_modal_${pinId}`} className='modal  !z-20'>
                  <div className='modal-box bg-[#191C20] !z-20 py-5 w-[90%] lg:w-[50%]'>
                    <form method='dialog'>
                      {/* if there is a button in form, it will close the modal */}
                      <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
                        ✕
                      </button>
                    </form>
                    <h3 className='font-medium text-white text-[16px] text-center'>
                      Image Preview
                    </h3>
                    <img
                      className='image h-[48px] w-auto mt-6 !rounded-md'
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                      src={`${environment.base_man_url}/content/${pinId}`}
                      alt=''
                    />
                  </div>
                  <form method='dialog' className='modal-backdrop'>
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
      .replace('<metaid_flag>', 'metaid_flag')
      .replace('<operation>', 'operation')
      .replace('<path>', 'path')
      .replace('<encryption>', 'encryption')
      .replace('<version>', 'version')
      .replace('<content-type>', 'content-type')
      .replace('<payload>', 'payload');
    return summary;
  };

  const renderBasicSummary = (summary: string) => {
    return (
      <div className='flex flex-col gap-2.5'>
        {(summary ?? '').split('\n').map((line, index) => (
          <span key={index} className='break-all'>
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
              renderBasicSummary(summary)
            ) : (
              <div className=''>
                {renderBasicSummary(summary.slice(0, 800) + '...')}
                <span className=' text-main'>{' more >>'}</span>
              </div>
            )}
          </>
        ) : (
          renderBasicSummary(summary)
        )}
      </>
    );
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (isNil(buzzItem)) {
    return <div>can't fetch this buzz</div>;
  }

  return (
    <>
      <div
        className={cls(
          'w-full border border-white rounded-xl flex flex-col gap-4',
          {
            'border-white/20  bg-[#000000cb]': hideActionButtons,
          }
        )}
      >
        <div className='flex items-center justify-between pt-4 px-4'>
          <div className='dropdown dropdown-hover'>
            <div
              tabIndex={0}
              role='button'
              className='flex gap-2 items-center cursor-pointer'
            >
              {isNil(currentUserInfoData.data) ? (
                <div className='avatar placeholder'>
                  <div className='bg-[#2B3440] text-[#D7DDE4] rounded-full w-12'>
                    <span>{buzzItem!.metaid.slice(0, 6)}</span>
                  </div>
                </div>
              ) : (
                <CustomAvatar userInfo={currentUserInfoData.data} />
              )}
              <div className='flex flex-col md:text-md text-sm'>
                <div className='text-slate-200'>
                  {isNil(currentUserInfoData?.data?.name) ||
                  isEmpty(currentUserInfoData?.data?.name)
                    ? 'metaid-user-' + buzzItem.address.slice(0, 6)
                    : currentUserInfoData?.data?.name}
                </div>
                <div className='text-gray text-xs'>
                  {(metaid ?? '').slice(0, 6)}
                </div>
              </div>
            </div>

            <div tabIndex={0} className='dropdown-content'>
              <ProfileCard address={buzzItem.address} isDropdown />
            </div>
          </div>
        </div>
        <div
          className={cls('border-t  border-white p-4', {
            'border-white/20': hideActionButtons,
          })}
        >
          <div className='flex flex-col gap-2'>
            {renderSummary(summary, false)}
          </div>
          <div className='mt-4'>
            {!attachData.pending &&
              !isEmpty(
                (attachData?.data ?? []).filter((d: any) => !isNil(d))
              ) &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderImages(attachPids)}
          </div>

          <div className='flex justify-between text-gray mt-2'>
            <div
              className='flex gap-2 items-center hover:text-slate-300 md:text-md text-xs'
              onClick={() => {
                window.open(
                  `https://mempool.space/${
                    environment.network === 'mainnet' ? '' : 'testnet/'
                  }tx/${buzzItem.genesisTransaction}`,
                  '_blank'
                );
              }}
            >
              <LucideLink size={12} />
              <div>{buzzItem.genesisTransaction.slice(0, 8) + '...'}</div>
            </div>
            <div className='flex gap-2 md:text-md text-xs items-center'>
              {buzzItem?.number === -1 && (
                <div
                  className='tooltip tooltip-secondary mt-0.5'
                  data-tip='This buzz(PIN) is still in the mempool...'
                >
                  <span className='loading loading-ring loading-sm cursor-pointer'></span>
                </div>
              )}

              <div>
                {dayjs.unix(buzzItem.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForwardBuzzCard;
