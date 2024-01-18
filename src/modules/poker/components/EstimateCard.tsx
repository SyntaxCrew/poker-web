export default function EstimateCard(props: {point: string}) {
    return <div className="max-w-[72px] min-w-[72px] max-h-[120px] min-h-[120px] rounded-[4px] bg-[#D9D9D9] flex items-center cursor-pointer ease-in duration-100">
        <span className="m-auto font-bold text-[32px] leading-[42px]">{props.point}</span>
    </div>
}
