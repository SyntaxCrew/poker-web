import { Timestamp } from "firebase/firestore"

export interface User {
    userUUID: string
    displayName: string
    profileImageURL?: string
    isAnonymous: boolean
    lastLoginAt: Timestamp
    createdAt: Timestamp
    updatedAt?: Timestamp
}
