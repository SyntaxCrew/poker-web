import { CSSProperties, useCallback, useContext, useEffect, useState } from "react";
import PokeTable from "./PokerTable";
import UserCard from "../partials/UserCard";
import { maximumVoterNumber } from "../../constant/maximum-length";
import GlobalContext from "../../context/global";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";

function injectArray<T>(startIndex: number, endIndex: number, arrays: T[]): T[] {
    const voterSeq: T[] = [];
    for(let i=startIndex; i<endIndex; i++) {
        voterSeq.push(arrays[i]);
    }
    return [...voterSeq]
}

export default function PokerArea(props: {roomID: string, poker: Poker, profile: UserProfile}) {
    const { setDisplayVoteButtonOnTopbar, setting } = useContext(GlobalContext);

    const [voterUUIDs, setVoterUUIDs] = useState<string[]>([]);
    const [voterSequence, setVoterSequence] = useState<string[][]>([]);

    const table = "TABLE";
    const landscapeWidth = 768;
    const [isLandscape, setLandscape] = useState(true);
    const [windowSize, setWindowSize] = useState({width: window.innerWidth, height: window.innerHeight});

    useEffect(() => {
        const handleWindowResize = () => setWindowSize({width: window.innerWidth, height: window.innerHeight});
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    useEffect(() => {
        setLandscape(windowSize.width >= landscapeWidth);
    }, [windowSize.width]);

    useEffect(() => {
        const poker = props.poker;
        const voterUUIDs = !poker
            ? []
            : Object.
                keys(poker.user).
                filter(userUUID => poker.user[userUUID].displayName && !poker.user[userUUID].isSpectator && ((poker.user[userUUID].estimatePoint != null && poker.estimateStatus !== 'CLOSED') || poker.user[userUUID].activeSessions?.length)).
                sort((a, b) => poker.user[a].joinedAt.toDate().toISOString().localeCompare(poker.user[b].joinedAt.toDate().toISOString()))
        setVoterUUIDs(voterUUIDs);
        setDisplayVoteButtonOnTopbar(voterUUIDs.length > maximumVoterNumber);

        // Set voter to any position in front of table
        const n = voterUUIDs.length;
        const voterSequence: string[][] = [];
        if (isLandscape) {
            if (n <= 1) {
                // voterSequence.push([''], [table], n === 0 ? [''] : [voterUUIDs[0]]);
                if (n === 1) {
                    voterSequence.push([voterUUIDs[0]]);
                }
                voterSequence.push([table]);
            } else if (n <= 6) {
                voterSequence.push(injectArray(0, Math.ceil(n/2), voterUUIDs));
                voterSequence.push([table]);
                voterSequence.push(injectArray(Math.ceil(n/2), n, voterUUIDs));
            } else {
                voterSequence.push(injectArray(0, Math.ceil(n/2)-1, voterUUIDs));
                voterSequence.push([voterUUIDs[Math.ceil(n/2)-1], table, n === 7 ? '' : voterUUIDs[Math.ceil(n/2)]]);
                voterSequence.push(injectArray(Math.ceil(n/2) + (n === 7 ? 0 : 1), n, voterUUIDs));
            }
        } else {
            if (n <= 1) {
                // voterSequence.push(['', table, n === 0 ? '' : voterUUIDs[0]]);
                voterSequence.push(n === 1 ? [voterUUIDs[0], table] : [table]);
            } else if (n <=4 ) {
                voterSequence.push([...injectArray(0, Math.ceil(n/2), voterUUIDs), table, ...injectArray(Math.ceil(n/2), n, voterUUIDs)]);
            } else {
                voterSequence.push(injectArray(4, 4+Math.ceil((n-4)/2), voterUUIDs));
                voterSequence.push([...injectArray(0, 2, voterUUIDs), table, ...injectArray(2, 4, voterUUIDs)]);
                voterSequence.push(n === 5 ? [''] : injectArray(4+Math.ceil((n-4)/2), n, voterUUIDs));
            }
        }
        setVoterSequence(voterSequence);
    }, [props.poker, isLandscape]);

    const styleSize = useCallback((isLandscape: boolean, voterNumber: number, type: 'table' | 'screen', displayUserImage: 'show' | 'hide'): CSSProperties => {
        const padding = 1;
        const baseCardWidth = 7;
        const baseCardHeight = displayUserImage === 'show' ? 9.625 : 6.5;
        const baseCardArea = (baseCardWidth + padding * 2) * 2;
        if (isLandscape) {
            const baseTableWidth = 24;
            const baseTableHeight = 10;
            const baseWidth = type === 'table' ? baseTableWidth : baseTableWidth + baseCardArea;
            if (voterNumber <= 6 && type === 'screen') {
                return { width: `${baseTableWidth + padding * 2}rem`, height: `${baseTableHeight}rem` }
            } else if (voterNumber <= 8) {
                return { width: `${baseWidth}rem`, height: `${baseTableHeight}rem` }
            }
            const objectWidth = Math.ceil((voterNumber-8)/2) * 7 + baseWidth;
            return { width: `${objectWidth}rem`, height: `${baseTableHeight}rem` }
        }

        const baseTableWidth = (baseCardWidth * 2) + (padding * 3);
        const baseWidth = type === 'table' ? baseTableWidth : baseTableWidth + baseCardArea;
        if (voterNumber <= 4) {
            return { width: type === 'screen' ? `${baseTableWidth + padding * 2}rem` : `${baseWidth}rem`, height: '10rem' }
        }
        const cardNumber = Math.ceil((voterNumber-4)/2);
        const objectHeight = cardNumber * baseCardHeight + (cardNumber + 1);
        return { width: `${baseWidth}rem`, height: `${objectHeight}rem` }
    }, [])

    if (voterUUIDs?.length > maximumVoterNumber) {
        return <div className="px-4 flex gap-4 flex-wrap w-full h-full justify-center items-center m-auto min-h-[calc(100vh-8.5rem)] pb-40 pt-4">
            {voterUUIDs.map((userUUID, index) => {
                return <PokeUser key={index} userUUID={userUUID} {...props} />
            })}
        </div>
    }

    return (
        <div
            className={"px-4 flex gap-4 swipe h-full justify-center items-center m-auto min-h-[calc(100vh-8.5rem)] pb-40 pt-4" + (isLandscape ? ' flex-col' : '')}
            style={{width: styleSize(isLandscape, voterUUIDs.length, 'screen', setting.displayUserImage).width}}
        >
            {isLandscape && voterSequence.map((row, index) => {
                return <div key={index} className="flex gap-4 items-center">
                    {row.map((userUUID, index) => {
                        if (userUUID === table) {
                            return <PokeTable key={index} style={styleSize(isLandscape, voterUUIDs.length, 'table', setting.displayUserImage)} {...props} />
                        } else if (userUUID) {
                            return <div key={index} className="min-w-28"><PokeUser userUUID={userUUID} {...props} /></div>
                        }
                        return <DummyUser key={index} displayUserImage={setting.displayUserImage} />
                    })}
                </div>
            })}

            {!isLandscape && voterSequence.map((row, index) => {
                const tableIndex = row.findIndex(uid => uid === table);
                if (tableIndex !== -1) {
                    return (
                        <div key={index} className="flex flex-col gap-4 items-center">
                            {row.slice(0, tableIndex).length > 0 && <div className="flex gap-4 items-center">
                                {row.slice(0, tableIndex).map((userUUID, index) => {
                                    return (
                                        <div key={index} className="min-w-28"><PokeUser userUUID={userUUID} {...props} /></div>
                                    );
                                })}
                            </div>}
                            <PokeTable key={index} style={styleSize(isLandscape, voterUUIDs.length, 'table', setting.displayUserImage)} {...props} />
                            {row.slice(tableIndex+1).length > 0 && <div className="flex gap-4 items-center">
                                {row.slice(tableIndex+1).map((userUUID, index) => {
                                    return (
                                        <div key={index} className="min-w-28"><PokeUser userUUID={userUUID} {...props} /></div>
                                    );
                                })}
                            </div>}
                        </div>
                    )
                }
                return <div key={index} className="flex flex-col gap-4 items-center">
                    {row.map((userUUID, index) => {
                        if (userUUID) {
                            return <div key={index} className="min-w-28"><PokeUser userUUID={userUUID} {...props} /></div>
                        }
                        return <DummyUser key={index} displayUserImage={setting.displayUserImage} />
                    })}
                </div>
            })}
        </div>
    );
}

function PokeUser(props: {userUUID: string, roomID: string, poker: Poker, profile: UserProfile}) {
    return <UserCard
        roomID={props.roomID}
        userUUID={props.userUUID}
        imageURL={props.poker.user[props.userUUID]?.imageURL}
        displayName={props.poker.user[props.userUUID]?.displayName}
        isYou={props.userUUID === props.profile.userUUID}
        isShowEstimates={props.poker.estimateStatus === 'OPENED'}
        estimatePoint={props.poker.user[props.userUUID]?.estimatePoint}
        allowOthersToDeleteEstimates={(props.poker.user[props.profile.userUUID]?.isFacilitator || props.poker.option.allowOthersToDeleteEstimates) && props.userUUID !== props.profile.userUUID}
    />
}

function DummyUser(props: {displayUserImage: 'show' | 'hide'}) {
    return <div className="w-28 max-w-28 min-w-28" style={{ height: `${props.displayUserImage === 'show' ? 9.625 : 6.5}rem` }}></div>
}
