export default function EstimatePointCard(props: {estimatePoint: number | '?' | '!', currentPoint?: number, onSelect: (estimatePoint?: number) => void}) {
    const point = props.estimatePoint === '?' ? -1 : props.estimatePoint === '!' ? -2 : props.estimatePoint;
    return (
        <div
            className={"min-w-12 h-20 rounded-md flex items-center cursor-pointer ease-in duration-100 " + (props.currentPoint === point ? 'bg-blue-600 text-white -translate-y-2' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-200 hover:-translate-y-2')}
            onClick={() => props.onSelect(props.currentPoint === point ? undefined : point)}
        >
            {props.estimatePoint === '!' ? <img src="/tea.png" className="w-10 h-10 m-auto" alt="Tea card" /> : <span className="m-auto font-bold">{props.estimatePoint}</span>}
        </div>
    );
}
