import { useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import PokerLogo from '/poker.png'
import EstimatePointCard from "../../components/EstimatePointCard";
import UserCard from "../../components/UserCard";
import { clearUsers, joinGame, joinPokerRoom, leavePokerRoom, updateEstimateStatus, pokeCard } from '../../firebase/poker';
import { EstimateStatus, Poker } from "../../models/poker";
import { UserProfile } from '../../models/user';
import { getUserProfile } from '../../firebase/user';

export default function PokerRoomPage() {
    const { room } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [poker, setPoker] = useState<Poker>();
    const [profile, setProfile] = useState<UserProfile>({userType: 'anonymous', userUUID: '', sessionUUID: ''});
    const [currentEstimatePoint, setCurrentEstimatePoint] = useState<string>();
    const [countdown, setCountdown] = useState(0);

    useBeforeUnload(async () => await leavePokerRoom(profile.userUUID, profile.sessionUUID, room!));
    useEffect(() => {
        init();
        async function init() {
            try {
                const userProfile = await getUserProfile();
                if (!userProfile) {
                    return;
                }
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
                        try {
                            const poker = data.data();
                            if (!poker) {
                                throw Error('poker not found')
                            }
                            setPoker(poker);
                            for (const userUUID of Object.keys(poker.user)) {
                                if (userProfile.userUUID === userUUID) {
                                    setCurrentEstimatePoint(poker.user[userUUID].estimatePoint)
                                    break;
                                }
                            }

                            // set loading screen
                            if (isLoading) {
                                setLoading(false);
                            }

                            // set timer countdown
                            if (poker.option.autoRevealCards) {
                                let isVoteAll = true;
                                let hasUser = false;
                                for (const userUUID of Object.keys(poker.user)) {
                                    if (poker.user[userUUID].isSpectator) {
                                        continue;
                                    }
                                    if (poker.user[userUUID].activeSessions?.length > 0) {
                                        hasUser = true;
                                        if (poker.user[userUUID].estimatePoint == null) {
                                            isVoteAll = false;
                                            break;
                                        }
                                    }
                                }
                                if (hasUser && isVoteAll && poker.estimateStatus === 'CLOSED') {
                                    updateEstimateStatus(room!, 'OPENING');
                                }
                            }

                            if (poker.estimateStatus === 'OPENING') {
                                setCountdown(2);
                            } else if (poker.estimateStatus === 'OPENED') {
                                setCountdown(0);
                            }

                        } catch (error) {
                            navigate('/');
                        }
                    },
                });

            } catch (error) {
                navigate('/');
            }
        }
    }, [])

    // Countdown for reveal cards
    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
        if (poker?.estimateStatus !== 'OPENED' && openable()) {
            updateEstimateStatus(room!, 'OPENED');
        }
    }, [countdown]);

    const openable = () => {
        if (!poker) {
            return false;
        }
        for (const userUUID of Object.keys(poker.user)) {
            if (!poker.user[userUUID].isSpectator && poker.user[userUUID].estimatePoint != null && poker.user[userUUID].activeSessions?.length > 0) {
                return true;
            }
        }
        return false;
    }

    const isUsersExists = () => {
        if (!poker) {
            return false;
        }
        for (const userUUID of Object.keys(poker.user)) {
            if (!poker.user[userUUID].isSpectator && poker.user[userUUID].activeSessions?.length > 0) {
                return true;
            }
        }
        return false;
    }

    const flipCard = async() => {
        if (!poker) {
            return;
        }

        let estimateStatus!: EstimateStatus;
        switch (poker.estimateStatus) {
            case 'CLOSED':
                estimateStatus = 'OPENING';
                break;
            case 'OPENING':
                estimateStatus = 'OPENED';
                break;
            case 'OPENED':
                estimateStatus = 'CLOSED';
                break;
        }
        await updateEstimateStatus(room!, estimateStatus);
    }

    return (
        <>
            <div className="flex items-center justify-between px-2 sm:px-4 h-20 bg-blue-200">
                <div className="flex items-center gap-2">
                    <a href="/">
                        <img src={PokerLogo} className="w-10 h-10" alt="Poker logo" />
                    </a>
                    <span className="text-black">{ room }</span>
                </div>
                { !isLoading && poker &&
                    <div className="flex items-center gap-2">
                        <span className="text-black">{ countdown > 0 ? countdown : '' }</span>
                        <button
                            className="rounded-md px-2 bg-blue-500 text-white py-1 ease-in duration-200 hover:bg-blue-600"
                            onClick={() => joinGame(profile.userUUID, profile.sessionUUID, room!, poker?.user[profile.userUUID]?.isSpectator ? 'join' : 'leave')}
                        >
                            { poker.user[profile.userUUID]?.isSpectator ? 'Join' : 'Leave' }
                        </button>
                        {
                            isUsersExists() && (poker.user[profile.userUUID]?.isFacilitator || (poker.option.allowOthersToDeleteEstimates && !poker.user[profile.userUUID]?.isSpectator && poker.user[profile.userUUID]?.activeSessions?.length > 0)) &&
                            <button
                                className="rounded-md px-2 bg-red-500 text-white py-1 ease-in duration-200 hover:bg-red-600"
                                onClick={() => isUsersExists() && clearUsers(room!)}
                            >
                                Clear Users
                            </button>
                        }
                        {
                            poker.user[profile.userUUID]?.activeSessions?.length > 0 &&
                            (poker.user[profile.userUUID]?.isFacilitator || (!poker.user[profile.userUUID]?.isSpectator && poker.option.allowOthersToShowEstimates)) &&
                            <button
                                className="rounded-md px-2 bg-green-500 text-black py-1 ease-in duration-200 hover:bg-green-600"
                                onClick={flipCard}
                                disabled={poker.estimateStatus === 'CLOSED' && !openable()}
                            >
                                { poker.estimateStatus === 'OPENED' ? 'Vote Next Issue' : 'Show Cards' }
                            </button>
                        }
                    </div>
                }
            </div>

            <div className="p-2 sm:p-4">
                {!isLoading && poker && (
                    <div className="flex gap-2 flex-wrap w-fit h-full justify-center items-center m-auto">
                        {
                            Object.
                                keys(poker.user).
                                sort((a, b) => poker.user[a].displayName.localeCompare(poker.user[b].displayName)).
                                filter(userUUID => !poker.user[userUUID].isSpectator && ((poker.user[userUUID].estimatePoint != null && poker.estimateStatus !== 'CLOSED') || poker.user[userUUID].activeSessions?.length)).
                                map(userUUID => {
                                    return (
                                        <UserCard
                                            key={userUUID}
                                            roomID={room!}
                                            userUUID={userUUID}
                                            displayName={poker.user[userUUID].displayName}
                                            isShowEstimates={poker.estimateStatus === 'OPENED'}
                                            estimatePoint={poker.user[userUUID].estimatePoint}
                                            allowOthersToDeleteEstimates={(poker.user[profile.userUUID]?.isFacilitator || poker.option.allowOthersToDeleteEstimates) && userUUID !== profile.userUUID}
                                        />
                                    )
                                })
                        }
                    </div>
                )}
            </div>

            <div className="absolute z-10 bottom-0 w-full p-2 sm:p-4 bg-yellow-200">
                {poker && poker?.estimateStatus !== 'OPENED' && poker.user[profile.userUUID]?.activeSessions?.length > 0 && !poker.user[profile.userUUID]?.isSpectator &&
                    <div className="flex flex-wrap justify-center items-center gap-3">
                        {poker?.option.estimateOptions.map(estimatePoint => {
                            return (
                                <EstimatePointCard
                                    key={estimatePoint}
                                    estimatePoint={estimatePoint}
                                    currentPoint={currentEstimatePoint}
                                    disabled={countdown > 0}
                                    onSelect={(point) => pokeCard(profile.userUUID, room!, point)}
                                />
                            )
                        })}
                    </div>
                }
                {poker?.estimateStatus === 'OPENED' && <div className="text-black">RESULT VOTES</div>}
            </div>
        </>
    );
}