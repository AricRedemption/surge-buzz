import { isEmpty, isNil } from "ramda";

type Iprops = {
  userInfo?: {
    id: string;
    name: string;
    address: string;
    avatarUrl: string;
  };
  onProfileDetail?: (address: string) => void;
  size?: string;
};

const Avatar = ({ userInfo, onProfileDetail, size = "48px" }: Iprops) => {
  const hasName = !isNil(userInfo?.name) && !isEmpty(userInfo?.name);
  const hasAvatar =
    !isNil(userInfo?.avatarUrl) && !isEmpty(userInfo?.avatarUrl);
  const userAlt = hasName
    ? userInfo.name.slice(0, 2)
    : (userInfo?.id ?? "").slice(-4, -2);
  const src = `${userInfo?.avatarUrl ?? ""}`;
  return (
    <div
      onClick={() =>
        onProfileDetail && onProfileDetail(userInfo?.address ?? "")
      }
      className="z-50"
    >
      {hasAvatar ? (
        <img
          src={src}
          alt="user avatar"
          className="rounded-full self-start cursor-pointer"
          style={{
            width: size,
            height: size,
            objectFit: "cover",
          }}
        />
      ) : (
        <div className="avatar placeholder cursor-pointer">
          <div
            className="bg-[#2B3440] text-[#D7DDE4] rounded-full"
            style={{
              width: size,
              height: size,
              objectFit: "cover",
            }}
          >
            <span>{userAlt}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
