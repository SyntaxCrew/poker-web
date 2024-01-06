import { Dispatch, SetStateAction, createContext } from "react";
import { UserProfile } from "../models/user";
import { Poker } from "../models/poker";

const GlobalContext = createContext<{
    profile: UserProfile,
    setProfile: Dispatch<SetStateAction<UserProfile>>,
    alert: (alert: {message: string, severity: "success" | "info" | "warning" | "error"}) => void,
    isLoading: boolean,
    setLoading: Dispatch<SetStateAction<boolean>>,
    poker?: Poker,
    setPoker: Dispatch<SetStateAction<Poker | undefined>>,
}>({
    profile: {isAnonymous: true, userUUID: '', sessionUUID: '', displayName: 'Guest'},
    setProfile: () => {},
    alert: () => {},
    isLoading: false,
    setLoading: () => {},
    setPoker: () => {},
});

export default GlobalContext
