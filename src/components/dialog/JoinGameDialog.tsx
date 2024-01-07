import { useContext, useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, Divider, InputAdornment, Switch, TextField, Typography } from "@mui/material";
import SigninDialog from "./SigninDialog";
import SignupDialog from "./SignupDialog";
import SignoutDialog from "./SignoutDialog";
import { maximumDisplayNameLength } from "../../constant/maximum-length";
import GlobalContext from "../../context/global";
import { signout } from "../../firebase/authentication";
import { getUserProfile } from "../../repository/firestore/user";
import { notMultiSpace, notStartWithSpace, pressEnter, setValue } from "../../utils/input";

export default function JoinGameDialog(props: {open: boolean, onSubmit?: (displayName: string, isSpectator: boolean) => void}) {
    const { profile, setProfile, setLoading, alert } = useContext(GlobalContext);

    type DialogName = 'signin' | 'signup' | 'signout' | 'close';

    const [displayName, setDisplayName] = useState('');
    const [isSpectator, setSpectator] = useState(false);

    const [openDialog, setOpenDialog] = useState<DialogName>('close');
    const [isTransition, setTransition] = useState(true);

    useEffect(() => {
        setDisplayName(profile.displayName || '')
    }, [profile.displayName]);

    const onSubmit = () => {
        if (displayName.trim().length === 0) {
            return;
        }

        if (props.onSubmit) {
            props.onSubmit(displayName, isSpectator);
        }
    }

    async function signOut() {
        setLoading(true);
        try {
            await signout();
            const user = await getUserProfile();
            if (!user) {
                throw Error('user not found')
            }
            setProfile(user);
            alert({message: 'Sign out successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Sign out failed', severity: 'error'});
        }
        setDialog('close');
        setLoading(false);
    }

    const setDialog = (dialog: DialogName, isSwapComponent?: boolean) => {
        setTransition(isSwapComponent === undefined);
        setOpenDialog(dialog);
    }

    return (
        <>
            <Dialog open={props.open} maxWidth='xs' fullWidth>
                <DialogTitle>Choose your display name</DialogTitle>
                <Divider />

                <DialogContent>
                    <div className="flex flex-col gap-4">
                        <TextField
                            fullWidth
                            variant='outlined'
                            placeholder='Enter your display name'
                            label='Display name'
                            value={displayName}
                            onChange={setValue(setDisplayName, { maximum: maximumDisplayNameLength, others: [notStartWithSpace, notMultiSpace] })}
                            onKeyDown={pressEnter(onSubmit)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{ displayName.length }/{ maximumDisplayNameLength }</InputAdornment>,
                            }}
                        />

                        <div className="flex items-center justify-between gap-4">
                            <label htmlFor="auto-reveal" className="font-bold">Join as spectator</label>
                            <Switch checked={isSpectator} onChange={() => setSpectator(!isSpectator)} />
                        </div>

                        <Button variant="contained" color="primary" onClick={onSubmit} disabled={displayName.trim().length === 0}>Continue to game</Button>

                        <div className="flex items-center justify-between">
                            {profile.isAnonymous && <>
                                <Typography className="!font-bold text-blue-500 cursor-pointer w-fit" onClick={() => setDialog('signin')}>Signin</Typography>
                                <Typography className="!font-bold text-blue-500 cursor-pointer w-fit" onClick={() => setDialog('signup')}>Signup</Typography>
                            </>}

                            {!profile.isAnonymous && <>
                                <Typography className="!font-bold text-blue-500 cursor-pointer !ml-auto !w-fit" onClick={() => setDialog('signout')}>Signout</Typography>
                            </>}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {profile.isAnonymous && <SigninDialog open={openDialog === 'signin'} onClose={() => setDialog('close')} onSignup={() => setDialog('signup', true)} isTransition={isTransition} />}
            {profile.isAnonymous && <SignupDialog open={openDialog === 'signup'} onClose={() => setDialog('close')} onSignin={() => setDialog('signin', true)} isTransition={isTransition} />}
            {!profile.isAnonymous && <SignoutDialog open={openDialog === 'signout'} onSubmit={signOut} onClose={() => setDialog('close')} />}
        </>
    );
}
