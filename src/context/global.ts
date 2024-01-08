import { Dispatch, SetStateAction, createContext } from "react";
import { UserProfile } from "../models/user";
import { Poker } from "../models/poker";

const GlobalContext = createContext<{
    sessionID: string,
    profile: UserProfile,
    setProfile: Dispatch<SetStateAction<UserProfile>>,
    alert: (alert: {message: string, severity: "success" | "info" | "warning" | "error"}) => void,
    isLoading: boolean,
    setLoading: Dispatch<SetStateAction<boolean>>,
    poker?: Poker,
    setPoker: Dispatch<SetStateAction<Poker | undefined>>,
    isPageReady: boolean,
}>({
    sessionID: '',
    profile: {isAnonymous: true, userUUID: '', displayName: 'Guest'},
    setProfile: () => {},
    alert: () => {},
    isLoading: false,
    setLoading: () => {},
    setPoker: () => {},
    isPageReady: false,
});

export default GlobalContext
