import { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";
import EstimatePointCard from "../shared/EstimatePointCard";
import { Map } from "../../models/generic";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";
import { pokeCard } from "../../repository/firestore/poker";
import { numberFormat } from "../../utils/number";

export default function PokerPanel(props: {roomID: string, poker: Poker, profile: UserProfile}) {
    const [currentEstimatePoint, setCurrentEstimatePoint] = useState<string>();
    const [summary, setSummary] = useState<{result: Map<number>, max: number, total: number, average?: number}>({result: {}, max: 0, total: 0, average: 0});
    const [summaryStatus, setSummaryStatus] = useState<'set' | 'unset'>('unset');

    useEffect(() => {
        if (props.poker && props.profile && props.poker.user[props.profile.userUUID]) {
            setCurrentEstimatePoint(props.poker.user[props.profile.userUUID].estimatePoint);
        }
    }, [props.profile, props.poker]);

    useEffect(() => {
        if (props.poker.estimateStatus === 'OPENED') {
            if (summaryStatus === 'unset') {
                result();
                setSummaryStatus('set');
            }
        } else {
            setSummaryStatus('unset');
        }
    }, [props.poker.estimateStatus, summaryStatus])

    const result = () => {
        if (!props.poker || props.poker.estimateStatus !== 'OPENED') {
            return;
        }
        let total = 0;
        let sum = 0;
        let isNumberTotal = 0;
        const result: Map<number> = {};
        const validUsers = Object.values(props.poker.user).filter(user => user.estimatePoint != null);
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
        <div className="fixed z-10 bottom-0 swipe bg-[#F9F9F9] w-full overflow-x-auto hide-scrollbar h-[8.5rem]">
            {props.poker && props.poker.estimateStatus !== 'OPENED' && props.poker.user[props.profile.userUUID]?.activeSessions?.length > 0 && !props.poker.user[props.profile.userUUID]?.isSpectator &&
                <div className="w-fit h-full flex justify-center items-center gap-3 p-2 sm:p-4 m-auto">
                    {props.poker.option.estimateOption.decks.find(deck => deck.deckID === props.poker.option.estimateOption.activeDeckID)?.deckValues.map(estimatePoint => {
                        return (
                            <EstimatePointCard
                                key={estimatePoint}
                                estimatePoint={estimatePoint}
                                currentPoint={currentEstimatePoint}
                                disabled={props.poker.estimateStatus !== 'CLOSED'}
                                onSelect={(point) => pokeCard(props.profile.userUUID, props.roomID, point)}
                            />
                        )
                    })}
                </div>
            }
            {props.poker.estimateStatus === 'OPENED' && <div className="w-fit h-full flex justify-center items-center p-2 sm:p-4 m-auto gap-8">
                {Object.entries(summary.result).sort(([a], [b]) => a.length > b.length ? 1 : a.length < b.length ? -1 : a.localeCompare(b)).map(([point, vote]) => {
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

                {props.poker.option.showAverage && !isNaN(Number(summary.average)) && <div className="ml-2 flex flex-col justify-center items-center">
                    <div className="text-gray-500">Average:</div>
                    <div className="text-black font-bold text-xl">{numberFormat(summary.average || 0)}</div>
                </div>}
            </div>}
        </div>
    );
}
