import JoinIcon from "@core/components/JoinIcon";
import { User } from "@core/@types/user";
import TextIconButton from "@modules/poker/components/TextIconButton";
import UserAvatar from "@modules/poker/components/UserAvatar";

export default function PokerTopbar(props: {user: User}) {
    return (
        <div className="min-h-12 max-h-12 w-full flex items-center justify-between gap-[30px]">
            <div className="bg-[#F6F6F6] px-3 py-2 font-bold text-xl">
                Room Name
            </div>
            <div className="ml-auto">
                <TextIconButton icon={<JoinIcon />} text="leave this room" />
            </div>
            <div className="w-fit">
                <UserAvatar size="medium" displayName={props.user.displayName} imageURL={props.user.profileImageURL} />
            </div>
        </div>
    )
}
