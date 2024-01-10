import { ChangeEvent, useEffect, useRef, useState } from "react"
import { Button, Dialog, DialogActions, DialogContent, Divider, InputAdornment, TextField } from "@mui/material"
import { Edit } from "@mui/icons-material";
import HeaderDialog from "./HeaderDialog";
import Avatar from "../shared/Avatar";
import { maximumDisplayNameLength } from "../../constant/maximum-length";
import { UserProfile } from "../../models/user"
import { notMultiSpace, notStartWithSpace, pressEnter, setValue } from "../../utils/input";

export default function ProfileDialog(props: {open: boolean, profile: UserProfile, onSubmit?: (displayName: string, profileImage?: File) => Promise<void>, onClose?: () => void}) {
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

    const onSubmit = async () => {
        if (displayName.trim().length === 0) {
            return;
        }
        if (props.onSubmit) {
            await props.onSubmit(displayName.trim(), props.profile.imageURL !== profileImageURL ? inputFile : undefined);
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
            <HeaderDialog title="Edit your profile" onClose={onClose} />
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
                        onChange={setValue(setDisplayName, { maximum: maximumDisplayNameLength, others: [notStartWithSpace, notMultiSpace] })}
                        onKeyDown={pressEnter(onSubmit, onClose)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">{ displayName.length }/{ maximumDisplayNameLength }</InputAdornment>,
                        }}
                    />

                    {props.profile.email && <TextField
                        fullWidth
                        variant='outlined'
                        placeholder='Enter your email'
                        label='Email'
                        value={props.profile.email}
                        disabled
                    />}
                </div>
            </DialogContent>
            <Divider />

            <DialogActions>
                <Button variant="outlined" color="error" onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={onSubmit} disabled={displayName.trim().length === 0}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}
