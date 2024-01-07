import { updateProfile } from "firebase/auth";
import { Timestamp, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getCurrentUser } from "../../firebase/authentication";
import firestore from "../../firebase/firestore";
import { getFileURL, uploadFile } from "../../firebase/storage";
import { converter } from "../../models/firestore";
import { User, UserProfile } from "../../models/user";
import { randomString } from "../../utils/generator";

const userCollection = "user";
const userDoc = (userUID: string) => doc(firestore, userCollection, userUID).withConverter(converter<User>());

export async function getUserProfile(): Promise<UserProfile | undefined> {
    const currentUser = await getCurrentUser();
    if (currentUser) {
        let imageURL = currentUser.photoURL || undefined;
        if (currentUser.isAnonymous) {
            if (currentUser.photoURL) {
                imageURL = await getFileURL(currentUser.photoURL);
            }
            return {
                userUUID: currentUser.uid,
                email: currentUser.email ?? undefined,
                displayName: currentUser.displayName || 'Guest',
                isAnonymous: currentUser.isAnonymous,
                imageURL,
                sessionUUID: randomString(20),
            };
        }

        const docSnap = await getDoc(userDoc(currentUser.uid));
        if (docSnap.exists()) {
            const user = docSnap.data();
            if (user.imageURL) {
                imageURL = await getFileURL(user.imageURL);
            }
            return {
                userUUID: user.userUID,
                email: user.email,
                displayName: user.displayName || '',
                isAnonymous: false,
                imageURL: imageURL || currentUser.photoURL || undefined,
                sessionUUID: randomString(20),
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

export async function updateUserProfile(user: {userUID: string, isAnonymous: boolean, displayName: string, file?: File}) {
    let imageURL: string | undefined = undefined;
    if (user.file) {
        imageURL = await uploadFile('profile/'+user.userUID, user.file);
    }
    if (user.isAnonymous) {
        await updateProfile(await getCurrentUser(), { displayName: user.displayName, photoURL: imageURL });
        return;
    }
    const now = Timestamp.fromDate(new Date());
    await updateDoc(userDoc(user.userUID), {displayName: user.displayName, imageURL, updatedAt: now});
}

export async function isExistsEmail(email: string) {
    const docsSnap = await getDocs(query(collection(firestore, 'user'), where('email', '==', email)));
    return !docsSnap.empty;
}
