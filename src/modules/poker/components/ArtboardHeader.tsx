import { ReactNode } from "react";
import TextIconButton from "@modules/poker/components/TextIconButton";

export default function ArtboardHeader(props: {title: string, text: string, icon: ReactNode, onClick?: () => void, disabled?: boolean}) {
    return <div className="flex items-center justify-between h-8">
        <div className="font-bold text-2xl">{ props.title }</div>
        <TextIconButton
            onClick={props.onClick}
            disabled={props.disabled}
            text={props.text}
            icon={props.icon}
        />
    </div>
}