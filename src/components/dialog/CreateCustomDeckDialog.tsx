import { useEffect, useState } from "react";
import { Button, DialogActions, DialogContent, Divider, InputAdornment, TextField } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import EstimatePointCard from "../shared/EstimatePointCard";
import { maximumDeckNameLength } from "../../constant/maximum-length";
import { Deck } from "../../models/game";
import { notMultiSpace, notStartWithSpace, pressEnter, setValue } from "../../utils/input";

export default function CreateCustomDeck(props: {onSubmit: (value: Deck) => Promise<void>, onClose: (event: 'close' | 'back') => void}) {
    const defaultDeckValues = ['1', '2', '3', '4', '5', '8', '13'];
    const [deckName, setDeckName] = useState('My custom deck');
    const [deckValues, setDeckValues] = useState(defaultDeckValues.join(','));
    const [previewDeckValues, setPreviewDeckValues] = useState([...defaultDeckValues]);
    const [previewCurrentDeckValue, setPreviewCurrentDeckValue] = useState<string>();

    useEffect(() => {
        const values = deckValues.split(',');
        const validValues: string[] = [];
        let isFoundCurrentDeckValue = false;
        values.forEach(value => {
            if (value.trim().length <= 3 && value.trim().length > 0) {
                validValues.push(value.trim());
            }
            if (value === previewCurrentDeckValue) {
                isFoundCurrentDeckValue = true;
            }
        });
        if (!isFoundCurrentDeckValue) {
            setPreviewCurrentDeckValue(undefined);
        }
        setPreviewDeckValues(validValues);
    }, [deckValues]);

    const onSubmit = async () => {
        if (deckName.trim().length === 0 || deckValues.trim().length === 0) {
            return;
        }
        await props.onSubmit({
            deckID: '',
            deckName: deckName.trim(),
            deckValues: deckValues.trim().split(',').map(deckValue => deckValue.trim()),
            isDefault: false,
        });
        setDeckName('My custom deck');
        setPreviewCurrentDeckValue(undefined);
        setDeckValues(defaultDeckValues.join(','));
    }

    const inputs = [
        {
            placeholder: 'Enter Deck Name',
            label: "Deck Name",
            value: deckName,
            onChange: setValue(setDeckName, { maximum: maximumDeckNameLength, others: [notStartWithSpace, notMultiSpace] }),
            endAdornmentText: (value: string) => `${value.length}/${maximumDeckNameLength}`,
        },
        {
            placeholder: 'Enter Deck Values',
            label: "Deck Values",
            value: deckValues,
            onChange: setValue(setDeckValues),
            helperText: 'Enter up to 3 characters per value (repeatable value), separated by commas.',
        },
    ]

    return (
        <>
            <HeaderDialog title='Create Custom Deck' onClose={props.onClose} canBack />

            <DialogContent className="flex flex-col gap-4 relative">
                {inputs.map((input, index) => {
                    return (
                        <TextField
                            fullWidth
                            key={index}
                            variant='outlined'
                            placeholder={input.placeholder}
                            label={input.label}
                            value={input.value}
                            onChange={input.onChange}
                            InputProps={{
                                endAdornment: !input.endAdornmentText ? undefined : <InputAdornment position="end">{ input.endAdornmentText(input.value) }</InputAdornment>,
                            }}
                            helperText={input.helperText}
                            onKeyDown={pressEnter(onSubmit, () => props.onClose('close'))}
                            className={!index ? "!mt-2": ""}
                        />
                    );
                })}

                <div>
                    <div><b>Preview</b></div>
                    <div>This is a preview of how your deck will look like.</div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    {previewDeckValues.map((deckValue, index) => {
                        return (
                            <EstimatePointCard
                                key={index}
                                disabled={false}
                                estimatePoint={deckValue}
                                currentPoint={previewCurrentDeckValue}
                                onSelect={point => setPreviewCurrentDeckValue(point)}
                            />
                        );
                    })}
                </div>
            </DialogContent>

            <Divider />
            <DialogActions sx={{padding: '1rem'}}>
                <Button variant="contained" color="error" onClick={() => props.onClose('back')}>Cancel</Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onSubmit}
                    disabled={deckName.trim().length === 0 || deckValues.trim().length === 0}
                >
                    Save Deck
                </Button>
            </DialogActions>
        </>
    );
}