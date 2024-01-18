import { useMemo } from "react"
import { Size } from "@core/@types/size"
import UserAvatar from "@modules/poker/components/UserAvatar"

export default function PokerUser(props: {size?: Size, displayName: string, imageURL?: string, textDirection: 'top' | 'bottom'}) {
    const nameElement = useMemo(() => <div className="text-ellipsis whitespace-nowrap overflow-hidden text-center font-bold text-[12px] leading-4">{ props.displayName }</div>, [props.displayName])

    return (
        <div className="min-w-16 max-w-16 flex flex-col gap-1">
            {props.textDirection === 'top' && nameElement}
            <UserAvatar displayName={props.displayName} imageURL={props.imageURL} size={props.size} />
            {props.textDirection === 'bottom' && nameElement}
        </div>
    )
}
