import { useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import GlobalContext from "../../context/global";
import { signinAnonymous, signout } from "../../firebase/authentication";
import { revokeUser } from "../../repository/firestore/poker";

export default function SignoutDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void}) {
    const { setLoading, alert, profile, sessionID } = useContext(GlobalContext);

    const navigate = useNavigate();
    const location = useLocation();

    const signOut = useCallback(async () => {
        setLoading(true);
        try {
            revokeUser(profile.userUUID, sessionID);
            await signout();
            await signinAnonymous();
            if (props.onClose) {
                props.onClose();
            }
            alert({message: 'Sign out successfully', severity: 'success'});
            if (location.pathname !== '/') {
                navigate('/');
            }
        } catch (error) {
            alert({message: 'Sign out failed', severity: 'error'});
        }
        setLoading(false);
    }, [location.pathname])

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Sign Out" onClose={props.onClose} />
            <DialogContent>Are you sure to signout?</DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" onClick={() => props.onClose && props.onClose()}>Cancel</Button>
                <Button variant="contained" color="error" onClick={signOut}>Signout</Button>
            </DialogActions>
        </Dialog>
    );
}
