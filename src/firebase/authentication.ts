import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import app from "./firebase";
import { signin } from "./user";
import { User } from "../models/user";

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        await signInAnonymously(auth);
    } else if (!user.isAnonymous) {
        if (user.providerData?.length > 0) {
            const userData: User = {
                userUID: user.uid,
                email: user.email || undefined,
                displayName: user.displayName || '',
                isLinkGoogle: user.providerData.findIndex(provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID) !== -1
            };

            await signin(userData);
        }
    }
});

export async function signInGoogle() {
    const provider = new GoogleAuthProvider();
    const response = await signInWithPopup(auth, provider);
    await auth.authStateReady();
    return response?.user;
}

export async function signout() {
    await signOut(auth);
    await auth.authStateReady();
}

export default auth;
