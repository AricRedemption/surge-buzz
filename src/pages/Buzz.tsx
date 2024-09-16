import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchCurrentBuzzComments, getPinDetailByPid } from '../api/buzz';
import BackButton from '../components/Buttons/BackButton';
import BuzzCard from '../components/Cards/BuzzCard';

import CommentCard from '../components/Cards/CommentCard';
import { useAtomValue } from 'jotai';
import { btcConnectorAtom } from '../store/user';
import { isNil } from 'ramda';
import cls from 'classnames';

const Buzz = () => {
  const { id: tempId } = useParams();
  const id = tempId ?? '';
  const btcConnector = useAtomValue(btcConnectorAtom);

  const { isLoading, data: buzzDetailData } = useQuery({
    queryKey: ['buzzDetail', id],
    queryFn: () => getPinDetailByPid({ pid: id! }),
  });

  const commentData = useQuery({
    enabled: !isNil(id),
    queryKey: ['comment-detail', id],
    queryFn: () => fetchCurrentBuzzComments({ pinId: id }),
  });

  console.log('commentData', commentData);
  const commentsNum = (commentData?.data ?? []).length;
  return (
    <>
      <div>
        <BackButton />
        <div className='mt-6'>
          {isLoading ? (
            <div className='grid place-items-center h-[200px]'>
              <span className='loading loading-ring loading-lg grid text-white'></span>
            </div>
          ) : (
            <BuzzCard buzzItem={buzzDetailData} />
          )}
        </div>
        <div className='my-6'>{`Comment (${commentsNum})`}</div>
        <div
          className={cls({
            'border border-white rounded-md p-4': commentsNum > 0,
          })}
        >
          {(commentData?.data ?? []).map((comment, index) => {
            return (
              <div key={comment.pinId}>
                <CommentCard
                  commentRes={comment}
                  btcConnector={btcConnector!}
                />
                {index + 1 !== commentsNum && commentsNum > 1 && (
                  <div className='  border-gray/20 !border-t-[0.1px] my-4'></div>
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
