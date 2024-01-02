import { DocumentData, onSnapshot, doc, setDoc, getDoc, DocumentSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import firestore from "./firestore";
import { converter } from "../models/firestore";
import { Poker } from "../models/poker";
import { randomString } from "../utils/generator";

const pokerCollection = "poker";
const pokerDoc = (roomID: string) => doc(firestore, pokerCollection, roomID).withConverter(converter<Poker>());

export async function isExistsPokerRoom(roomID: string) {
    const docSnap = await getDoc(pokerDoc(roomID));
    return docSnap.exists();
}

export async function joinPokerRoom(req: {
    userUUID: string,
    sessionUUID: string,
    roomID: string,
    onNewJoiner: (() => {displayName: string, isSpectator?: boolean}),
    onNext: ((snapshot: DocumentSnapshot<Poker, DocumentData>) => void),
    onNotFound: (() => void),
}) {
    const docSnap = await getDoc(pokerDoc(req.roomID));
    if (!docSnap.exists()) {
        req.onNotFound();
        return;
    }

    // set display name on new joiner
    if (!docSnap.data().user[req.userUUID]) {
        const { displayName, isSpectator } = req.onNewJoiner();
        if (!displayName) {
            req.onNotFound();
            return;
        }
        await newJoiner(req.userUUID, req.roomID, displayName, isSpectator);
    }

    // set active session
    await updateActiveSession(req.userUUID, req.sessionUUID, req.roomID, 'join');

    return onSnapshot(pokerDoc(req.roomID), req.onNext);
}

export async function createPokerRoom(userUUID: string, displayName: string): Promise<string> {
    const roomID = randomString(20);
    const poker: Poker = {
        isShowEstimates: false,
        user: {
            [userUUID]: {
                displayName,
                isOwner: true,
                activeSessions: [],
            }
        },
        createdAt: new Date(),
    }

    await setDoc(pokerDoc(roomID), poker);
    return roomID;
}

export async function leavePokerRoom(userUUID: string, sessionUUID: string, roomID: string) {
    return await updateActiveSession(userUUID, sessionUUID, roomID, 'leave');
}

export async function pokeCard(userUUID: string, roomID: string, estimatePoint?: number) {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.estimatePoint`]: estimatePoint || null,
        updatedAt: new Date(),
    });
}

export async function openCard(roomID: string, isShowEstimates: boolean) {
    await updateDoc(pokerDoc(roomID), {
        isShowEstimates,
        updatedAt: new Date(),
    });
}

async function updateActiveSession(userUUID: string, sessionUUID: string, roomID: string, event: 'join' | 'leave') {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.activeSessions`]: event === 'join' ? arrayUnion(sessionUUID) : arrayRemove(sessionUUID),
        updatedAt: new Date(),
    });
}

async function newJoiner(userUUID: string, roomID: string, displayName: string, isSpectator?: boolean) {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.displayName`]: displayName,
        [`user.${userUUID}.isSpectator`]: isSpectator,
        updatedAt: new Date(),
    });
}
