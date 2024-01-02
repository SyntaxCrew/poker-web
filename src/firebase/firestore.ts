import { initializeFirestore } from "firebase/firestore";
import app from "./firebase";

const firestore = initializeFirestore(app, {})

export default firestore;
