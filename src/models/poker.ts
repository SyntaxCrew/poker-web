export interface Poker {
    roomID: string
    isShowEstimates: boolean
    owner: PokerUser
    guests: PokerUser[]
    createdAt: Date
    updatedAt?: Date
}

export interface PokerUser {
    userUUID: string
    displayName: string
    estimatePoint?: number
    deviceActiveCount: number // for listening user leave room, then terminate the guest if device is decreased to zero
}
