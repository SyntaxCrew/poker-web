import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import app from "./firebase";
import { signin } from "./user";

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        await signInAnonymously(auth);
    }
});

export async function signInGoogle() {
    await auth.authStateReady();
    const provider = new GoogleAuthProvider();
    const response = await signInWithPopup(auth, provider);
    if (response?.user) {
        await signin({
            userUID: response.user.uid,
            email: response.user.email || undefined,
            displayName: response.user.displayName || '',
            isAnonymous: false,
            isLinkGoogle: response.user.providerData.findIndex(provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID) !== -1
        });
        return response.user;
    }
}

export async function signout() {
    await auth.authStateReady();
    await signOut(auth);
    await waitForSignin();
}

export async function getCurrentUser() {
    await auth.authStateReady();
    await waitForSignin();
    return auth.currentUser!;
}

async function waitForSignin() {
    return new Promise(resolve => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                unsubscribe();
                resolve("");
            }
        })
    })
}

export default auth;
