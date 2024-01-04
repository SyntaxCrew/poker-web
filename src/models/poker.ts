import { Timestamp } from "firebase/firestore"
import { Map } from "./generic"

export type EstimateStatus = 'CLOSED' | 'OPENED' | 'OPENING'

export interface Poker {
    issueName?: string
    estimateStatus: EstimateStatus
    user: Map<PokerUser>
    option: PokerOption
    histories?: PokerHistory[]
    votingAt?: Timestamp
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

export interface PokerHistory {
    issueName?: string
    result: string
    duration?: string
    date: Date
    voted: number
    total: number
    playerResult: PokerHistoryPlayerResult[]
}

export interface PokerHistoryPlayerResult {
    displayName: string
    estimatePoint: string
}
