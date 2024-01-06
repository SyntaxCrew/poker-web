import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";

export default function SignoutDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void}) {
    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Sign Out" onClose={props.onClose} />
            <DialogContent>Are you sure to signout?</DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" onClick={() => props.onClose && props.onClose()}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => props.onSubmit && props.onSubmit()}>Signout</Button>
            </DialogActions>
        </Dialog>
    );
}
