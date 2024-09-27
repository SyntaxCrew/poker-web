import { CSSProperties, useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import PokerButton from "./PokerButton";
import { isVoteAll } from "../../composables/poker";
import { maximumIssueNameLength } from "../../constant/maximum-length";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";
import { updateIssueName } from "../../repository/firestore/poker";
import { notMultiSpace, notStartWithSpace, setValue } from "../../utils/input";

export default function PokeTable(props: {roomID: string, poker: Poker, profile: UserProfile, className?: string, style?: CSSProperties}) {
    const [issueName, setIssueName] = useState<string>(props.poker.issueName ?? '');
    const [countdown, setCountdown] = useState(0);

    const [style, setStyle] = useState<CSSProperties>(props.style || {});
    const [gradientBorder] = useState<CSSProperties>({
        background: 'linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)',
        backgroundSize: '200%',
        animation: 'linearGradientFlow 5s infinite linear',
    })

    const allowToSetIssueName = useMemo(
        () => props.poker.user[props.profile.userUUID]?.isFacilitator || props.poker.option.allowOthersToSetIssueName,
        [props.poker],
    );

    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => {
            setCountdown(countdown - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
        if (countdown === 0 && issueName !== props.poker.issueName) {
            updateIssueName(props.roomID, issueName);
        }
    }, [countdown]);

    useEffect(() => {
        if (countdown === 0) {
            setIssueName(props.poker.issueName ?? '');
        }
    }, [props.poker.issueName]);

    useEffect(() => {
        let style = {...props.style};
        if (isVoteAll(props.poker)) {
            style = {...style, ...gradientBorder}
        }
        setStyle(style)
    }, [props.poker, props.style])

    return <div className={"rounded-md border border-[#74b3ff] bg-[#D7E9FF] flex items-center justify-center p-1" + ( props.className ? ` ${props.className}` : '' )} style={style}>
        <div className="rounded-md flex flex-col items-center justify-center gap-4 m-auto bg-[#D7E9FF] w-full h-full">
            <TextField
                className="w-[75%]"
                variant="standard"
                placeholder="Enter issue name"
                label="Issue Name"
                value={issueName || ''}
                onChange={e => {
                    setValue(setIssueName, { maximum: maximumIssueNameLength, others: [notStartWithSpace, notMultiSpace] })(e)
                    setCountdown(2);
                }}
                disabled={!allowToSetIssueName || !(props.poker.user[props.profile.userUUID]?.isFacilitator || (!props.poker.user[props.profile.userUUID]?.isSpectator && props.poker.user[props.profile.userUUID]?.activeSessions?.length > 0))}
            />
            <PokerButton poker={props.poker} profile={props.profile} />
        </div>
    </div>
}
