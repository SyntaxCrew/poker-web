import { Dialog, DialogContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import { Poker } from "../../models/poker";

export default function VotingHistoryDialog(props: {open: boolean, onClose?: () => void, poker: Poker}) {
    const columns = ["Issue Name", "Result", "Duration", "Date", "Voted/Total", "Player Results"];

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} fullWidth maxWidth="lg">
            <HeaderDialog title="Voting History" onClose={props.onClose} />
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column, index) => {
                                    return (
                                        <TableCell key={index}>{ column }</TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!props.poker.history ? <TableCell colSpan={columns.length}><div className="text-center">NO DATA</div></TableCell> : Object.values(props.poker.history).sort((a, b) => a.date.toDate().toISOString().localeCompare(b.date.toDate().toISOString())).map((history, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">{ history.issueName || '-' }</TableCell>
                                        <TableCell component="th" scope="row">{ history.result?.length > 0 ? history.result : '-' }</TableCell>
                                        <TableCell component="th" scope="row">{ history.duration || '-' }</TableCell>
                                        <TableCell component="th" scope="row">{ history.date.toDate().toLocaleString('en-US') }</TableCell>
                                        <TableCell component="th" scope="row">{ history.voted }/{ history.total }</TableCell>
                                        <TableCell component="th" scope="row">{ history.playerResult.map(player => `${player.displayName} (${player.estimatePoint})`).join(', ') || '-' }</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
}
