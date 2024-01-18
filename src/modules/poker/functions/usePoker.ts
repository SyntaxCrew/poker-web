import { useEffect, useState } from "react";
import { Poker } from "@core/@types/poker";
import { User } from "@core/@types/user";
import { getPoker } from "@core/functions/poker";
import { getUser } from "@core/functions/user";

export default function usePoker(roomNo: string): [Poker | undefined, User | undefined] {
    const [user, setUser] = useState<User>();
    const [poker, setPoker] = useState<Poker>();

    useEffect(() => {
        init();
        async function init() {
            const user = await getUser();
            const poker = await getPoker(roomNo);
            setUser(user);
            setPoker(poker);
        }
    }, [roomNo])

    return [poker ?? undefined, user ?? undefined]
}
