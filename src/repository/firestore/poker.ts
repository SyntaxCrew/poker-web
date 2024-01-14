import { onSnapshot, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, FieldValue, deleteField, Timestamp, getDocs, query, collection, where, deleteDoc } from "firebase/firestore";
import firestore from "../../firebase/firestore";
import { getFileURL } from "../../firebase/storage";
import { converter } from "../../models/firestore";
import { Map } from "../../models/generic";
import { EstimateStatus, MyPokerGame, Poker, PokerHistory, PokerOption } from "../../models/poker";
import { randomString } from "../../utils/generator";
import { timeDiffString } from "../../utils/time";
import { numberFormat } from "../../utils/number";
import { userDoc } from "./user";

const pokerCollection = "poker";
export const pokerDoc = (roomID: string) => doc(firestore, pokerCollection, roomID).withConverter(converter<Poker>());

export async function isExistsPokerRoom(roomID: string) {
    const docSnap = await getDoc(pokerDoc(roomID));
    return docSnap.exists();
}

export function joinPokerRoom(roomID: string, onNext: ((data?: Poker) => void)) {
    const imageMapping: Map<{objectURL?: string, signedURL?: string}> = {};
    return onSnapshot(pokerDoc(roomID), async (snapshot) => {
        const data = snapshot.data();
        if (snapshot.exists() && data) {
            for (const [userUUID, user] of Object.entries(data.user)) {
                if (!imageMapping[userUUID]) {
                    imageMapping[userUUID] = {objectURL: user.imageURL}
                }
                if (user.imageURL && (imageMapping[userUUID].objectURL != user.imageURL || !imageMapping[userUUID].signedURL)) {
                    imageMapping[userUUID].signedURL = await getFileURL(user.imageURL);
                }
                data.user[userUUID].imageURL = imageMapping[userUUID].signedURL
            }
        }
        onNext(data);
    });
}

export async function createPokerRoom(userUUID: string, displayName: string, imageURL: string | undefined, roomName: string, isSpectator: boolean, option: PokerOption): Promise<string> {
    const roomID = randomString(20);
    const now = Timestamp.fromDate(new Date());
    const poker: Poker = {
        roomID,
        roomName,
        session: randomString(20),
        estimateStatus: 'CLOSED',
        user: {
            [userUUID]: {
                displayName,
                imageURL,
                isFacilitator: true,
                activeSessions: [],
                isSpectator,
                joinedAt: now,
            }
        },
        option,
        createdAt: now,
    }

    await setDoc(pokerDoc(roomID), poker);
    return roomID;
}

export async function updatePokerOption(roomID: string, roomName: string, oldFacilitatorUUID: string, newFacilitatorUUID: string, option: PokerOption) {
    let data = {
        roomName,
        option,
        updatedAt: Timestamp.fromDate(new Date()),
    };
    if (oldFacilitatorUUID !== newFacilitatorUUID) {
        data = {
            ...data,
            [`user.${oldFacilitatorUUID}.isFacilitator`]: deleteField(),
            [`user.${newFacilitatorUUID}.isFacilitator`]: true,
        }
    }
    await updateDoc(pokerDoc(roomID), data);
}

export async function leavePokerRoom(userUUID: string, sessionUUID: string, roomID: string) {
    return await updateActiveSession(userUUID, sessionUUID, roomID, 'leave');
}

export async function joinGame(userUUID: string, displayName: string, imageURL: string | undefined, sessionUUID: string, roomID: string, event: 'join' | 'leave') {
    const docSnap = await getDoc(pokerDoc(roomID));
    const poker = docSnap.data();
    if (!poker) {
        return;
    }

    const data: Map<boolean | null | FieldValue | EstimateStatus | string | undefined> = {
        [`user.${userUUID}.isSpectator`]: event === 'leave',
        [`user.${userUUID}.displayName`]: displayName,
        [`user.${userUUID}.imageURL`]: imageURL,
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
            data.estimateStatus = 'CLOSED';
        }
        data[`user.${userUUID}.estimatePoint`] = null;
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
    const docSnap = await getDoc(pokerDoc(roomID));
    const poker = docSnap.data();
    if (poker) {
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
                result: getSummaryEstimateResult(poker),
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
    return await updateDoc(pokerDoc(roomID), data);
}

export async function changeFacilitator(fromUserUUID: string, toUserUUID: string, roomID: string) {
    await updateDoc(pokerDoc(roomID), {
        [`user.${fromUserUUID}.isFacilitator`]: deleteField(),
        [`user.${toUserUUID}.isFacilitator`]: true,
        updatedAt: Timestamp.fromDate(new Date()),
    });
}

export async function revokeUser(userUID: string, sessionUUID: string) {
    const docsSnap = await getDocs(query(collection(firestore, pokerCollection), where(`user.${userUID}`, '!=', null)));
    docsSnap.forEach(async (result) => {
        if (result.exists()) {
            await updateActiveSession(userUID, sessionUUID, result.id, 'leave');
        }
    })
}

export async function replaceUser(fromUserUID: string, toUserUID: string, sessionUUID: string) {
    const now = Timestamp.fromDate(new Date())
    const toUserSnap = await getDoc(userDoc(toUserUID));
    if (!toUserSnap.exists()) {
        return;
    }
    const toUser = toUserSnap.data();

    const docsSnap = await getDocs(query(
        collection(firestore, pokerCollection).withConverter(converter<Poker>()),
        where(`user.${fromUserUID}`, '!=', null),
    ));
    docsSnap.forEach(async (result) => {
        if (result.exists()) {
            const data = result.data();
            const isOldUserActive = data.user[fromUserUID]?.activeSessions?.length > 0 && !data.user[fromUserUID]?.isSpectator;
            const isNewUserActive = data.user[toUserUID]?.activeSessions?.length > 0 && !data.user[toUserUID]?.isSpectator;

            await updateDoc(pokerDoc(result.id), {
                [`user.${toUserUID}.displayName`]: toUser.displayName,
                [`user.${toUserUID}.imageURL`]: toUser.imageURL,
                [`user.${toUserUID}.isSpectator`]: !(isOldUserActive || isNewUserActive),
                [`user.${toUserUID}.isFacilitator`]: data.user[toUserUID]?.isFacilitator || data.user[fromUserUID].isFacilitator,
                [`user.${toUserUID}.activeSessions`]: arrayUnion(sessionUUID),
                [`user.${toUserUID}.joinedAt`]: data.user[fromUserUID]?.joinedAt || now,
                [`user.${fromUserUID}`]: deleteField(),
                updatedAt: now,
            })
        }
    })
}

export async function getMyGames(userUID: string): Promise<MyPokerGame[]> {
    const docsSnap = await getDocs(query(
        collection(firestore, pokerCollection).withConverter(converter<Poker>()),
        where(`user.${userUID}`, '!=', null),
    ));
    if (docsSnap.empty) {
        return [];
    }
    return docsSnap.docs.map(doc => {
        const data = doc.data()!;
        let total = 0, voter = 0, facilitatorUID = '';
        for (const [uid, user] of Object.entries(data.user)) {
            if (user.isFacilitator) {
                facilitatorUID = uid;
            }
            if (!user.activeSessions || user.activeSessions.length === 0) {
                continue;
            }
            total++;
            if (!user.isSpectator) {
                voter++;
            }
        }
        return {
            roomID: data.roomID,
            roomName: data.roomName,
            user: {
                total,
                voter,
            },
            facilitator: {
                userUID: facilitatorUID,
                displayName: data.user[facilitatorUID].displayName,
            },
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        }
    })
}

export async function deleteRoom(userUID: string, roomID: string) {
    const docSnap = await getDoc(pokerDoc(roomID));
    if (!docSnap.exists()) {
        return;
    }
    const poker = docSnap.data();
    if (!poker.user[userUID] || !poker.user[userUID].isFacilitator) {
        throw Error('Permission denied');
    }
    await deleteDoc(pokerDoc(roomID));
}

export async function updateIssueName(roomID: string, issueName?: string) {
    await updateDoc(pokerDoc(roomID), {
        issueName: issueName ?? '',
        updatedAt: Timestamp.fromDate(new Date()),
    });
}

export async function updateActiveSession(userUUID: string, sessionUUID: string, roomID: string, event: 'join' | 'leave') {
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.activeSessions`]: event === 'join' ? arrayUnion(sessionUUID) : arrayRemove(sessionUUID),
        updatedAt: Timestamp.fromDate(new Date()),
    });
}

export async function newJoiner(userUUID: string, roomID: string, displayName: string, imageURL: string | undefined, isSpectator: boolean, sessionUUID: string) {
    const now = Timestamp.fromDate(new Date())
    await updateDoc(pokerDoc(roomID), {
        [`user.${userUUID}.displayName`]: displayName,
        [`user.${userUUID}.imageURL`]: imageURL,
        [`user.${userUUID}.isSpectator`]: isSpectator,
        [`user.${userUUID}.activeSessions`]: arrayUnion(sessionUUID),
        [`user.${userUUID}.joinedAt`]: now,
        updatedAt: now,
    });
}

function getSummaryEstimateResult(poker: Poker) {
    let sum = 0;
    let isNumberTotal = 0;
    let lastMaxPoint = "";
    const result: Map<number> = {};
    const validUsers = Object.values(poker.user).filter(user => user.estimatePoint != null);
    for (const user of validUsers) {
        if (!isNaN(Number(user.estimatePoint))) {
            isNumberTotal++;
            sum += Number(user.estimatePoint);
        }
        result[user.estimatePoint!] = result[user.estimatePoint!] ? result[user.estimatePoint!]+1 : 1;
    }

    let max = 0;
    for (const count of Object.values(result)) {
        if (count > max) {
            max = count;
        }
    }

    const average = sum/isNumberTotal;
    if (isNumberTotal > 0 && !isNaN(Number(average))) {
        return numberFormat(average).toString();
    }

    for (const [point, count] of Object.entries(result)) {
        if (count === max) {
            lastMaxPoint = point;
        }
    }
    return lastMaxPoint;
}
