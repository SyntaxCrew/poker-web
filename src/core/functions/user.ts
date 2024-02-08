import { User } from "@core/@types/user";
import { Timestamp } from "firebase/firestore";

export async function getUser(): Promise<User> {
    const now = Timestamp.fromDate(new Date())
    return {
        userUUID: 'userUUID',
        displayName: 'You',
        isAnonymous: true,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        profileImageURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png'
    }
}
