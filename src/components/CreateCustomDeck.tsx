import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { setValue } from "../utils/input";

export default function CreateCustomDeck(props: {isShow: boolean, onSubmit: (value: {deckName: string, deckValues: string[]}) => void, onClose: () => void}) {
    const [deckName, setDeckName] = useState('My custom deck');
    const [deckValues, setDeckValues] = useState('1,2,3,5,8,13');

    return (
        <Dialog open={props.isShow} onClose={props.onClose} transitionDuration={0} >
            <DialogTitle>
                <div className="flex items-center gap-4">
                    <ArrowBackIcon onClick={props.onClose} className="cursor-pointer" />
                    <div>Create Custom Deck</div>
                </div>
            </DialogTitle>
            <DialogContent className="flex flex-col gap-4 !max-w-2xl !w-full relative">
                <TextField
                    fullWidth
                    variant='outlined'
                    placeholder='Enter Deck Name'
                    label="Deck Name"
                    value={deckName}
                    onChange={setValue(setDeckName)}
                    className="!mt-2"
                />
                <TextField
                    fullWidth
                    variant='outlined'
                    placeholder='Enter Deck Values'
                    label="Deck Values"
                    value={deckValues}
                    onChange={setValue(setDeckValues)}
                    className="!mt-2"
                />
            </DialogContent>
            <DialogActions sx={{padding: '1rem'}}>
                <Button variant="contained" color="error" onClick={props.onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => props.onSubmit({deckName: deckName.trim(), deckValues: deckValues.trim().split(',')})}
                    disabled={deckName.trim().length === 0 || deckValues.trim().length === 0}
                >
                    Save Deck
                </Button>
            </DialogActions>
        </Dialog>
    );
}