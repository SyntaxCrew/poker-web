import { Timestamp } from "firebase/firestore"
import { Map } from "./generic"

export type EstimateStatus = 'CLOSED' | 'OPENED' | 'OPENING'

export interface Poker {
    session: string
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
    showAverage: boolean // ❌
}

export interface PokerHistory {
    issueName?: string
    result: string // average | median | mode
    duration?: string // 00:05
    date: Timestamp // 4 Jan, 21:31
    voted: number
    total: number // Voted / total => 2/2
    playerResult: PokerHistoryPlayerResult[] // test (2), test2 (☕), test3 (3)
}

export interface PokerHistoryPlayerResult {
    displayName: string
    estimatePoint: string
}

export interface PokerIssue {

}
