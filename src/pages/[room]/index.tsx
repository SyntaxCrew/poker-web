import { useContext, useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import GlobalContext from "../../context/global";
import JoinGameDialog from "../../components/dialog/JoinGameDialog";
import UserCard from "../../components/partials/UserCard";
import EstimatePointCard from "../../components/shared/EstimatePointCard";
import { joinPokerRoom, leavePokerRoom, updateEstimateStatus, pokeCard, checkPokerRoom } from '../../repository/firestore/poker';

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
        let isFirstTime = true;
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
                        if (isFirstTime) {
                            setLoading(false);
                            isFirstTime = false;
                        }
                    }
                },
            });

        } catch (error) {
            if (isFirstTime) {
                setLoading(false);
                isFirstTime = false;
            }
            navigate('/');
        }
    }

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

            <div className="p-2 sm:p-4 top-16 relative h-[calc(100vh-4rem-7rem)] bg-white">
                {!isLoading && poker && (
                    <div className="flex gap-2 flex-wrap w-fit h-full justify-center items-center m-auto">
                        {
                            Object.
                                keys(poker.user).
                                sort((a, b) => poker.user[a].displayName?.localeCompare(poker.user[b].displayName || '')).
                                filter(userUUID => poker.user[userUUID].displayName && !poker.user[userUUID].isSpectator && ((poker.user[userUUID].estimatePoint != null && poker.estimateStatus !== 'CLOSED') || poker.user[userUUID].activeSessions?.length)).
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

            <div className="absolute z-10 bottom-0 bg-white w-full overflow-x-auto">
                {poker && poker?.estimateStatus !== 'OPENED' && poker.user[profile.userUUID]?.activeSessions?.length > 0 && !poker.user[profile.userUUID]?.isSpectator &&
                    <div className="w-fit flex justify-center items-center gap-3 p-2 sm:p-4 m-auto">
                        {poker?.option.estimateOption.decks.find(deck => deck.deckID === poker.option.estimateOption.activeDeckID)?.deckValues.map(estimatePoint => {
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