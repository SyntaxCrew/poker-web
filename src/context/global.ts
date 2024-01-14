import { Dispatch, SetStateAction, createContext } from "react";
import { Poker } from "../models/poker";
import { Setting } from "../models/setting";
import { UserProfile } from "../models/user";

const GlobalContext = createContext<{
    sessionID: string,
    profile: UserProfile,
    alert: (alert: {message: string, severity: "success" | "info" | "warning" | "error"}) => void,
    isLoading: boolean,
    setLoading: Dispatch<SetStateAction<boolean>>,
    poker?: Poker,
    setPoker: Dispatch<SetStateAction<Poker | undefined>>,
    isPageReady: boolean,
    setting: Setting,
    setSetting: Dispatch<SetStateAction<Setting>>,
    isDisplayVoteButtonOnTopbar: boolean,
    setDisplayVoteButtonOnTopbar: Dispatch<SetStateAction<boolean>>,
}>({
    sessionID: '',
    profile: {isAnonymous: true, userUUID: '', displayName: 'Guest'},
    alert: () => {},
    isLoading: false,
    setLoading: () => {},
    setPoker: () => {},
    isPageReady: false,
    setting: {displayUserImage: 'hide'},
    setSetting: () => {},
    isDisplayVoteButtonOnTopbar: false,
    setDisplayVoteButtonOnTopbar: () => {},
});

export default GlobalContext
