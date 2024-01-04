import { UserProfile } from "../models/user";
import { randomString } from "../utils/generator";
import auth from "./authentication";

export async function getUserProfile() {
    await auth.authStateReady();
    if (auth.currentUser) {
        return {
            userType: auth.currentUser.isAnonymous ? 'anonymous' : 'user',
            userUUID: auth.currentUser.uid,
            sessionUUID: randomString(20),
        } as UserProfile;
    }
}
