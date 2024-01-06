import { Timestamp, arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import firestore from "../../firebase/firestore";
import { converter } from "../../models/firestore";
import { Deck, Game } from "../../models/game";
import { randomString } from "../../utils/generator";

const gameCollection = "game";
const gameDoc = (userUID: string) => doc(firestore, gameCollection, userUID).withConverter(converter<Game>());

export async function getCustomDecks(userUID: string) {
    const docSnap = await getDoc(gameDoc(userUID));
    if (!docSnap.exists()) {
        return [];
    }
    return docSnap.data().customDecks;
}

export async function createCustomDeck(userUID: string, deck: Deck) {
    deck.deckID = randomString(20);
    const now = Timestamp.fromDate(new Date());
    const data = {
        userUID,
        customDecks: arrayUnion(deck),
    }
    try {
        await updateDoc(gameDoc(userUID), {...data, createdAt: now});
    } catch (error) {
        await setDoc(gameDoc(userUID), {...data, updatedAt: now});
    }
}

export async function deleteCustomDeck(userUID: string, deck: Deck) {
    const now = Timestamp.fromDate(new Date());
    await updateDoc(gameDoc(userUID), {
        userUID,
        customDecks: arrayRemove(deck),
        updatedAt: now,
    });
}
