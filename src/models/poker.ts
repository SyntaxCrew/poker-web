import { Map } from "./generic"

export interface Poker {
    isShowEstimates: boolean
    user: Map<PokerUser>
    createdAt: Date
    updatedAt?: Date
}

export interface PokerUser {
    displayName: string
    estimatePoint?: number
    activeSessions: string[]
    isOwner?: boolean
}
