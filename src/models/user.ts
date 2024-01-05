import { Timestamp } from "firebase/firestore"

export interface UserProfile {
    displayName?: string
    userUUID: string
    email?: string
    imageURL?: string
    isAnonymous: boolean
    sessionUUID: string
}

export interface User {
    userUID: string
    email?: string
    displayName?: string
    isAnonymous: boolean
    isLinkGoogle: boolean
    imageURL?: string
    createdAt?: Timestamp
    updatedAt?: Timestamp
    lastLoginAt?: Timestamp
}
