import client from "../backend/client";
import { UserProfile } from "../models/user";

export async function getUserProfile() {
    const response = await client<UserProfile>({
        url: '/user/profile',
        method: 'GET'
    })
    return response.data
}
