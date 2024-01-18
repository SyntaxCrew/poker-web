import { useMemo } from "react";
import ArtboardHeader from "@modules/poker/components/ArtboardHeader";
import EstimateCard from "@modules/poker/components/EstimateCard";
import HandRaisedIcon from "@core/components/HandRaisedIcon";

export default function PokerEstimate() {
    const estimatePoints = useMemo(() => ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55' , '89', '?', '🎵'], [])
    return (
        <div className="artboard bg-[#F6F6F6] rounded-[4px] min-h-52 max-h-min-h-52 w-full px-6 py-4 space-y-6">
            <ArtboardHeader
                title="Choose your point"
                text="Raise hand"
                icon={<HandRaisedIcon />}
            />
            <div className="flex items-center gap-6">
                {estimatePoints.map((estimatePoint, index) => {
                    return <EstimateCard key={index} point={estimatePoint} />
                })}
            </div>
        </div>
    )
}
