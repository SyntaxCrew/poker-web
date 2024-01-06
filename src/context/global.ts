import { Dispatch, SetStateAction, createContext } from "react";
import { UserProfile } from "../models/user";

const GlobalContext = createContext<{
    profile: UserProfile,
    setProfile: Dispatch<SetStateAction<UserProfile>>,
    alert: (alert: {message: string, severity: "success" | "info" | "warning" | "error"}) => void,
    isLoading: boolean,
    setLoading: Dispatch<SetStateAction<boolean>>,
}>({
    profile: {isAnonymous: true, userUUID: '', sessionUUID: ''},
    setProfile: () => {},
    alert: () => {},
    isLoading: false,
    setLoading: () => {},
});

export default GlobalContext
