import { UserProfile } from "./user"

export interface Menu {
    prefixIcon: JSX.Element
    disabled?: boolean
    text: string
    suffix?: string | JSX.Element
    hasMenu?: (profile: UserProfile) => boolean
    onClick?: () => void
}