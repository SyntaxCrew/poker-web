import { useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import { joinPokerRoom, leavePokerRoom } from '../../firebase/poker';
import { Poker } from "../../models/poker";
import { UserProfile } from '../../models/user';
import { getUserProfile } from '../../repository/user';

export default function PokerRoomPage() {
    const { room } = useParams();
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [poker, setPoker] = useState<Poker>();
    const [profile, setProfile] = useState<UserProfile>({userType: 'anonymous', userUUID: '', sessionUUID: ''});

    useBeforeUnload(async () => await leavePokerRoom(profile.userUUID, profile.sessionUUID, room!));
    useEffect(() => {
        init();
        async function init() {
            try {
                const userProfile = await getUserProfile();
                setProfile(userProfile);

                await joinPokerRoom({
                    userUUID: userProfile.userUUID,
                    sessionUUID: userProfile.sessionUUID,
                    roomID: room!,
                    onNotFound: () => navigate('/'),
                    onNewJoiner() {
                        return {
                            displayName: prompt("Enter your display name!")!,
                            isSpectator: undefined,
                        };
                    },
                    onNext(data) {
                        setPoker(data.data())
                        if (isLoading) {
                            setLoading(false);
                        }
                    },
                });

            } catch (error) {
                navigate('/');
            }
        }
    }, [])

    return (
        <>
            {!isLoading && (
                <>
                    <div>Room: { room }</div>
                    <div>Profile: { profile.userUUID }</div>
                    {poker && Object.keys(poker.user).filter(userUUID => poker.user[userUUID].activeSessions?.length && !poker.user[userUUID].isSpectator).map(userUUID => {
                        return (
                            <div key={userUUID}>
                                Display Name: {poker.user[userUUID].displayName}
                            </div>
                        )
                    })}
                </>
            )}
        </>
    );
}