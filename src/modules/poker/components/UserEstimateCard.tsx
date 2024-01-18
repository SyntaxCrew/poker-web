import { PokerStatus, PokerUser } from "@core/@types/poker";
import CheckIcon from "@core/components/CheckIcon";
import ThinkingIcon from "@core/components/ThinkingIcon";

export default function UserEstimateCard(props: {pokerUser: PokerUser, pokerStatus: PokerStatus}) {
    return (
        <div className={"rounded-[4px] min-w-10 max-w-10 min-h-16 max-h-16 flex items-center cursor-pointer ease-in duration-100 " + (props.pokerStatus === 'CLOSED' && props.pokerUser.estimatePoint != null ? 'bg-[#81BE72]' : 'bg-[#C5BEBE]')}>
            <div className="m-auto">
                {props.pokerUser.estimatePoint != null
                    ? <CheckIcon />
                    : <ThinkingIcon />
                }
            </div>
        </div>
    )
}
