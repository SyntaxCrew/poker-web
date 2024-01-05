import { Timestamp } from "firebase/firestore"
import { Map } from "./generic"

export type EstimateStatus = 'CLOSED' | 'OPENED' | 'OPENING'

export interface Poker {
    session: string
    roomName: string
    issueName?: string
    estimateStatus: EstimateStatus
    user: Map<PokerUser>
    option: PokerOption
    history?: Map<PokerHistory>
    votingAt?: Timestamp
    createdAt: Timestamp
    updatedAt?: Timestamp
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
    date: Timestamp
    voted: number
    total: number
    playerResult: PokerHistoryPlayerResult[]
}

export interface PokerHistoryPlayerResult {
    displayName: string
    estimatePoint: string
}

export interface CreatePokerOptionDialog {
    roomName: string
    displayName: string
    isSpectator: boolean
    option: PokerOption
}
