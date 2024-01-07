import { Link } from 'react-router-dom';
import PokerLogo from '/images/poker.png';
import UserMenu from '../partials/UserMenu';

export default function Topbar() {
    return (
        <>
            <div className="fixed h-16 w-full">
                <div className="flex items-center justify-between px-2 sm:px-4 h-20 bg-red-200">
                    <div className="flex items-center gap-2">
                        <Link to='/'>
                            <img src={PokerLogo} className="w-10 h-10" alt="Poker logo" />
                        </Link>
                    </div>
                    <UserMenu />
                </div>
            </div>
        </>
    );
}
