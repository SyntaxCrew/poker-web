export default function UserCard(props: {displayName: string, estimatePoint?: number, isShowEstimates: boolean}) {
    const cardPoint = props.estimatePoint === -2
        ? <img src="/tea.png" className="w-10 h-10 m-auto backface-hidden rotate-y-180" alt="Tea card" />
        : <span className="m-auto font-bold backface-hidden rotate-y-180">{props.estimatePoint === -1 ? '?' : props.estimatePoint}</span>
    return (
        <div className="flex flex-col items-center">
            <div className={"min-w-12 h-20 rounded-md flex items-center text-black ease-in duration-200 preserve-3d " + (props.estimatePoint == null ? 'bg-white' : props.isShowEstimates ? 'bg-white rotate-y-180' : 'bg-blue-600')}>
                {props.isShowEstimates && cardPoint}
            </div>
            <div>{props.displayName}</div>
        </div>
    );
}