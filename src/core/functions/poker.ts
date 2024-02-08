import { Poker } from "@core/@types/poker";
import { Timestamp } from "firebase/firestore";

export async function getPoker(roomNo: string): Promise<Poker | undefined> {
    try {
        if (roomNo != 'test') {
            throw Error('room no is not found')
        }
        const now = Timestamp.fromDate(new Date())

        const poker: Poker = {
            roomName: 'Room',
            roomNo: 'test',
            status: 'CLOSED',
            estimate: {
                activeDeckID: 'default',
                decks: [
                    {
                        deckID: 'default',
                        deckName: 'Fibonacci',
                        deckValues: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '🎵'],
                        isDefault: true,
                    }
                ],
            },
            user: {
                [`userUUID`]: {
                    displayName: 'You',
                    isActive: true,
                    isModerator: true,
                    isSpectator: false,
                    joinedAt: now,
                    lastActivedAt: now,
                    profileImageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
                },
            },
            votingAt: now,
            createdAt: now,
            updatedAt: now,
        }

        const voter = 19;
        const spectator = 20;

        for (let i=0; i<voter; i++) {
            poker.user[`voter${i+1}`] = {
                displayName: `Voter${i+1}`,
                isActive: true,
                isModerator: false,
                isSpectator: false,
                joinedAt: now,
                lastActivedAt: now,
                estimatePoint: i % 3 === 0 ? '1' : undefined,
            }
        }

        for (let i=0; i<spectator; i++) {
            poker.user[`spectator${i+1}`] = {
                displayName: i === 0 || i === spectator-1 ? 'Angelica Bonavia Celestia' : `Spectator${i+1}`,
                profileImageURL: i === 1 ? "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" : '',
                isActive: true,
                isModerator: false,
                isSpectator: true,
                joinedAt: now,
                lastActivedAt: now,
            }
        }

        return poker

    } catch (error) {
        return
    }
}
