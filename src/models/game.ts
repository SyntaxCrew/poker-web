import { Timestamp } from "firebase/firestore"

export interface Game {
    userUID: string
    customDecks: Deck[]
    createdAt?: Timestamp
    updatedAt?: Timestamp
}

export interface Deck {
    deckID: string
    deckName: string
    deckValues: string[]
    isDefault: boolean
}
