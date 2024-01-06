import { updateProfile } from "firebase/auth";
import { Timestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getCurrentUser } from "../../firebase/authentication";
import firestore from "../../firebase/firestore";
import { converter } from "../../models/firestore";
import { User, UserProfile } from "../../models/user";
import { randomString } from "../../utils/generator";

const userCollection = "user";
const userDoc = (userUID: string) => doc(firestore, userCollection, userUID).withConverter(converter<User>());

export async function getUserProfile(): Promise<UserProfile | undefined> {
    const currentUser = await getCurrentUser();
    if (currentUser) {
        if (currentUser.isAnonymous) {
            return {
                userUUID: currentUser.uid,
                email: currentUser.email ?? undefined,
                displayName: currentUser.displayName || 'Guest',
                isAnonymous: currentUser.isAnonymous,
                sessionUUID: randomString(20),
            };
        }
        const docSnap = await getDoc(userDoc(currentUser.uid));
        if (docSnap.exists()) {
            const user = docSnap.data();
            return {
                userUUID: user.userUID,
                email: user.email,
                displayName: user.displayName,
                isAnonymous: false,
                sessionUUID: randomString(20),
                imageURL: user.imageURL || currentUser.photoURL || undefined,
            };
        }
    }
}

export async function signin(user: User) {
    const now = Timestamp.fromDate(new Date());
    user.lastLoginAt = now;
    try {
        await updateDoc(userDoc(user.userUID), {...user, updatedAt: now});
    } catch (error) {
        await setDoc(userDoc(user.userUID), {...user, createdAt: now});
    }
}

export async function updateUser(user: User) {
    if (user.isAnonymous) {
        updateProfile(await getCurrentUser(), { displayName: user.displayName, photoURL: user.imageURL });
        return;
    }
    const now = Timestamp.fromDate(new Date());
    await updateDoc(userDoc(user.userUID), {...user, updatedAt: now});
}
