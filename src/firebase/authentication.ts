import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, checkActionCode, confirmPasswordReset, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import app from "./firebase";
import { AnonymousLocalStorageKey } from "../models/key";

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        Object.values(AnonymousLocalStorageKey).forEach(key => localStorage.removeItem(key));
        const userCredential = await signInAnonymously(auth);
        await updateProfile(userCredential.user, { displayName: 'Guest' });
    }
});

export async function createUser(email: string, password: string) {
    await auth.authStateReady();
    const response = await createUserWithEmailAndPassword(auth, email, password);
    return response?.user;
}

export async function signInEmailPassword(email: string, password: string) {
    await auth.authStateReady();
    const response = await signInWithEmailAndPassword(auth, email, password);
    return response?.user;
}

export async function signInGoogle() {
    await auth.authStateReady();
    const provider = new GoogleAuthProvider();
    const response = await signInWithPopup(auth, provider);
    return response?.user;
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

export async function changePassword(email: string, oldPassword: string, newPassword: string) {
    await auth.authStateReady();
    if (auth.currentUser) {
        const credential = EmailAuthProvider.credential(email, oldPassword)
        await reauthenticateWithCredential(auth.currentUser, credential)
        await updatePassword(auth.currentUser, newPassword)
    }
}

export async function resetPassword(oobCode: string, newPassword: string) {
    await auth.authStateReady();
    await confirmPasswordReset(auth, oobCode, newPassword);
}

export async function sendResetPasswordEmail(email: string) {
    await auth.authStateReady();
    await sendPasswordResetEmail(auth, email);
}

export async function getEmailFromActionCode(oobCode: string) {
    await auth.authStateReady();
    const res = await checkActionCode(auth, oobCode)
    return res?.data?.email
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
