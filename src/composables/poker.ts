import { Poker } from "../models/poker";
import { UserProfile } from "../models/user";
import { updateEstimateStatus } from "../repository/firestore/poker";

export function isUsersExists(poker: Poker, isPoked?: boolean) {
    if (!poker) {
        return false;
    }
    for (const user of Object.values(poker.user)) {
        if (!user.isSpectator && user.activeSessions?.length > 0 && (!isPoked || user.estimatePoint != null)) {
            return true;
        }
    }
    return false;
}

export function displayButton(poker: Poker, profile: UserProfile, isAllowOption: boolean) {
    return isUsersExists(poker) && poker && (poker.user[profile.userUUID]?.isFacilitator || (isAllowOption && !poker.user[profile.userUUID]?.isSpectator && poker.user[profile.userUUID]?.activeSessions?.length > 0))
}

export async function flipCard(poker: Poker) {
    if (poker) {
        await updateEstimateStatus(poker.roomID, poker.estimateStatus === 'CLOSED' ? 'OPENED' : 'CLOSED');
    }
}

export function isVoteAll(poker: Poker) {
    let isVoteAll = true;
    let hasUser = false;
    for (const user of Object.values(poker.user)) {
        if (user.isSpectator) {
            continue;
        }
        if (user.activeSessions?.length > 0) {
            hasUser = true;
            if (user.estimatePoint == null) {
                isVoteAll = false;
                break;
            }
        }
    }

    return hasUser && isVoteAll && poker.estimateStatus === 'CLOSED';
}
