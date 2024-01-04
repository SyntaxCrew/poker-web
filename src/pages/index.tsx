import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPokerRoom, isExistsPokerRoom } from '../firebase/poker';
import { getUserProfile } from '../firebase/user';
import { UserProfile } from '../models/user';
import { pressEnter } from '../utils/input';
import { PokerOption } from '../models/poker';

export default function HomePage() {
    const navigate = useNavigate();
    const [roomID, setRoomID] = useState('');
    const [profile, setProfile] = useState<UserProfile>({userType: 'anonymous', userUUID: '', sessionUUID: ''});
    const [pokerOption] = useState<PokerOption>({
        allowOthersToClearUsers: false,
        allowOthersToDeleteEstimates: false,
        allowOthersToShowEstimates: true,
        autoRevealCards: true,
        estimateOptions: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
        showAverage: true,
    });

    useEffect(() => {
        init();
        async function init() {
            const user = await getUserProfile();
            if (user) {
                setProfile(user);
            }
        }
    }, []);

    async function joinRoom() {
        const isRoomExists = await isExistsPokerRoom(roomID);
        if (!isRoomExists) {
            alert("NOT EXISTS");
            return;
        }
        navigate(`/${roomID}`);
    }

    async function createRoom() {
        const displayName = prompt("Enter your display name!");
        if (displayName) {
            const roomID = await createPokerRoom(profile.userUUID, displayName, pokerOption);
            navigate(`/${roomID}`);
        }
    }

    return (
        <>
            <div className="w-screen h-screen flex overflow-y-auto">
                <div className="w-full max-[900px]:bg-[var(--primary-color)] dark:max-[900px]:bg-gray-900 min-[901px]:bg-gray-200 dark:min-[901px]:bg-gray-900 p-4">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <div className="w-fit m-auto rounded-md bg-black text-white p-4">
                            <h2 className="text-center mb-2">Poker</h2>
                            <div className="flex gap-2">
                                <input type="text" className='rounded-md px-4' placeholder='Enter Room Number' onChange={e => setRoomID(e.target.value)} onKeyDown={pressEnter(joinRoom)} />
                                <button className='rounded-md px-2 bg-blue-500 text-black py-1 ease-in duration-200 hover:bg-blue-600' onClick={joinRoom}>Join</button>
                            </div>
                            <button className='mt-2 w-full rounded-md px-2 bg-green-500 text-black py-1 ease-in duration-200 hover:bg-green-600' onClick={createRoom}>Create Instant Room</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}