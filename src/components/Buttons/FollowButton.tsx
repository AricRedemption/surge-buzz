import { CheckCheck } from 'lucide-react';
import cls from 'classnames';
type Iprops = {
  handleFollow: () => void;
  isFollowed: boolean;
  isFollowingPending: boolean;
  isUnfollowingPending: boolean;
};
const FollowButton = ({
  handleFollow,
  isFollowed,
  isFollowingPending,
  isUnfollowingPending,
}: Iprops) => {
  return (
    <div
      onClick={() => {
        if (isFollowingPending || isUnfollowingPending) {
          return;
        }
        handleFollow();
      }}
    >
      {isFollowed && !isFollowingPending && !isUnfollowingPending ? (
        <div className='btn btn-ghost btn-sm text-gray '>
          <CheckCheck /> Followed
        </div>
      ) : (
        <button
          className={cls(
            'btn btn-outline flex items-center btn-sm btn-primary rounded-full w-[100px]',
            {
              'btn-disabled cursor-not-allowed !bg-main/20 !border-none w-[130px]':
                isFollowingPending || isUnfollowingPending,
            }
          )}
        >
          {(isFollowingPending || isUnfollowingPending) && (
            <span className='loading loading-spinner loading-xs text-main/25'></span>
          )}
          {isFollowingPending ? (
            <span className='text-main/25'>Following</span>
          ) : isUnfollowingPending ? (
            <span className='text-main/25'>Unfollowing</span>
          ) : (
            'Follow'
          )}
        </button>
      )}
    </div>
  );
};

export default FollowButton;
