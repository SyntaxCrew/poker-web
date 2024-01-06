import { useContext } from "react";
import { Button, Dialog, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import GoogleIcon from '/images/google-icon.png';
import GlobalContext from "../../context/global";
import { signInGoogle } from "../../firebase/authentication";
import { getUserProfile, signin } from "../../repository/firestore/user";

export default function SigninDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void}) {
    const { isLoading, setLoading, setProfile, alert } = useContext(GlobalContext);

    async function signInWithGoogle() {
        setLoading(true);
        try {
            const user = await signInGoogle();
            if (user) {
                await signin({
                    userUID: user.uid,
                    email: user.email || undefined,
                    displayName: user.displayName || '',
                    isAnonymous: false,
                    isLinkGoogle: true,
                });
                const userProfile = await getUserProfile();
                if (!userProfile) {
                    throw Error('user not found')
                }
                setProfile(userProfile);
                alert({message: 'Sign in with google successfully', severity: 'success'});
            }
        } catch (error) {
            // Maybe error is `auth/popup-closed-by-user`, so skip alert
        }
        setLoading(false);
        if (props.onClose) {
            props.onClose();
        }
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Sign In" onClose={props.onClose} />

            <DialogContent>
                {/* Signin Google */}
                <Button
                    variant='outlined'
                    className="w-full rounded-md p-2 drop-shadow-sm"
                    onClick={signInWithGoogle}
                    size="large"
                    disabled={isLoading}
                    sx={{backgroundColor: '#fff', color: '#000', borderColor: 'rgb(229 231 235)', height: '56.69px'}}
                >
                    <div className="flex items-center justify-center">
                        <img src={GoogleIcon} alt="Google Icon" className="w-6 h-6" />
                        <span className="ml-4">Sign in with Google</span>
                    </div>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
