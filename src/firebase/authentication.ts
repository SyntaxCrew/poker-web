import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        await signInAnonymously(auth);
    }
});

export default auth;
