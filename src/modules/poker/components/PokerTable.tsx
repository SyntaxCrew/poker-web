import { useMemo } from "react";
import { Poker } from "@core/@types/poker";
import { User } from "@core/@types/user";
import EyeIcon from "@core/components/EyeIcon";
import JoinIcon from "@core/components/JoinIcon";
import ArtboardHeader from "@modules/poker/components/ArtboardHeader";
import PokerUser from "@modules/poker/components/PokerUser";
import TextIconButton from "@modules/poker/components/TextIconButton";
import UserEstimateCard from "@modules/poker/components/UserEstimateCard";
import { joinSection } from "@modules/poker/functions/join";
import usePokerTableWidthStyle from "@modules/poker/functions/usePokerTableWidthStyle";

export default function PokerTable(props: {poker: Poker, user: User}) {
    const topSideVoters = useMemo(() => Object.values(props.poker.user).filter((user, index) => !user.isSpectator && user.isActive && index % 2 === 0), [props.poker])
    const bottomSideVoters = useMemo(() => Object.values(props.poker.user).filter((user, index) => !user.isSpectator && user.isActive && index % 2 !== 0), [props.poker])
    const { width } = usePokerTableWidthStyle(topSideVoters.length + bottomSideVoters.length)

    return (
        <div className="artboard bg-[#F6F6F6] rounded-[4px] w-full h-full px-6 py-4 space-y-6">
            <ArtboardHeader
                title="Table"
                onClick={() => joinSection(props.poker, props.user, 'voter')}
                disabled={!props.poker.user[props.user.userUUID]?.isSpectator}
                text="join"
                icon={<JoinIcon />}
            />

            <div className="h-[calc(100%-56px)] overflow-y-auto hide-scrollbar">
                <div className="relative top-1/2 -translate-y-1/2 space-y-[17px]">
                    <div className="flex items-center justify-center gap-[21.67px]">
                        {topSideVoters.map((voter, index) => {
                            return <PokerUser key={index} displayName={voter.displayName} size="large" textDirection="top" imageURL={voter.profileImageURL} />
                        })}
                    </div>

                    <div className="bg-[#E6E6E6] rounded-[2rem] min-h-64 max-h-64 py-4 px-[18px] flex flex-col justify-between m-auto" style={{ width }}>
                        <div className="flex items-center gap-[46px] justify-center">
                            {topSideVoters.map((voter, index) => {
                                return <UserEstimateCard key={index} pokerUser={voter} pokerStatus={props.poker.status} />
                            })}
                        </div>

                        <div className="m-auto">
                            <TextIconButton icon={<EyeIcon />} text="reveal card" />
                        </div>

                        <div className="flex items-center gap-[46px] justify-center">
                            {bottomSideVoters.map((voter, index) => {
                                return <UserEstimateCard key={index} pokerUser={voter} pokerStatus={props.poker.status} />
                            })}
                            {(topSideVoters.length + bottomSideVoters.length) % 2 !== 0 && <div className="min-w-10 max-w-10 min-h-16 max-h-16"></div>}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-[21.67px]">
                        {bottomSideVoters.map((voter, index) => {
                            return <PokerUser key={index} displayName={voter.displayName} size="large" textDirection="bottom" imageURL={voter.profileImageURL} />
                        })}
                        {(topSideVoters.length + bottomSideVoters.length) % 2 !== 0 && <div className="max-h-[84px] min-h-[84px] max-w-16 min-w-16"></div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
