import { doc, setDoc, getDoc } from "firebase/firestore";
import { Poker } from "../models/poker";
import { randomString } from "../utils/generator";
import firestore from "./firestore";
import { converter } from "../models/firestore";

const pokerCollection = "poker"
const pokerDoc = (roomID: string) => doc(firestore, pokerCollection, roomID).withConverter(converter<Poker>());

export async function isPokerRoomExists(roomID: string): Promise<boolean> {
    const docSnap = await getDoc(pokerDoc(roomID))
    return docSnap.exists()
}

export async function createPokerRoom(userUUID: string, displayName: string): Promise<string> {
    const roomID = randomString(20);
    const poker: Poker = {
        isShowEstimates: false,
        guests: [],
        owner: {
            userUUID,
            displayName,
            deviceActiveCount: 1,
        },
        createdAt: new Date(),
    }
    await setDoc(pokerDoc(roomID), poker)
    return roomID
}
