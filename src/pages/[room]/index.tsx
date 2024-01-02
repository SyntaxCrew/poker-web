import { useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import PokerLogo from '/poker.png'
import EstimatePointCard from "../../components/EstimatePointCard";
import { joinPokerRoom, leavePokerRoom, pokeCard } from '../../firebase/poker';
import { Poker } from "../../models/poker";
import { UserProfile } from '../../models/user';
import { getUserProfile } from '../../repository/user';

export default function PokerRoomPage() {
    const { room } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [poker, setPoker] = useState<Poker>();
    const [profile, setProfile] = useState<UserProfile>({userType: 'anonymous', userUUID: '', sessionUUID: ''});
    const [currentEstimatePoint, setCurrentEstimatePoint] = useState<number>();

    const estimatePoints: (number | '?' | '!')[] = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '!'];

    useBeforeUnload(async () => await leavePokerRoom(profile.userUUID, profile.sessionUUID, room!));
    useEffect(() => {
        init();
        async function init() {
            try {
                const userProfile = await getUserProfile();
                setProfile(userProfile);

                await joinPokerRoom({
                    userUUID: userProfile.userUUID,
                    sessionUUID: userProfile.sessionUUID,
                    roomID: room!,
                    onNotFound: () => navigate('/'),
                    onNewJoiner() {
                        return {
                            displayName: prompt("Enter your display name!")!,
                            isSpectator: undefined,
                        };
                    },
                    onNext(data) {
                        const poker = data.data()!;
                        setPoker(poker)
                        for (const userUUID of Object.keys(poker.user)) {
                            if (userProfile.userUUID === userUUID) {
                                setCurrentEstimatePoint(poker.user[userUUID].estimatePoint)
                                break;
                            }
                        }
                        if (isLoading) {
                            setLoading(false);
                        }
                    },
                });

            } catch (error) {
                navigate('/');
            }
        }
    }, [])

    const estimatePointConverter = (point: number) => {
        if (point === -2) {
            return (
                <img src="/tea.png" className="w-10 h-10 m-auto" alt="Tea card" />
            )
        } else if (point === -1) {
            return '?'
        }
        return point
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <img src={PokerLogo} className="w-10 h-10" alt="Poker logo" />
                <span>{ room }</span>
            </div>

            {!isLoading && (
                <div className="flex gap-2 flex-wrap w-fit">
                    {poker && Object.keys(poker.user).filter(userUUID => poker.user[userUUID].activeSessions?.length && !poker.user[userUUID].isSpectator).map(userUUID => {
                        return (
                            <div key={userUUID} className="rounded-md m-auto">
                                <div>{poker.user[userUUID].displayName}</div>
                                {poker.user[userUUID].estimatePoint !== undefined && <div>Estimate Point: {estimatePointConverter(poker.user[userUUID].estimatePoint!)}</div>}
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="flex gap-2">
                {estimatePoints.map(estimatePoint => {
                    return (
                        <EstimatePointCard
                            key={estimatePoint}
                            estimatePoint={estimatePoint}
                            currentPoint={currentEstimatePoint}
                            onSelect={(point) => pokeCard(profile.userUUID, room!, point)}
                        />
                    )
                })}
            </div>
        </>
    );
}