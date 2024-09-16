// import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
// import { getPinDetailByPid } from '../api/buzz';
import BackButton from '../components/Buttons/BackButton';
import AllNewBuzzList from '../components/BuzzList/AllNewBuzzList';
import { environment } from '../utils/environments';
import ProfileCard from '../components/Cards/ProfileCard';

// import BuzzCard from '../components/BuzzList/BuzzCard';

const Profile = () => {
  const { id: address } = useParams();

  return (
    <div>
      <BackButton />

      <ProfileCard address={address ?? ''} />

      <AllNewBuzzList
        address={address}
        queryKey={['user-buzzes', environment.network, address]}
        showFollowButton={false}
      />
    </div>
  );
};

export default Profile;
