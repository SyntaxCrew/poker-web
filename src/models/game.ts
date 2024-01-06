import { Timestamp } from "firebase/firestore"

export interface Game {
    userUID: string
    customDecks: Deck[]
    createdAt?: Timestamp
    updatedAt?: Timestamp
}

export interface Deck {
    deckName: string
    deckValues: string[]
}
