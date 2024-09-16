// import FollowButton from "../Buttons/FollowButton";

type Iprops = {
  isFollowed?: boolean;
};

const UserCard = ({ isFollowed }: Iprops) => {
  const user = {
    name: 'Leo66',
    metaid: 'f3a826',
    intro:
      'I am a Web3 lover, I like new and interesting things, and I am happy to make friends with you.',
  };
  return (
    <div className='border border-white p-4 rounded-xl'>
      <div className='flex gap-2'>
        <div className='avatar placeholder self-start'>
          <div className='bg-[#2B3440] text-[#D7DDE4] rounded-full w-12'>
            <span>{'LE'}</span>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between items-center'>
            <div className='flex flex-col gap-1'>
              <div className='text-white'>{user.name}</div>
              <div className='text-gray'>MetaID: {user.metaid}</div>
            </div>
            {isFollowed}
            {/* <FollowButton isFollowed={isFollowed} /> */}
          </div>
          <div className='text-white'>{user.intro}</div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
