import { useContext, useEffect, useState } from "react";
import { Link, useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import PokerLogo from '/images/poker.png';
import GlobalContext from "../../context/global";
import UserCard from "../../components/partials/UserCard";
import EstimatePointCard from "../../components/shared/EstimatePointCard";
import { EstimateStatus } from "../../models/poker";
import { clearUsers, joinGame, joinPokerRoom, leavePokerRoom, updateEstimateStatus, pokeCard, checkPokerRoom } from '../../repository/firestore/poker';
import JoinGameDialog from "../../components/dialog/JoinGameDialog";

// Object keys sequence
// 1. Wait for fetched profile from App.tsx and inject into global context
// 2. Check is exists room and is user joined to this game or not
//    a. If this room is not exists (invalid room id), then redirect to home page
//    b. if user is join this game at the first time then set display name and mode before join the game
// 3. Set page status to ready, then subscribe poker room with realtime data

export default function PokerRoomPage() {
    const { isLoading, setLoading, profile, poker, setPoker, isPageReady } = useContext(GlobalContext);
    const { room } = useParams();
    const navigate = useNavigate();

    const [currentEstimatePoint, setCurrentEstimatePoint] = useState<string>();
    const [countdown, setCountdown] = useState(0);
    const [isCountingDown, setCountingDown] = useState(false);

    // set display name in dialog if user join to the game at first time
    const [isReady, setReady] = useState(false);
    const [isOpenDialog, setOpenDialog] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [isSpectator, setSpectator] = useState(false);

    useBeforeUnload(async () => await leavePokerRoom(profile.userUUID, profile.sessionUUID, room!));
    useEffect(() => {
        setLoading(true);
        if (isPageReady) {
            if (!isReady) {
                checkExistsRoom();
            } else {
                joinPoker();
            }
        }
    }, [isPageReady, isReady])

    useEffect(() => {
        if (poker?.estimateStatus === 'OPENING' && !isCountingDown) {
            setCountdown(2);
            setCountingDown(true);
        } else if (poker?.estimateStatus === 'OPENED' && isCountingDown) {
            setCountdown(0);
            setCountingDown(false);
        }
    }, [isCountingDown, poker])

    // Countdown for reveal cards
    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
        if (poker && poker.estimateStatus !== 'OPENED') {
            for (const userUUID of Object.keys(poker.user)) {
                // update multiple times depend on active users
                if (!poker.user[userUUID].isSpectator && poker.user[userUUID].estimatePoint != null) {
                    updateEstimateStatus(room!, 'OPENED');
                    break;
                }
            }
        }
    }, [countdown]);

    async function checkExistsRoom() {
        const { isExists, isJoined } = await checkPokerRoom(room!, profile.userUUID);
        if (!isExists) {
            setLoading(false);
            navigate('/');
        }
        if (!isJoined) {
            setLoading(false);
            setOpenDialog(true);
        } else {
            setReady(true);
        }
    }

    async function joinPoker() {
        try {
            await joinPokerRoom({
                userUUID: profile.userUUID,
                sessionUUID: profile.sessionUUID,
                roomID: room!,
                onNotFound: () => navigate('/'),
                onNewJoiner() {
                    return { displayName, isSpectator };
                },
                onNext(data) {
                    try {
                        const poker = data.data();
                        if (!poker) {
                            throw Error('poker not found');
                        }
                        setPoker(poker);

                        for (const userUUID of Object.keys(poker.user)) {
                            if (profile.userUUID === userUUID) {
                                setCurrentEstimatePoint(poker.user[userUUID].estimatePoint);
                                break;
                            }
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

                            // update multiple times depend on active users
                            if (hasUser && isVoteAll && poker.estimateStatus === 'CLOSED') {
                                updateEstimateStatus(room!, 'OPENING');
                            }
                        }

                    } catch (error) {
                        navigate('/');
                    } finally {
                        setLoading(false);
                    }
                },
            });

        } catch (error) {
            setLoading(false);
            navigate('/');
        }
    }

    const isUsersExists = (isPoked?: boolean) => {
        if (!poker) {
            return false;
        }
        for (const userUUID of Object.keys(poker.user)) {
            if (!poker.user[userUUID].isSpectator && poker.user[userUUID].activeSessions?.length > 0 && (!isPoked || poker.user[userUUID].estimatePoint != null)) {
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

    const displayButton = (isAllowOption: boolean) => isUsersExists() && poker && (poker.user[profile.userUUID]?.isFacilitator || (isAllowOption && !poker.user[profile.userUUID]?.isSpectator && poker.user[profile.userUUID]?.activeSessions?.length > 0))

    return (
        <>
            <JoinGameDialog
                open={isOpenDialog}
                onSubmit={(displayName, isSpectator) => {
                    setDisplayName(displayName);
                    setSpectator(isSpectator);
                    setOpenDialog(false);
                    setReady(true);
                }}
            />

            <div className="flex items-center justify-between px-2 sm:px-4 h-20 bg-blue-200">
                <div className="flex items-center gap-2">
                    <Link to="/">
                        <img src={PokerLogo} className="w-10 h-10" alt="Poker logo" />
                    </Link>
                    <span className="text-black">{ room }</span>
                </div>
                { !isLoading && poker &&
                    <div className="flex items-center gap-2">
                        <span className="text-black">{ countdown > 0 ? countdown : '' }</span>

                        <button
                            className="rounded-md px-2 bg-blue-500 text-white py-1 ease-in duration-200 hover:bg-blue-600"
                            disabled={poker.estimateStatus !== 'CLOSED'}
                            onClick={() => joinGame(poker, profile.userUUID, profile.sessionUUID, room!, poker.user[profile.userUUID]?.isSpectator ? 'join' : 'leave')}
                        >
                            { poker.user[profile.userUUID]?.isSpectator ? 'Join' : 'Leave' }
                        </button>

                        {displayButton(poker.option.allowOthersToDeleteEstimates) && <button
                            className="rounded-md px-2 bg-red-500 text-white py-1 ease-in duration-200 hover:bg-red-600"
                            disabled={poker.estimateStatus === 'OPENING'}
                            onClick={() => isUsersExists() && clearUsers(room!)}
                        >
                            Clear Users
                        </button>}

                        {displayButton(poker.option.allowOthersToShowEstimates) && <button
                            className="rounded-md px-2 bg-green-500 text-black py-1 ease-in duration-200 hover:bg-green-600"
                            onClick={flipCard}
                            disabled={poker.estimateStatus === 'CLOSED' && !isUsersExists(true)}
                        >
                            { poker.estimateStatus === 'OPENED' ? 'Vote Next Issue' : 'Show Cards' }
                        </button>}
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
                                            allowOthersToDeleteEstimates={poker.estimateStatus !== 'OPENING' && (poker.user[profile.userUUID]?.isFacilitator || poker.option.allowOthersToDeleteEstimates) && userUUID !== profile.userUUID}
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
                                    disabled={poker?.estimateStatus !== 'CLOSED'}
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