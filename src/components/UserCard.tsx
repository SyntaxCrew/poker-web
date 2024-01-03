export default function UserCard(props: {displayName: string, estimatePoint?: string, isShowEstimates: boolean}) {
    return (
        <div className="flex flex-col items-center">
            <div className={"min-w-12 h-20 rounded-md flex items-center ease-in duration-200 preserve-3d " + (props.estimatePoint == null ? 'bg-white' : props.isShowEstimates ? 'rotate-y-180 bg-white text-blue-600' : 'bg-blue-600')}>
                {props.isShowEstimates && <span className="m-auto font-bold backface-hidden rotate-y-180 text-xl">{props.estimatePoint}</span>}
            </div>
            <div>{props.displayName}</div>
        </div>
    );
}