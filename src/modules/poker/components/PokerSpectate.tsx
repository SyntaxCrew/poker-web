import { useMemo } from "react";
import { Poker } from "@core/@types/poker";
import { User } from "@core/@types/user";
import JoinIcon from "@core/components/JoinIcon";
import ArtboardHeader from "@modules/poker/components/ArtboardHeader";
import { joinSection } from "@modules/poker/functions/join";
import UserAvatar from "@modules/poker/components/UserAvatar";
import HandRaisedOutlineIcon from "@core/components/HandRaisedOutlineIcon";

export default function PokerSpectate(props: {poker: Poker, user: User}) {
    const spectators = useMemo(() => Object.values(props.poker.user).filter(user => user.isSpectator && user.isActive), [props.poker])

    return (
        <div className="artboard bg-[#F6F6F6] rounded-[4px] max-w-[305px] h-full px-6 py-4 space-y-6">
            <ArtboardHeader
                title="Spectate"
                onClick={() => joinSection(props.poker, props.user, 'spectator')}
                disabled={props.poker.user[props.user.userUUID]?.isSpectator}
                text="join"
                icon={<JoinIcon />}
            />
            <div className="space-y-3 h-[calc(100%-56px)] overflow-y-auto hide-scrollbar">
                {spectators.map((spectator, index) => {
                    return (
                        <div key={index} className="flex items-center space-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <UserAvatar displayName={spectator.displayName} imageURL={spectator.profileImageURL} size='small' />
                                <div className="text-ellipsis whitespace-nowrap overflow-hidden w-fit">{ spectator.displayName }</div>
                            </div>
                            <div className="ml-auto">
                                <HandRaisedOutlineIcon />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
