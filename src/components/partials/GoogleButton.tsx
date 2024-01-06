import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { UserProfile } from "../../models/user";
import GoogleIcon from '/images/google-icon.png';
import { useState } from "react";

export default function GoogleButton(props: {profile: UserProfile, onSignin: () => Promise<void>, onSignout: () => Promise<void>, disabled: boolean}) {
    const [open, setOpen] = useState(false);
    const signout = async() => {
        await props.onSignout();
        setOpen(false);
    }
    return (
        <>
            {props.profile.isAnonymous && <Button
                variant='outlined'
                className="w-full rounded-md p-2 drop-shadow-sm"
                onClick={props.onSignin}
                size="large"
                disabled={props.disabled}
                sx={{backgroundColor: '#fff', color: '#000', borderColor: 'rgb(229 231 235)', height: '56.69px'}}
            >
                <div className="flex items-center justify-center">
                    <img src={GoogleIcon} alt="Google Icon" className="w-6 h-6" />
                    <span className="ml-4">Sign in with Google</span>
                </div>
            </Button>}

            {!props.profile.isAnonymous && <div>
                <Button
                    variant='outlined'
                    className="flex items-center justify-between gap-4 shadow-lg"
                    onClick={() => setOpen(true)}
                    disabled={props.disabled}
                    sx={{backgroundColor: '#fff', borderColor: 'rgb(229 231 235)'}}
                >
                    {props.profile.imageURL && <img src={props.profile.imageURL} className='rounded-full w-6 h-6' alt="User image" />}
                    <div className='text-left text-black w-full overflow-hidden'>
                        <div className='font-bold overflow-hidden whitespace-nowrap text-ellipsis -mb-1'>Sign in as {props.profile.displayName}</div>
                        <div className='text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis'>{props.profile.email!}</div>
                    </div>
                    <img src={GoogleIcon} alt="Google Icon" className="w-6 h-6" />
                </Button>

                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Are you sure to signout?</DialogTitle>
                    <DialogActions>
                        <Button variant="outlined" color="error" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={signout}>Signout</Button>
                    </DialogActions>
                </Dialog>
            </div>}
        </>
    );
}
