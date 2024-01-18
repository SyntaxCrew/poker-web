import { ReactNode } from "react";

export default function TextIconButton(props: {text: string, icon: ReactNode, onClick?: () => void, disabled?: boolean}) {
    return <div
        className={"flex items-center font-bold gap-1 " + (props.disabled ? 'text-gray-300 cursor-default' : 'cursor-pointer')}
        onClick={props.onClick}
    >
        <span>{ props.text }</span>
        {props.icon}
    </div>
}
