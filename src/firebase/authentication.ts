import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import app from "./firebase";
import { signin } from "./user";

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        const userCredential = await signInAnonymously(auth);
        await signin({
            userUID: userCredential.user.uid,
            isAnonymous: true,
            isLinkGoogle: false,
        });

    } else if (!user.isAnonymous) {
        if (user.providerData?.length > 0) {
            await signin({
                userUID: user.uid,
                email: user.email || undefined,
                displayName: user.displayName || '',
                isAnonymous: false,
                isLinkGoogle: user.providerData.findIndex(provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID) !== -1
            });
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
