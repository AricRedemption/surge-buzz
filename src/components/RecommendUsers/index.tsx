import { RotateCw } from "lucide-react";
import UserCard from "./UserCard";

const RecommendUsers = () => {
	return (
		<div>
			<div className="flex justify-between items-center">
				<div className="text-white font-normal font-['Impact'] text-[18px]">
					Recommend To Follow
				</div>
				<div className="flex gap-2">
					<div className="btn btn-outline btn-primary rounded-full w-[120px]">
						<RotateCw size={18} />
						Refresh
					</div>
					<div className="btn btn-primary rounded-full w-[120px]">Follow all</div>
				</div>
			</div>
			<div className="grid items-center justify-center md:grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
				<UserCard />
				<UserCard isFollowed />
			</div>
		</div>
	);
};

export default RecommendUsers;
