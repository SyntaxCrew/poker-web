import { ChangeEvent, useEffect, useRef, useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, TextField } from "@mui/material"
import { Close, Edit } from "@mui/icons-material";
import Avatar from "../partials/Avatar";
import { UserProfile } from "../../models/user"
import { pressEnter, setValue } from "../../utils/input";

export default function ProfileDialog(props: {open: boolean, profile: UserProfile, onSubmit?: (displayName: string, profileImage?: File) => void, onClose?: () => void}) {
    const [displayName, setDisplayName] = useState('');
    const [profileImageURL, setProfileImageURL] = useState<string>();
    const [inputFile, setInputFile] = useState<File>();
    const inputFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDisplayName(props.profile.displayName);
        setProfileImageURL(props.profile.imageURL);
    }, [props.profile]);

    const onClose = () => {
        setTimeout(() => {
            setDisplayName(props.profile.displayName);
            setProfileImageURL(props.profile.imageURL);
        }, 200)
        if (props.onClose) {
            props.onClose();
        }
    }

    const updateProfileImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length == 1) {
            const file = event.target.files.item(0);
            if (file) {
                setProfileImageURL(URL.createObjectURL(file));
                setInputFile(file);
            }
        }
    }

    return (
        <Dialog open={props.open} onClose={onClose} maxWidth='xs' fullWidth>
            <DialogTitle>
                <div className="flex items-center justify-between gap-4 overflow-hidden">
                    <div className="text-ellipsis whitespace-nowrap overflow-hidden">Edit your display information</div>
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={onClose}
                    >
                        <Close fontSize="inherit" color="error" />
                    </IconButton>
                </div>
            </DialogTitle>

            <Divider />
            <DialogContent>
                <div className="flex flex-col items-center gap-4">
                    <input ref={inputFileRef} type="file" accept="image/*" hidden onChange={updateProfileImage} />
                    <Avatar size="large" profile={{...props.profile, imageURL: profileImageURL}} bottomElement={<Edit fontSize="small" />} onClick={() => inputFileRef.current?.click()} />
                    <TextField
                        fullWidth
                        variant='outlined'
                        placeholder='Enter your display name'
                        label='Your display name'
                        value={displayName}
                        onChange={setValue(setDisplayName)}
                        onKeyDown={pressEnter(() => props.onSubmit && props.onSubmit(displayName, inputFile), onClose)}
                    />
                </div>
            </DialogContent>
            <Divider />

            <DialogActions>
                <Button variant="outlined" color="error" onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={() => displayName.length > 0 && props.onSubmit && props.onSubmit(displayName, inputFile)} disabled={displayName.length === 0}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}
