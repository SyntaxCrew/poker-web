import { Dialog, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";

export default function SignupDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void}) {
    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Sign Up" onClose={props.onClose} />

            <DialogContent>Are you sure to signup?</DialogContent>
        </Dialog>
    );
}
