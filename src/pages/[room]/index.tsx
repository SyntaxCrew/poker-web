import { useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import PokerLogo from '/poker.png'
import EstimatePointCard from "../../components/EstimatePointCard";
import UserCard from "../../components/UserCard";
import { joinPokerRoom, leavePokerRoom, openCard, pokeCard } from '../../firebase/poker';
import { Poker } from "../../models/poker";
import { UserProfile } from '../../models/user';
import { getUserProfile } from '../../repository/user';

export default function PokerRoomPage() {
    const { room } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [poker, setPoker] = useState<Poker>();
    const [profile, setProfile] = useState<UserProfile>({userType: 'anonymous', userUUID: '', sessionUUID: ''});
    const [currentEstimatePoint, setCurrentEstimatePoint] = useState<string>();

    const estimatePoints: string[] = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

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
                            isSpectator: false,
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
                console.log(error)
                navigate('/');
            }
        }
    }, [])

    return (
        <>
            <div className="flex items-center justify-between px-2 sm:px-4 h-20 bg-red-200">
                <div className="flex items-center gap-2">
                    <img src={PokerLogo} className="w-10 h-10" alt="Poker logo" />
                    <span>{ room }</span>
                </div>
                { !isLoading && poker &&
                    <button
                        className="rounded-md px-2 bg-green-500 text-black py-1 ease-in duration-200 hover:bg-green-600"
                        onClick={() => openCard(room!, !poker.isShowEstimates)}
                        disabled={Object.keys(poker?.user).filter(userUUID => poker.user[userUUID].estimatePoint != null)?.length == 0 || false}
                    >
                        { poker.isShowEstimates ? 'Vote Next Issue' : 'Show Cards' }
                    </button>
                }
            </div>

            <div className="p-2 sm:p-4">
                {!isLoading && (
                    <div className="flex gap-2 flex-wrap w-fit">
                        {poker && Object.
                                    keys(poker.user).
                                    sort((a, b) => poker.user[a].displayName.localeCompare(poker.user[b].displayName)).
                                    filter(userUUID => poker.user[userUUID].estimatePoint != null || (poker.user[userUUID].activeSessions?.length && !poker.user[userUUID].isSpectator)).
                                    map(userUUID => {
                            return (
                                <UserCard
                                    key={userUUID}
                                    displayName={poker.user[userUUID].displayName}
                                    isShowEstimates={poker.isShowEstimates}
                                    estimatePoint={poker.user[userUUID].estimatePoint}
                                />
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="absolute z-10 bottom-0 w-full p-2 sm:p-4 bg-yellow-200">
                {!poker?.isShowEstimates && <div className="flex flex-wrap justify-center items-center gap-3">
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
                </div>}
                {poker?.isShowEstimates && <div className="text-black">RESULT VOTES</div>}
            </div>
        </>
    );
}