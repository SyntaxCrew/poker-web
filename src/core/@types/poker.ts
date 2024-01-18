import { Timestamp } from "firebase/firestore"
import { Map } from "@core/@types/map"

export type PokerStatus = 'CLOSED' | 'OPENED'

export interface Poker {
    roomNo: string
    roomName: string
    status: PokerStatus
    estimate: PokerEstimate
    user: Map<PokerUser>
    votingAt: Timestamp
    createdAt: Timestamp
    updatedAt?: Timestamp
}

export interface PokerUser {
    displayName: string
    profileImageURL?: string
    estimatePoint?: string
    isActive: boolean
    isSpectator: boolean
    isModerator: boolean
    joinedAt: Timestamp
    lastActivedAt: Timestamp
}

export interface PokerEstimate {
    activeDeckID: string
    decks: PokerDeck[]
}

export interface PokerDeck {
    deckID: string
    deckName: string
    deckValues: string[]
    isDefault: boolean
}
