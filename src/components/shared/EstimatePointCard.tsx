export default function EstimatePointCard(props: {disabled: boolean, estimatePoint: string, currentPoint?: string, onSelect: (estimatePoint?: string) => void}) {
    return (
        <div
            className={"min-w-12 h-20 rounded-md flex items-center cursor-pointer ease-in duration-100 " + ( props.currentPoint === props.estimatePoint ? 'bg-blue-600 text-white -translate-y-2' : 'bg-gray-50 text-blue-600 border-2 border-blue-600 hover:bg-blue-200 hover:-translate-y-2' ) + (props.disabled ? ' !bg-gray-400 !text-black' : '')}
            onClick={() => !props.disabled ? props.onSelect(props.currentPoint === props.estimatePoint ? undefined : props.estimatePoint) : {}}
        >
            <span className="m-auto font-bold text-xl">{props.estimatePoint}</span>
        </div>
    );
}
