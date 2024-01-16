import { useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PokerLogo from '/images/poker.png';
import RoomMenu from '../menu/RoomMenu';
import UserMenu from '../menu/UserMenu';

export default function Topbar() {
    const [scrollY, setScrollY] = useState(0);

    useLayoutEffect(() => {
        const handler = () => setScrollY(window.scrollY)
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <>
            <div className="fixed h-16 w-full z-10">
                <div className={"flex items-center justify-between px-2 sm:px-4 gap-4 h-20 bg-white" + (scrollY > 0 ? ' shadow-lg' : '')}>
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                        <Link to='/'>
                            <img src={PokerLogo} className="min-w-10 min-h-10 max-w-10 max-h-10" alt="Poker logo" />
                        </Link>
                        <RoomMenu />
                    </div>

                    <UserMenu />
                </div>
            </div>
        </>
    );
}
