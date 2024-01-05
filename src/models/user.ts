import { Timestamp } from "firebase/firestore"

export interface UserProfile {
    displayName?: string
    userUUID: string
    email?: string
    isAnonymous: boolean
    sessionUUID: string
}

export interface User {
    userUID: string
    email?: string
    displayName?: string
    isLinkGoogle?: boolean
    createdAt?: Timestamp
    updatedAt?: Timestamp
    lastLoginAt?: Timestamp
}
