import { getAuth, onAuthStateChanged, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, checkActionCode, confirmPasswordReset, EmailAuthProvider, reauthenticateWithCredential, updatePassword, NextOrObserver, User } from "firebase/auth";
import app from "./firebase";
import { signin } from "../repository/firestore/user";

const auth = getAuth(app);
let isObserveOnInitial = false;
onAuthStateChanged(auth, async (user) => {
    if (!user && !isObserveOnInitial) {
        await signinAnonymous();
    }
    isObserveOnInitial = true;
});

export async function observeAuth(onObserve: NextOrObserver<User>) {
    onAuthStateChanged(auth, onObserve);
}

export async function signinAnonymous() {
    await auth.authStateReady();
    const { user } = await signInAnonymously(auth);
    await signin({
        userUID: user.uid,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        isAnonymous: true,
        isLinkGoogle: false,
    });
}

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
