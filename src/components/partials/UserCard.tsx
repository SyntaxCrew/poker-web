import { clearUsers } from "../../repository/firestore/poker";

export default function UserCard(props: {roomID: string, userUUID: string, displayName: string, estimatePoint?: string, isShowEstimates: boolean, allowOthersToDeleteEstimates: boolean}) {
    return (
        <div className="flex flex-col items-center relative group">
            {props.allowOthersToDeleteEstimates && <div className="hidden group-hover:block absolute z-10 right-0 top-0 cursor-pointer" onClick={() => clearUsers(props.roomID, props.userUUID)}>
                <svg className="h-6 w-6 text-red-500"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>}

            <div className={"min-w-12 h-20 rounded-md flex items-center ease-in duration-200 preserve-3d " + (props.estimatePoint == null ? 'bg-white' : props.isShowEstimates ? 'rotate-y-180 bg-white text-blue-600' : 'bg-blue-600')}>
                {props.isShowEstimates && <span className="m-auto font-bold backface-hidden rotate-y-180 text-xl">{props.estimatePoint}</span>}
            </div>
            <div>{props.displayName}</div>
        </div>
    );
}
