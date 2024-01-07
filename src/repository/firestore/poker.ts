import { DocumentData, onSnapshot, doc, setDoc, getDoc, DocumentSnapshot, updateDoc, arrayUnion, arrayRemove, FieldValue, deleteField, Timestamp } from "firebase/firestore";
import firestore from "../../firebase/firestore";
import { converter } from "../../models/firestore";
import { Map } from "../../models/generic";
import { EstimateStatus, Poker, PokerHistory, PokerOption } from "../../models/poker";
import { randomString } from "../../utils/generator";
import { timeDiffString } from "../../utils/time";

const pokerCollection = "poker";
const pokerDoc = (roomID: string) => doc(firestore, pokerCollection, roomID).withConverter(converter<Poker>());

export async function isExistsPokerRoom(roomID: string) {
    const docSnap = await getDoc(pokerDoc(roomID));
    return docSnap.exists();
}

export async function checkPokerRoom(roomID: string, userUUID: string) {
    const docSnap = await getDoc(pokerDoc(roomID));
    return {
        isExists: docSnap.exists(),
        isJoined: docSnap.data()?.user[userUUID] !== undefined || false,
    }
}

export async function joinPokerRoom(req: {
    userUUID: string,
    sessionUUID: string,
    roomID: string,
    onNewJoiner: (() => {displayName: string, isSpectator: boolean}),
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

export async function createPokerRoom(userUUID: string, displayName: string, roomName: string, isSpectator: boolean, option: PokerOption): Promise<string> {
    const roomID = randomString(20);
    const poker: Poker = {
        roomName,
        session: randomString(20),
        estimateStatus: 'CLOSED',
        user: {
            [userUUID]: {
                displayName,
                isFacilitator: true,
                activeSessions: [],
                isSpectator,
            }
        },
        option,
        createdAt: Timestamp.fromDate(new Date()),
    }

    await setDoc(pokerDoc(roomID), poker);
    return roomID;
}

export async function leavePokerRoom(userUUID: string, sessionUUID: string, roomID: string) {
    return await updateActiveSession(userUUID, sessionUUID, roomID, 'leave');
}

// get poker from client instead of fetch on this layer
export async function joinGame(poker: Poker, userUUID: string, sessionUUID: string, roomID: string, event: 'join' | 'leave') {
    const data: Map<boolean | null | FieldValue | EstimateStatus> = {
        [`user.${userUUID}.isSpectator`]: event === 'leave',
    }
    if (event === 'leave') {
        let isExistsUser = false;
        for (const pokerUserUUID of Object.keys(poker.user)) {
            if (userUUID === pokerUserUUID) {
                continue;
            }
            if (!poker.user[pokerUserUUID].isSpectator && poker.user[pokerUserUUID].activeSessions?.length > 0 && poker.user[pokerUserUUID].estimatePoint != null) {
                isExistsUser = true;
                break;
            }
        }
        if (!isExistsUser) {
            data.estimateStatus = 'CLOSED'
        }
        data[`user.${userUUID}.estimatePoint`] = null;
        data[`user.${userUUID}.activeSessions`] = arrayRemove(sessionUUID);
    } else {
        data[`user.${userUUID}.activeSessions`] = arrayUnion(sessionUUID);
    }

    await updateDoc(pokerDoc(roomID), {...data, updatedAt: Timestamp.fromDate(new Date())});
}

export async function clearUsers(roomID: string, userUUID?: string) {
    let userUUIDs: string[] = userUUID ? [userUUID] : [];
    const userData: Map<null | string[] | boolean | EstimateStatus> = {};

    const docSnap = await getDoc(pokerDoc(roomID));
    const poker = docSnap.data();
    if (!poker) {
        return;
    }

    if (!userUUID) {
        userData.estimateStatus = 'CLOSED';
        userUUIDs = Object.keys(poker.user);
    } else {
        let existsUser = false;
        let hasVote = false;
        for (const pokerUserUUID of Object.keys(poker.user)) {
            if (userUUID === pokerUserUUID) {
                continue;
            }
            if (!poker.user[pokerUserUUID].isSpectator && poker.user[pokerUserUUID].activeSessions?.length > 0) {
                existsUser = true;
                if (poker.user[pokerUserUUID].estimatePoint != null) {
                    hasVote = true;
                    break;
                }
            }
        }
        if (!existsUser || !hasVote) {
            userData.estimateStatus = 'CLOSED';
        }
    }

    for (const userUUID of userUUIDs) {
        userData[`user.${userUUID}.estimatePoint`] = null;
        userData[`user.${userUUID}.activeSessions`] = [];
        userData[`user.${userUUID}.isSpectator`] = true;
    }

    await updateDoc(pokerDoc(roomID), {...userData, updatedAt: Timestamp.fromDate(new Date())});
}

export async function pokeCard(userUUID: string, roomID: string, estimatePoint?: string) {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.estimatePoint`]: estimatePoint ?? null,
        updatedAt: Timestamp.fromDate(new Date()),
    });
}

export async function updateEstimateStatus(roomID: string, estimateStatus: EstimateStatus) {
    const now = Timestamp.fromDate(new Date());
    let data = {
        estimateStatus,
        updatedAt: now,
    };
    if (['CLOSED', 'OPENED'].includes(estimateStatus)) {
        const docSnap = await getDoc(pokerDoc(roomID));
        const poker = docSnap.data();
        if (poker) {
            // prevent update concurrent by other users
            if (estimateStatus === poker.estimateStatus) {
                return;
            }

            const userData: Map<null | FieldValue | Timestamp | PokerHistory | string> = {};
            if (estimateStatus === 'CLOSED') {
                userData.issueName = deleteField();
                userData.votingAt = now;
                for (const userUUID of Object.keys(poker.user)) {
                    userData[`user.${userUUID}.estimatePoint`] = null;
                    userData.session = randomString(20);
                }

            } else if (estimateStatus === 'OPENED') {
                const pokerHistory: PokerHistory = {
                    issueName: poker.issueName,
                    date: now,
                    total: 0,
                    voted: 0,
                    playerResult: [],
                    result: '', // average or median or mode
                }
                if (poker.votingAt) {
                    pokerHistory.duration = timeDiffString(poker.votingAt.toDate(), now.toDate())
                }
                for (const userUUID of Object.keys(poker.user)) {
                    if (!poker.user[userUUID].isSpectator && (poker.user[userUUID].activeSessions?.length > 0 || poker.user[userUUID].estimatePoint != null)) {
                        pokerHistory.total++;
                    }
                    if (poker.user[userUUID].estimatePoint != null) {
                        pokerHistory.voted++;
                        pokerHistory.playerResult.push({
                            displayName: poker.user[userUUID].displayName,
                            estimatePoint: poker.user[userUUID].estimatePoint!,
                        })
                    }
                }
                userData[`history.${poker.session}`] = pokerHistory;
            }
            data = {...data, ...userData};
        }
    }
    return await updateDoc(pokerDoc(roomID), data);
}

export async function changeFacilitator(fromUserUUID: string, toUserUUID: string, roomID: string) {
    await updateDoc(pokerDoc(roomID), {
        [`user.${fromUserUUID}.isFacilitator`]: deleteField(),
        [`user.${toUserUUID}.isFacilitator`]: true,
        updatedAt: Timestamp.fromDate(new Date()),
    });
}

async function updateActiveSession(userUUID: string, sessionUUID: string, roomID: string, event: 'join' | 'leave') {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.activeSessions`]: event === 'join' ? arrayUnion(sessionUUID) : arrayRemove(sessionUUID),
        updatedAt: Timestamp.fromDate(new Date()),
    });
}

async function newJoiner(userUUID: string, roomID: string, displayName: string, isSpectator: boolean) {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.displayName`]: displayName,
        [`user.${userUUID}.isSpectator`]: isSpectator,
        updatedAt: Timestamp.fromDate(new Date()),
    });
}
