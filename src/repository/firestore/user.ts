import { DocumentData, DocumentSnapshot, Timestamp, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getCurrentUser } from "../../firebase/authentication";
import firestore from "../../firebase/firestore";
import { deleteFile, getFileURL, uploadFile } from "../../firebase/storage";
import { converter } from "../../models/firestore";
import { User as UserModel, UserProfile } from "../../models/user";
import { User } from "firebase/auth";

const userCollection = "user";
export const userDoc = (userUID: string) => doc(firestore, userCollection, userUID).withConverter(converter<UserModel>());

async function userProfile(snapshot: DocumentSnapshot<UserModel, DocumentData>, currentUser: User, forceFetchProfile?: boolean): Promise<UserProfile | undefined> {
    let imageURL = currentUser.photoURL || undefined;
    if (snapshot.exists()) {
        const user = snapshot.data();
        if (forceFetchProfile && user.imageURL) {
            imageURL = await getFileURL(user.imageURL);
        }
        return {
            userUUID: user.userUID,
            email: user.email,
            displayName: user.displayName || 'Guest',
            isAnonymous: currentUser.isAnonymous,
            imageURL,
        };
    } else {
        return {
            userUUID: currentUser.uid,
            email: currentUser.email || undefined,
            displayName: currentUser.displayName || 'Guest',
            isAnonymous: currentUser.isAnonymous,
            imageURL,
        }
    }
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return;
    }
    const docSnap = await getDoc(userDoc(currentUser.uid));
    return await userProfile(docSnap, currentUser, true)
}

export async function watchUser(userUID: string, onNext: ((userProfile: UserProfile) => void)) {
    let cacheProfileImageObjectURL: string | undefined;
    let cacheProfileImageSignedURL: string | undefined;
    return onSnapshot(userDoc(userUID), async (snapshot) => {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return;
        }
        const user = await userProfile(snapshot, currentUser);
        if (!user) {
            return;
        }
        const userData = snapshot.data();
        if (userData?.imageURL) {
            if (!cacheProfileImageObjectURL || cacheProfileImageObjectURL !== userData.imageURL) {
                cacheProfileImageObjectURL = userData.imageURL;
                cacheProfileImageSignedURL = await getFileURL(userData.imageURL);
            }
            user.imageURL = cacheProfileImageSignedURL;
        }
        onNext(user);
    });
}

export async function signin(user: UserModel) {
    const now = Timestamp.fromDate(new Date());
    user.lastLoginAt = now;
    const docSnap = await getDoc(userDoc(user.userUID));
    if (docSnap.exists()) {
        user.displayName = undefined;
        user.imageURL = undefined;
        await updateDoc(userDoc(user.userUID), {...user, updatedAt: now});
    } else {
        await setDoc(userDoc(user.userUID), {...user, createdAt: now});
    }
}

export async function updateUserProfile(user: {userUID: string, displayName: string, file?: File}) {
    const docSnap = await getDoc(userDoc(user.userUID));
    if (!docSnap.exists()) {
        return;
    }

    const now = Timestamp.fromDate(new Date());
    let imageURL: string | undefined = undefined;
    if (user.file) {
        imageURL = await uploadFile('profile/'+user.userUID, user.file);
        deleteFile(docSnap.data().imageURL!);
    }

    const docsSnap = await getDocs(query(collection(firestore, 'poker'), where(`user.${user.userUID}`, '!=', null)));
    docsSnap.forEach(async (result) => {
        if (result.exists()) {
            await updateDoc(doc(firestore, 'poker', result.id), {
                [`user.${user.userUID}.displayName`]: user.displayName,
                [`user.${user.userUID}.imageURL`]: imageURL,
                updatedAt: now,
            })
        }
    })

    await updateDoc(userDoc(user.userUID), {displayName: user.displayName, imageURL, updatedAt: now});
}

export async function isExistsEmail(email: string) {
    const docsSnap = await getDocs(query(collection(firestore, 'user'), where('email', '==', email)));
    return !docsSnap.empty;
}
