import { Timestamp } from "firebase/firestore"
import { Map } from "./generic"
import { Deck } from "./game"

export type EstimateStatus = 'CLOSED' | 'OPENED' | 'OPENING'

export interface Poker {
    session: string
    roomID: string
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
    imageURL?: string
    estimatePoint?: string
    activeSessions: string[]
    isFacilitator?: boolean
    isSpectator?: boolean
}

export interface PokerOption {
    allowOthersToShowEstimates: boolean
    allowOthersToDeleteEstimates: boolean
    allowOthersToClearUsers: boolean
    autoRevealCards: boolean
    showAverage: boolean
    estimateOption: {
        decks: Deck[]
        activeDeckID: string
    }
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

export interface UpdatePokerOptionDialog {
    roomName: string
    oldFacilitatorUUID: string
    newFacilitatorUUID: string
    option: PokerOption
}

export interface MyPokerGame {
    roomID: string
    roomName: string
    user: {
        voter: number
        total: number
    }
    facilitator: {
        userUID: string
        displayName: string
    }
    createdAt: Date
    updatedAt?: Date
}
