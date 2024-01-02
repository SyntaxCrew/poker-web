type UserType = 'anonymous' | 'user'

export interface UserProfile {
    userUUID: string
    userType: UserType
}
