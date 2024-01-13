import { useCallback } from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";

export default function ConfirmDialog(props: {open: boolean, onSubmit: () => Promise<void>, onClose: () => void, confirmLevel: 'success' | 'error', title: string, content: string}) {
    const onSubmit = useCallback(async () => {
        if (props.onSubmit) {
            await props.onSubmit();
        }
        if (props.onClose) {
            props.onClose();
        }
    }, [props.onClose]);

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title={props.title} onClose={props.onClose} />
            <DialogContent>{ props.content }</DialogContent>
            <DialogActions>
                <Button variant="outlined" color="error" onClick={props.onClose}>Cancel</Button>
                <Button variant="contained" color={props.confirmLevel} onClick={onSubmit}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}
