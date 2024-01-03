import { Map } from "./generic"

export interface Poker {
    isShowEstimates: boolean
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
    allowEditEstimateAfterShowEstimate: boolean
    showTimer: boolean
    autoRevealCards: boolean // Show cards automatically after everyone voted.
    showAverage: boolean
    showMedian: boolean
}
