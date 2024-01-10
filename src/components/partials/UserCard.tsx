import { Tooltip } from "@mui/material";
import Avatar from "../shared/Avatar";
import { clearUsers } from "../../repository/firestore/poker";

export default function UserCard(props: {roomID: string, isYou: boolean, userUUID: string, displayName: string, imageURL?: string, estimatePoint?: string, isShowEstimates: boolean, allowOthersToDeleteEstimates: boolean}) {
    return (
        <div className="flex flex-col items-center max-w-28 w-full overflow-hidden">
            <div className={"min-w-12 h-20 rounded-md relative flex items-center ease-in duration-200 preserve-3d group " + (props.estimatePoint == null ? 'bg-gray-200' : props.isShowEstimates ? 'rotate-y-180 bg-gray-200 text-blue-600' : 'bg-blue-600')}>
                {props.isShowEstimates && <span className="m-auto font-bold backface-hidden rotate-y-180 text-xl">{props.estimatePoint}</span>}
                {props.allowOthersToDeleteEstimates && <div className="hidden group-hover:block absolute z-10 right-0 top-0 cursor-pointer" onClick={() => clearUsers(props.roomID, props.userUUID)}>
                    <svg className="h-6 w-6 text-red-500"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>}
            </div>
            <Avatar profile={{userUUID: props.userUUID, imageURL: props.imageURL, displayName: props.displayName, isAnonymous: false}} />
            <Tooltip
                title={props.displayName}
                arrow
                slotProps={{
                    popper: {
                        modifiers: [{
                            name: 'offset',
                            options: {
                                offset: [0, -10],
                            },
                        }]
                    },
                }}
            >
                <div className={"text-black text-ellipsis whitespace-nowrap overflow-hidden w-full text-center" + (props.isYou ? ' font-bold' : '')}>{props.displayName}</div>
            </Tooltip>
        </div>
    );
}
