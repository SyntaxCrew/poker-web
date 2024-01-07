import { Link } from 'react-router-dom';
import PokerLogo from '/images/poker.png';
import RoomMenu from '../partials/RoomMenu';
import UserMenu from '../partials/UserMenu';

export default function Topbar() {
    return (
        <>
            <div className="fixed h-16 w-full">
                <div className="flex items-center justify-between px-2 sm:px-4 gap-4 h-20 bg-white">
                    <div className="flex items-center gap-2 w-full">
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
