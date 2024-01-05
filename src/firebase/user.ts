import { signInAnonymously } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import auth from "./authentication";
import firestore from "./firestore";
import { converter } from "../models/firestore";
import { User, UserProfile } from "../models/user";
import { randomString } from "../utils/generator";

const userCollection = "user";
const userDoc = (userUID: string) => doc(firestore, userCollection, userUID).withConverter(converter<User>());

export async function getUserProfile(): Promise<UserProfile | undefined> {
    await auth.authStateReady();
    if (!auth.currentUser) {
        await signInAnonymously(auth);
        await auth.authStateReady();
    }
    if (auth.currentUser) {
        if (auth.currentUser.isAnonymous) {
            return {
                userUUID: auth.currentUser.uid,
                email: auth.currentUser.email ?? undefined,
                displayName: auth.currentUser.displayName ?? undefined,
                isAnonymous: auth.currentUser.isAnonymous,
                sessionUUID: randomString(20),
            };
        }
        const docSnap = await getDoc(userDoc(auth.currentUser.uid))
        if (docSnap.exists()) {
            const user = docSnap.data()
            return {
                userUUID: user.userUID,
                email: user.email,
                displayName: user.displayName,
                isAnonymous: false,
                sessionUUID: randomString(20),
                imageURL: auth.currentUser.photoURL || undefined,
            };
        }
    }
}

export async function signin(user: User) {
    const now = Timestamp.fromDate(new Date());
    user.lastLoginAt = now;
    await auth.authStateReady();
    try {
        await updateDoc(userDoc(user.userUID), {...user, updatedAt: now})
    } catch (error) {
        await setDoc(userDoc(user.userUID), {...user, createdAt: now});
    }
}
