import { useContext, useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import GlobalContext from "../../context/global";
import JoinGameDialog from "../../components/dialog/JoinGameDialog";
import { leavePokerRoom, joinPokerRoom, updateActiveSession, newJoiner } from '../../repository/firestore/poker';
import { updateUserProfile } from "../../repository/firestore/user";
import PokerPanel from "../../components/partials/PokerPanel";
import PokerArea from "../../components/partials/PokerArea";

export default function PokerRoomPage() {
    const { sessionID, setLoading, profile, poker, setPoker, isPageReady, alert } = useContext(GlobalContext);
    const { room } = useParams();
    const navigate = useNavigate();

    const [isOpenDialog, setOpenDialog] = useState(false);

    useBeforeUnload(async () => await leavePokerRoom(profile.userUUID, sessionID, room!));
    useEffect(() => {
        setLoading(true);
        if (isPageReady && room) {
            let isFirstTime = true;
            return joinPokerRoom(room, async (poker) => {
                try {
                    if (!poker) {
                        throw Error('poker not found');
                    }
                    setPoker(poker);

                    if (isFirstTime) {
                        isFirstTime = false;
                        setLoading(false);
                        if (!poker.user[profile.userUUID]) {
                            setOpenDialog(true);
                            return;
                        }
                        await updateActiveSession(profile.userUUID, sessionID, room, 'join');
                    }

                } catch (error) {
                    if (isFirstTime) {
                        alert({message: 'Room id was not found, please try again!', severity: 'warning'})
                    } else {
                        alert({message: 'This room has been deleted', severity: 'error'})
                    }
                    navigate('/');
                } finally {
                    if (isFirstTime) {
                        isFirstTime = false;
                        setLoading(false);
                    }
                }
            })
        }
    }, [isPageReady, room]);

    return (
        <>
            <JoinGameDialog
                open={isOpenDialog}
                onSubmit={async (displayName, isSpectator) => {
                    if (profile.displayName !== displayName) {
                        updateUserProfile({userUID: profile.userUUID, displayName});
                    }
                    setLoading(true);
                    await newJoiner(profile.userUUID, room!, displayName, profile.imageURL, isSpectator, sessionID);
                    setOpenDialog(false);
                    setLoading(false);
                }}
            />

            {!!poker && <>
                <PokerArea
                    poker={poker}
                    profile={profile}
                    roomID={room!}
                />

                <PokerPanel
                    roomID={room!}
                    poker={poker}
                    profile={profile}
                />
            </>}
        </>
    );
}
