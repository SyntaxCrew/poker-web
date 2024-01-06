import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField } from "@mui/material"
import { UserProfile } from "../../models/user"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { pressEnter, setValue } from "../../utils/input";
import Avatar from "../partials/Avatar";
import { Edit } from "@mui/icons-material";

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
            <DialogTitle>Edit your display information</DialogTitle>

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
                <Button variant="contained" color="primary" onClick={() => props.onSubmit && props.onSubmit(displayName, inputFile)}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}
