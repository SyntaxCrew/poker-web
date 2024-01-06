import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function SignoutDialog(props: {open: boolean, onSubmit?: () => void, onClose?: () => void}) {
    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <DialogTitle>
                <div className="flex items-center justify-between gap-4 overflow-hidden">
                    <div className="text-ellipsis whitespace-nowrap overflow-hidden">Sign Out</div>
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => props.onClose && props.onClose()}
                    >
                        <Close fontSize="inherit" color="error" />
                    </IconButton>
                </div>
            </DialogTitle>
            <Divider />

            <DialogContent>Are you sure to signout?</DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" onClick={() => props.onClose && props.onClose()}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => props.onSubmit && props.onSubmit()}>Signout</Button>
            </DialogActions>
        </Dialog>
    );
}
