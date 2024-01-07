import { Dialog, DialogContent } from "@mui/material";
import HeaderDialog from "./HeaderDialog";

export default function VotingHistoryDialog(props: {open: boolean, onClose?: () => void}) {
    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} maxWidth='xs' fullWidth>
            <HeaderDialog title="Voting History" onClose={props.onClose} />
            <DialogContent></DialogContent>
        </Dialog>
    );
}
