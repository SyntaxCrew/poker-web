import { ChangeEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { Button, Collapse, Dialog, DialogActions, DialogContent, Divider, IconButton, InputAdornment, MenuItem, Switch, TextField } from "@mui/material";
import Close from '@mui/icons-material/Close';
import CreateCustomDeck from "./CreateCustomDeckDialog";
import HeaderDialog from "./HeaderDialog";
import { maximumDisplayNameLength, maximumRoomNameLength } from "../../constant/maximum-length";
import GlobalContext from "../../context/global";
import { Deck } from "../../models/game";
import { CreatePokerOptionDialog, PokerOption } from "../../models/poker";
import { UserProfile } from "../../models/user";
import { createCustomDeck, deleteCustomDeck, getCustomDecks } from "../../repository/firestore/game";
import { randomString } from "../../utils/generator";
import { notMultiSpace, notStartWithSpace, pressEnter, setValue } from "../../utils/input";

export default function CreatePokerRoomDialog(props: {isOpen: boolean, onSubmit: (result: CreatePokerOptionDialog) => void, onCancel: () => void, profile: UserProfile}) {
    const { setLoading, alert } = useContext(GlobalContext);

    const defaultDisplayName = "Guest";
    const defaultRoomName = "Room";
    const [ defaultDecks ] = useState<Deck[]>([
        {
            deckID: randomString(20),
            deckName: 'Fibonacci',
            deckValues: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
            isDefault: true,
        },
        {
            deckID: randomString(20),
            deckName: 'Manday',
            deckValues: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '7', '?', '☕'],
            isDefault: true,
        },
    ]);
    const [ defaultOption ] = useState<PokerOption>({
        estimateOption: {
            decks: [...defaultDecks],
            activeDeckID: defaultDecks[0].deckID,
        },
        allowOthersToShowEstimates: true,
        allowOthersToClearUsers: false,
        allowOthersToDeleteEstimates: false,
        showAverage: true,
    });

    const [roomName, setRoomName] = useState(defaultRoomName);
    const [displayName, setDisplayName] = useState(defaultDisplayName);
    const [isSpectator, setSpectator] = useState(false);
    const [estimateOptionIndex, setEstimateOptionIndex] = useState(0);
    const [estimateOptions, setEstimateOptions] = useState<Deck[]>([...defaultDecks]);
    const [pokerOption, setPokerOption] = useState<PokerOption>({...defaultOption});

    const [isShowCollapse, setShowCollapse] = useState(false);
    const [isShowCreateCustomDeck, setShowCreateCustomDeck] = useState(false);

    useEffect(() => {
        init();
        async function init() {
            if (props.profile.userUUID) {
                setEstimateOptions([...defaultDecks, ...(await getCustomDecks(props.profile.userUUID))]);
            }
            setDisplayName(props.profile.displayName || defaultDisplayName);
        }
    }, [props.profile]);

    const inputs = [
        {
            placeholder: 'Enter Display Name',
            label: "Display's Name",
            value: displayName,
            onChange: setValue(setDisplayName, { maximum: maximumDisplayNameLength, others: [notStartWithSpace, notMultiSpace] }),
            endAdornmentText: (value: string) => `${value.length}/${maximumDisplayNameLength}`,
        },
        {
            placeholder: 'Enter Room Name',
            label: "Room's Name",
            value: roomName,
            onChange: setValue(setRoomName, { maximum: maximumRoomNameLength, others: [notStartWithSpace, notMultiSpace] }),
            endAdornmentText: (value: string) => `${value.length}/${maximumRoomNameLength}`,
        },
    ]

    const optionList = [
        {
            title: 'Join as spectator',
            description: 'Join the game as a spectator with no ability to vote.',
            value: isSpectator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setSpectator(checked),
        },
        {
            title: 'Allow others to show estimates',
            description: 'Allowed all players to flip cards and show results.',
            value: pokerOption.allowOthersToShowEstimates,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, allowOthersToShowEstimates: checked}),
        },
        {
            title: 'Allow others to delete estimates',
            description: 'Allowed all players to delete other player',
            value: pokerOption.allowOthersToDeleteEstimates,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, allowOthersToDeleteEstimates: checked}),
        },
        {
            title: 'Allow others to clear users',
            description: 'Allowed all players to clear all users',
            value: pokerOption.allowOthersToClearUsers,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, allowOthersToClearUsers: checked}),
        },
        {
            title: 'Show average in the results',
            description: 'Include the average value in the results of the voting.',
            value: pokerOption.showAverage,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, showAverage: checked}),
        },
    ]

    function onSubmit() {
        if (displayName.trim().length === 0 || roomName.trim().length === 0) {
            return;
        }
        props.onSubmit({
            displayName: displayName.trim(),
            isSpectator,
            option: {
                ...pokerOption,
                estimateOption: {
                    activeDeckID: estimateOptions[estimateOptionIndex].deckID,
                    decks: [...estimateOptions],
                },
            },
            roomName: roomName.trim(),
        })
    }

    function onClose() {
        setTimeout(() => {
            setShowCollapse(false);
            setRoomName(defaultRoomName);
            setDisplayName(props.profile.displayName || defaultDisplayName);
            setSpectator(false);
            setEstimateOptionIndex(0);
            setPokerOption({...defaultOption});
            setShowCreateCustomDeck(false);
        }, 200);
        props.onCancel();
    }

    const selectEstimate = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (Number(event.target.value) === -1) {
            return;
        }
        setEstimateOptionIndex(Number(event.target.value))
    }

    async function addCustomDeck(deck: Deck) {
        if (!props.profile.userUUID) {
            return;
        }
        try {
            setLoading(true);
            await createCustomDeck(props.profile.userUUID, deck);
            setEstimateOptions([...defaultDecks, ...(await getCustomDecks(props.profile.userUUID))]);
            alert({message: 'Create new custom deck successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Create new custom deck failed', severity: 'error'});
        } finally {
            setShowCreateCustomDeck(false);
            setLoading(false);
        }
    }

    async function removeCustomDeck(event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>, deck: Deck) {
        if (!props.profile.userUUID) {
            return;
        }
        event.stopPropagation();
        try {
            setLoading(true);
            const selectedDeckID = estimateOptions[estimateOptionIndex].deckID;
            await deleteCustomDeck(props.profile.userUUID, deck);
            const estimates = [...defaultDecks, ...(await getCustomDecks(props.profile.userUUID))];
            setEstimateOptions(estimates);
            setEstimateOptionIndex(estimates.findIndex(estimate => estimate.deckID === selectedDeckID));
            alert({message: 'Remove custom deck successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Remove custom deck failed', severity: 'error'});
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Dialog open={props.isOpen} fullWidth>
                {!isShowCreateCustomDeck && <>
                    <HeaderDialog title='Game Option' onClose={onClose} />

                    <DialogContent className="flex flex-col gap-4 !max-w-2xl !w-full relative">
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
                                    onKeyDown={pressEnter(onSubmit, onClose)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">{ input.endAdornmentText(input.value) }</InputAdornment>,
                                    }}
                                    className={!index ? "!mt-2": ""}
                                />
                            );
                        })}
                        <TextField select label="Voting system" value={estimateOptionIndex} onChange={selectEstimate}>
                            {estimateOptions.map((estimate, index) => {
                                return (
                                    <MenuItem key={index} value={index}>
                                        <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
                                            <div className="w-full whitespace-pre-line">{ `${estimate.deckName} ( ${estimate.deckValues.join(', ')} )` }</div>
                                            {!estimate.isDefault && estimateOptionIndex !== index && <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={e => removeCustomDeck(e, estimate)}
                                            >
                                                <Close fontSize="inherit" color="error" />
                                            </IconButton>}
                                        </div>
                                    </MenuItem>
                                );
                            })}
                            <MenuItem value={-1} onClick={() => setShowCreateCustomDeck(true)}><div className="text-blue-500 font-bold">Create custom deck...</div></MenuItem>
                        </TextField>

                        {!isShowCollapse && <div className="text-blue-500 hover:text-blue-600 cursor-pointer -mb-4" onClick={() => setShowCollapse(true)}>Show advanced settings...</div>}
                        <Collapse in={isShowCollapse} >
                            {optionList.map((option, index) => {
                                return (
                                    <div className={"flex items-center justify-between gap-4" + (index ? ' mt-4' : '')} key={index}>
                                        <div className="flex flex-col">
                                            <label htmlFor="auto-reveal" className="font-bold">{ option.title }</label>
                                            <span className="text-gray-500">{ option.description }</span>
                                        </div>
                                        <Switch checked={option.value} onChange={option.setValue} />
                                    </div>
                                );
                            })}
                        </Collapse>
                    </DialogContent>

                    <Divider />
                    <DialogActions sx={{padding: '1rem'}}>
                        <Button variant="contained" color="error" onClick={onClose}>Cancel</Button>
                        <Button variant="contained" color="success" onClick={onSubmit} disabled={displayName.trim().length === 0 || roomName.trim().length === 0}>Create Room</Button>
                    </DialogActions>
                </>}

                {isShowCreateCustomDeck && <CreateCustomDeck
                    onSubmit={addCustomDeck}
                    onClose={event => event === 'close' ? onClose() : setShowCreateCustomDeck(false)}
                />}
            </Dialog>
        </>
    )
}
