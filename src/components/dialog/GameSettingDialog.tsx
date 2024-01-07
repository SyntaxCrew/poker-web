import { Dialog, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";

export default function GameSettingDialog(props: {open: boolean, onClose?: () => void}) {
    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Game Settings" onClose={props.onClose} />
            <DialogContent></DialogContent>
        </Dialog>
    );
}
