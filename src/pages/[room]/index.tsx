import { useContext, useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import GlobalContext from "../../context/global";
import JoinGameDialog from "../../components/dialog/JoinGameDialog";
import UserCard from "../../components/partials/UserCard";
import EstimatePointCard from "../../components/shared/EstimatePointCard";
import { joinPokerRoom, leavePokerRoom, updateEstimateStatus, pokeCard, checkPokerRoom } from '../../repository/firestore/poker';
import { Map } from "../../models/generic";
import { LinearProgress } from "@mui/material";

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

    const [summary, setSummary] = useState<{result: Map<number>, max: number, total: number, average?: number}>({result: {}, max: 0, total: 0, average: 0});

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

    useEffect(() => {
        if (poker?.estimateStatus === 'OPENED') {
            result();
        }
    }, [poker?.estimateStatus])

    const result = () => {
        if (!poker || poker.estimateStatus !== 'OPENED') {
            return;
        }
        let total = 0;
        let sum = 0;
        let isNumberTotal = 0;
        const result: Map<number> = {};
        const validUsers = Object.values(poker.user).filter(user => user.estimatePoint != null);
        for (const user of validUsers) {
            total++;
            if (!isNaN(Number(user.estimatePoint))) {
                isNumberTotal++;
                sum += Number(user.estimatePoint);
            }
            result[user.estimatePoint!] = result[user.estimatePoint!] ? result[user.estimatePoint!]+1 : 1;
        }
        let max = 0;
        for (const count of Object.values(result)) {
            if (count > max) {
                max = count;
            }
        }
        setSummary({ result, max, total, average: sum/isNumberTotal });
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

            <div className="relative w-screen top-20 min-h-100 flex overflow-y-auto bg-white">
                {!isLoading && poker && (
                    <div className="px-4 flex gap-4 flex-wrap w-fit h-full justify-center items-center m-auto min-h-[calc(100vh-5rem)] pb-32 pt-4">
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

            <div className="fixed z-10 bottom-0 swipe bg-white w-full overflow-x-auto">
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
                {poker?.estimateStatus === 'OPENED' && <div className="w-fit flex justify-center items-center p-2 sm:p-4 m-auto gap-8">
                    {Object.entries(summary.result).sort(([a], [b]) => a.localeCompare(b)).map(([point, vote]) => {
                        return (
                            <div className={"flex flex-col justify-center items-center relative " + (vote === summary.max ? 'text-black' : 'text-gray-400')} key={point}>
                                <div className="left-4 top-50 -translate-y-3 absolute">
                                    <LinearProgress color="inherit" variant="determinate" value={(vote/summary.total)*100} className="-rotate-90 w-20 !h-2 !rounded-lg" />
                                </div>
                                <div
                                    key={point}
                                    className={"min-w-12 max-w-12 h-20 rounded-md flex items-center border-2 " + (vote === summary.max ? 'border-black' : 'border-gray-400')}
                                >
                                    <span className="m-auto font-bold text-xl">{ point }</span>
                                </div>
                                <span>{ vote } Vote</span>
                            </div>
                        );
                    })}
                    {poker?.option.showAverage && !isNaN(Number(summary.average)) && <div className="ml-2 flex flex-col justify-center items-center">
                        <div className="text-gray-500">Average:</div>
                        <div className="text-black font-bold text-xl">
                            {new Intl.NumberFormat('en-IN', {maximumFractionDigits: 2}).format(summary.average || 0)}
                        </div>
                    </div>}
                </div>}
            </div>
        </>
    );
}