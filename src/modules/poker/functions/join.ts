import { Poker } from "@core/@types/poker";
import { User } from "@core/@types/user";

export async function joinSection(poker: Poker, user: User, joinAs: 'voter' | 'spectator') {
    if (!poker.user[user.userUUID] || (poker.user[user.userUUID].isSpectator && joinAs === 'spectator') || (!poker.user[user.userUUID].isSpectator && joinAs === 'voter')) {
        return;
    }
    // call firestore to update flag isSpectator = joinAs === 'spectator'
}
