import { useLocation } from "react-router-dom";
import { CircularProgress, Dialog, DialogContent, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import HeaderDialog from "./HeaderDialog";
import { useEffect, useState } from "react";
import { CopyInput } from "../../models/copy";

export default function SharedLinkDialog(props: {open: boolean, onClose?: () => void, roomID: string}) {
    const location = useLocation();

    const [isCopyingRoomID, setCopyingRoomID] = useState(false);
    const [isCopyingLink, setCopyingLink] = useState(false);
    const [countdownCopyingRoomID, setCountdownCopyingRoomID] = useState(0);
    const [countdownCopyingLink, setCountdownCopyingLink] = useState(0);

    useEffect(() => {
        const timer = countdownCopyingRoomID > 0 && setInterval(() => {
            setCountdownCopyingRoomID(countdownCopyingRoomID - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
    }, [countdownCopyingRoomID]);

    useEffect(() => {
        const timer = countdownCopyingLink > 0 && setInterval(() => {
            setCountdownCopyingLink(countdownCopyingLink - 1);
        }, 1000);
        if (typeof timer == "number") {
            return () => clearInterval(timer);
        }
    }, [countdownCopyingLink]);

    const inputs: CopyInput[] = [
        {
            label: 'Room ID',
            value: props.roomID,
            isCopying: isCopyingRoomID,
            setCopyingState: setCopyingRoomID,
            countdown: countdownCopyingRoomID,
            setCountdown: setCountdownCopyingRoomID,
        },
        {
            label: 'Link',
            value: window.location.origin + location.pathname,
            isCopying: isCopyingLink,
            setCopyingState: setCopyingLink,
            countdown: countdownCopyingLink,
            setCountdown: setCountdownCopyingLink,
        },
    ];

    async function copy(input: CopyInput) {
        input.setCopyingState(true);
        navigator.clipboard.writeText(input.value);
        input.setCopyingState(false);
        input.setCountdown(2);
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Shared" onClose={props.onClose} />
            <DialogContent>
                <div className="flex flex-col gap-4">
                    {inputs.map((input, index) => {
                        return (
                            <TextField
                                fullWidth
                                key={index}
                                variant='outlined'
                                label={input.label}
                                value={input.value}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end" >
                                        <Tooltip
                                            placement="top"
                                            title={!input.countdown ? 'Copy to clipboard' : 'Copied!'}
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
                                            <IconButton
                                                aria-label="copy clipboard"
                                                onClick={() => copy(input)}
                                                edge="end"
                                            >
                                                { !input.isCopying
                                                    ? <ContentCopy />
                                                    : <CircularProgress color="inherit" className="min-w-6 max-w-6 min-h-6 max-h-6" />
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                }}
                            />
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
