import { Dialog, DialogContent, Paper, Tooltip } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import Avatar from "../shared/Avatar";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";
import Draggable from 'react-draggable';

export default function SpectatorListDialog(props: {open: boolean, onClose?: () => void, poker: Poker, profile: UserProfile}) {
    if (!props.poker || !props.profile) {
        return (<></>)
    }
    const spectators = Object.keys(props.poker.user).filter(userUUID => props.poker.user[userUUID].displayName && props.poker.user[userUUID].isSpectator && props.poker.user[userUUID].activeSessions?.length);

    return (
        <Dialog
            open={props.open}
            PaperComponent={(props) =>
                <Draggable
                    handle="#draggable-dialog-title"
                    cancel={'[class*="MuiDialogContent-root"]'}
                >
                    <Paper {...props} />
                </Draggable>
            }
            aria-labelledby="draggable-dialog-title"
            maxWidth="xs"
            fullWidth
        >
            <HeaderDialog title={`Spectator List (${spectators.length})`} onClose={props.onClose} />
            <DialogContent>
                <div className="flex flex-col gap-4 min-h-[75vh]">
                    {spectators.sort((a, b) => (!props.poker.user[a].displayName || !props.poker.user[b].displayName || props.poker.user[a].displayName === props.poker.user[b].displayName) ? a.localeCompare(b) : props.poker.user[a].displayName.localeCompare(props.poker.user[b].displayName)).map(userUUID => {
                        return (
                            <div className="flex gap-2 items-center overflow-hidden w-full" key={userUUID}>
                                <Avatar profile={{userUUID, displayName: props.poker.user[userUUID].displayName, imageURL: props.poker.user[userUUID].imageURL, isAnonymous: false}} />
                                <Tooltip
                                    arrow
                                    placement="top"
                                    title={props.poker.user[userUUID].displayName + (props.profile.userUUID === userUUID ? ' (You)' : '')}
                                    slotProps={{
                                        popper: {
                                            modifiers: [{
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10],
                                                },
                                            }]
                                        },
                                    }}
                                >
                                    <div className={"text-black text-ellipsis whitespace-nowrap overflow-hidden max-w-full w-fit" + (props.profile.userUUID === userUUID ? ' font-bold' : '')}>
                                        { props.poker.user[userUUID].displayName + (props.profile.userUUID === userUUID ? ' (You)' : '') }
                                    </div>
                                </Tooltip>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}