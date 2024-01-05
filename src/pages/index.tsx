import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Divider, Card, Box, CircularProgress } from '@mui/material';
import ScrumPokerImg from '/images/estimation.png';
import Alert from '../components/Alert';
import CreatePokerOption from '../components/CreatePokerOption';
import GoogleButton from '../components/GoogleButton';
import LoadingScreen from '../components/LoadingScreen';
import { signInGoogle, signout } from '../firebase/authentication';
import { createPokerRoom, isExistsPokerRoom } from '../firebase/poker';
import { getUserProfile } from '../firebase/user';
import { UserProfile } from '../models/user';
import { CreatePokerOptionDialog } from '../models/poker';
import { pressEnter, setValue } from '../utils/input';

export default function HomePage() {
    const navigate = useNavigate();

    const [roomID, setRoomID] = useState('');
    const [profile, setProfile] = useState<UserProfile>({isAnonymous: true, userUUID: '', sessionUUID: ''});
    const [isLoading, setLoading] = useState(true);
    const [isFindRoom, setFindRoom] = useState(false);
    const [isCreateRoom, setCreateRoom] = useState(false);
    const [alert, setAlert] = useState<{isShow: boolean, message: string, severity: 'error' | 'success'}>({isShow: false, message: '', severity: 'error'});

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
        if (!roomID) {
            return;
        }
        setFindRoom(true);
        const isRoomExists = await isExistsPokerRoom(roomID);
        setFindRoom(false);
        if (!isRoomExists) {
            setAlert({message: 'Room number is not found', severity: 'error', isShow: true});
            return;
        }
        navigate(`/${roomID}`);
    }

    async function createRoom(req: CreatePokerOptionDialog) {
        if (profile.displayName) {
            setLoading(true);
            const roomID = await createPokerRoom(profile.userUUID, req.displayName, req.roomName, req.isSpectator, req.option);
            navigate(`/${roomID}`);
            setLoading(false);
        }
    }

    async function signInWithGoogle() {
        setLoading(true);
        await signInGoogle();
        await setUserProfile();
        setLoading(false);
        setAlert({message: 'Sign in with google successfully', severity: 'success', isShow: true});
    }

    async function signOut() {
        setLoading(true);
        await signout();
        await setUserProfile();
        setLoading(false);
        setAlert({message: 'Sign out successfully', severity: 'success', isShow: true});
    }

    return (
        <>
            <LoadingScreen isLoading={isLoading} />
            <Alert isShowAlert={alert.isShow} onDismiss={() => setAlert({...alert, isShow: false})} severity={alert.severity} message={alert.message} />

            <div className="w-screen h-screen flex overflow-y-auto">
                <div className="w-full bg-white px-6 max-[900px]:hidden" id="{page}-logo">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <img className="m-auto" src={ScrumPokerImg} alt="Scrum Poker" />
                    </div>
                </div>
                <div className="w-full max-[900px]:bg-blue-400 min-[901px]:bg-blue-200 p-4">
                    <div className="relative top-1/2 -translate-y-1/2 overflow-y-auto">
                        <Card className="w-96 max-w-fit m-auto rounded-md p-4 flex flex-col gap-4">
                            <div className="text-center text-3xl">Poker</div>
                            <div className="flex gap-4">
                                <TextField
                                    size='medium'
                                    className='w-full rounded-md bg-white px-4'
                                    placeholder='Enter Room Number'
                                    label="Room Number"
                                    variant="outlined"
                                    value={roomID}
                                    onChange={setValue(setRoomID)}
                                    onKeyDown={pressEnter(joinRoom)}
                                    disabled={isLoading || isFindRoom}
                                />
                                <Box sx={{ position: 'relative' }}>
                                    <Button
                                        variant='contained'
                                        size='medium'
                                        className='h-full rounded-md px-2 py-1'
                                        onClick={joinRoom}
                                        color='primary'
                                        disabled={isLoading || isFindRoom || !roomID}
                                    >
                                        Join
                                    </Button>
                                    {isFindRoom && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-3"><CircularProgress size={24} /></div>}
                                </Box>
                            </div>

                            <Button
                                variant='contained'
                                size="large"
                                color="success"
                                className="w-full"
                                onClick={() => setCreateRoom(true)}
                                disabled={isLoading || isFindRoom}
                            >
                                New game
                            </Button>

                            <Divider></Divider>

                            <GoogleButton profile={profile} onSignin={signInWithGoogle} onSignout={signOut} disabled={isLoading || isFindRoom} />
                        </Card>
                    </div>
                </div>
            </div>

            <CreatePokerOption
                displayName={profile.displayName}
                isOpen={isCreateRoom}
                onCancel={() => setCreateRoom(false)}
                onSubmit={createRoom}
            />
        </>
    )
}
