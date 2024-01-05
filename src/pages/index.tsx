import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Divider, Card } from '@mui/material';
import ScrumPokerImg from '/images/estimation.png';
import { signInGoogle, signout } from '../firebase/authentication';
import { createPokerRoom, isExistsPokerRoom } from '../firebase/poker';
import { getUserProfile } from '../firebase/user';
import { PokerOption } from '../models/poker';
import { UserProfile } from '../models/user';
import { pressEnter } from '../utils/input';
import GoogleButton from '../components/GoogleButton';
import LoadingScreen from '../components/LoadingScreen';

export default function HomePage() {
    const navigate = useNavigate();
    const [roomID, setRoomID] = useState('');
    const [profile, setProfile] = useState<UserProfile>({isAnonymous: true, userUUID: '', sessionUUID: ''});
    const [isLoading, setLoading] = useState(true);
    const [pokerOption] = useState<PokerOption>({
        allowOthersToClearUsers: false,
        allowOthersToDeleteEstimates: false,
        allowOthersToShowEstimates: true,
        autoRevealCards: true,
        estimateOptions: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
        showAverage: true,
    });

    async function setUserProfile() {
        const user = await getUserProfile();
        if (user) {
            setProfile(user);
        }
        setLoading(false);
    }

    useEffect(() => {
        setUserProfile();
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
        if (profile.isAnonymous) {
            profile.displayName = prompt("Enter your display name!") ?? '';
        }
        if (profile.displayName) {
            const roomID = await createPokerRoom(profile.userUUID, profile.displayName, pokerOption);
            navigate(`/${roomID}`);
        }
    }

    async function signInWithGoogle() {
        setLoading(true);
        await signInGoogle();
        await setUserProfile();
        setLoading(false);
    }

    async function signOut() {
        setLoading(true);
        await signout();
        await setUserProfile();
        setLoading(false);
    }

    return (
        <>
            <LoadingScreen isLoading={isLoading} />
            <div className="w-screen h-screen flex overflow-y-auto">
                <div className="w-full bg-white px-6 max-[900px]:hidden" id="{page}-logo">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <img className="m-auto" src={ScrumPokerImg} alt="Scrum Poker" />
                    </div>
                </div>
                <div className="w-full max-[900px]:bg-blue-400 min-[901px]:bg-blue-200 p-4">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <Card className="w-96 max-w-fit m-auto rounded-md !bg-white text-black p-4 flex flex-col gap-4">
                            <div className="text-center text-3xl">Poker</div>
                            <div className="flex gap-4">
                                <TextField
                                    size='medium'
                                    className='w-full rounded-md bg-white px-4'
                                    placeholder='Enter Room Number'
                                    label="Room Number"
                                    variant="outlined"
                                    onChange={e => setRoomID(e.target.value)}
                                    onKeyDown={pressEnter(joinRoom)}
                                    disabled={isLoading}
                                />
                                <Button
                                    variant='contained'
                                    size='medium'
                                    className='rounded-md px-2 bg-blue-500 text-black py-1 ease-in duration-200 transition-colors hover:bg-blue-600'
                                    onClick={joinRoom}
                                    disabled={isLoading}
                                >
                                    Join
                                </Button>
                            </div>
                            <Button variant='contained' size="large" className="w-full !bg-green-600 ease-in duration-200 transition-colors hover:!bg-green-700" onClick={createRoom} disabled={isLoading}>New game</Button>
                            <Divider></Divider>
                            <GoogleButton profile={profile} onSignin={signInWithGoogle} onSignout={signOut} disabled={isLoading} />
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}