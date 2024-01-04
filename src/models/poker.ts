import { Map } from "./generic"

export type EstimateStatus = 'CLOSED' | 'OPENED' | 'OPENING'

export interface Poker {
    estimateStatus: EstimateStatus
    user: Map<PokerUser>
    option: PokerOption
    createdAt: Date
    updatedAt?: Date
}

export interface PokerUser {
    displayName: string
    estimatePoint?: string
    activeSessions: string[]
    isFacilitator?: boolean
    isSpectator?: boolean
}

export interface PokerOption {
    estimateOptions: string[]
    allowOthersToShowEstimates: boolean
    allowOthersToDeleteEstimates: boolean
    allowOthersToClearUsers: boolean
    autoRevealCards: boolean
    showAverage: boolean
}
