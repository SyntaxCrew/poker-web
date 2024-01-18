"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import { Poker } from "@core/@types/poker";
import { User } from "@core/@types/user";
import { getPoker } from "@core/functions/poker";
import { getUser } from "@core/functions/user";
import PokerSpectate from "@modules/poker/components/PokerSpectate";
import PokerTable from "@modules/poker/components/PokerTable";
import PokerTopbar from "@modules/poker/components/PokerTopbar";
import PokerEstimate from "@modules/poker/components/PokerEstimate";
import usePoker from "@modules/poker/functions/usePoker";

export default function Home() {
    const { roomNo } = useParams<{roomNo: string}>();
    const [poker, user] = usePoker(roomNo)

    if (!poker || !user) {
        return <></>
    }

    return (
        <div className="bg-white text-black p-6">
            <div className="max-w-7xl m-auto space-y-[34px]">
                <PokerTopbar user={user} />
                <div className="space-y-6">
                    <div className="flex items-center gap-5 min-h-[640px] max-h-[640px] h-[640px]">
                        <PokerTable poker={poker} user={user} />
                        <PokerSpectate poker={poker} user={user} />
                    </div>
                    <PokerEstimate />
                </div>
            </div>
        </div>
    )
}
