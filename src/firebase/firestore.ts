import { initializeFirestore } from "firebase/firestore";
import app from "./firebase";

const firestore = initializeFirestore(app, { ignoreUndefinedProperties: true })

export default firestore;
