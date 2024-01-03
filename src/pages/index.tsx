import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPokerRoom, isExistsPokerRoom } from '../firebase/poker';
import { UserProfile } from '../models/user';
import { getUserProfile } from '../repository/user';
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
        allowEditEstimateAfterShowEstimate: false,
        autoRevealCards: true,
        estimateOptions: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
        showAverage: true,
        showMedian: true,
        showTimer: false,
    })

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
            const roomID = await createPokerRoom(profile.userUUID, displayName, pokerOption);
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