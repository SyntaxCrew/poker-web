import { SetStateAction } from "react"

export interface CopyInput {
    label: string
    value: string
    isCopying: boolean
    setCopyingState: (value: SetStateAction<boolean>) => void
    countdown: number
    setCountdown: (value: SetStateAction<number>) => void
}
