import { CSSProperties, useMemo } from "react";

const baseUserWidth = 64 //px
const baseGap = 21.67 //px
const tablePadding = 18;
const minimumTableWithVoter = 8;

export default function usePokerTableWidthStyle(voterTotal: number): CSSProperties {
    return useMemo(() => {
        const voterOnEachSide = Math.max(Math.ceil(minimumTableWithVoter/2), Math.ceil(voterTotal/2));
        return { width: `${(voterOnEachSide * baseUserWidth) + ((voterOnEachSide-1) * baseGap) + tablePadding}px` }
    }, [voterTotal])
}
