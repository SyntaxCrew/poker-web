import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPokerRoom, isExistsPokerRoom } from '../firebase/poker';
import { UserProfile } from '../models/user';
import { getUserProfile } from '../repository/user';
import { pressEnter } from '../utils/input';

export default function HomePage() {
    const navigate = useNavigate();
    const [roomID, setRoomID] = useState('');
    const [profile, setProfile] = useState<UserProfile>({userType: 'anonymous', userUUID: '', sessionUUID: ''});

    useEffect(() => {
        init();
        async function init() {
            setProfile(await getUserProfile());
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
            const roomID = await createPokerRoom(profile.userUUID, displayName);
            navigate(`/${roomID}`);
        }
    }

    return (
        <>
            <div className="flex gap-2 m-auto w-full">
                <input type="text" className='rounded-md px-4' placeholder='Enter Room Number' onChange={e => setRoomID(e.target.value)} onKeyDown={pressEnter(joinRoom)} />
                <button onClick={joinRoom}>Enter</button>
            </div>
            <button className='mt-2' onClick={createRoom}>Create Instant Room</button>
        </>
    )
}