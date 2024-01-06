import client from "../../backend/client";
import { UserProfile } from "../../models/user";
import { randomString } from "../../utils/generator";

export async function getUserProfile() {
    const response = await client<UserProfile>({
        url: '/user/profile',
        method: 'GET'
    })
    if (response.data) {
        response.data.sessionUUID = randomString(20);
    }
    return response.data
}
