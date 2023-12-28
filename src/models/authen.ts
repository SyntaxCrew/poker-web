export interface JWT {
    accessToken: string
    refreshToken: string
}

export enum UserType {
    Anonymous = 'anonymous',
    User = 'user'
}

interface Token {
    exp: number
    iat: number
    userType: UserType
    userUUID: string
}

export interface AccessToken extends Token {
    type: 'access'
}

export interface RefreshToken extends Token {
    type: 'refresh'
}
