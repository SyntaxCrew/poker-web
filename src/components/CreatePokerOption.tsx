import { ChangeEvent, useEffect, useState } from "react";
import { Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Switch, TextField } from "@mui/material";
import Alert from "./Alert";
import CreateCustomDeck from "./CreateCustomDeck";
import LoadingScreen from "./LoadingScreen";
import { Deck } from "../models/game";
import { AnonymousLocalStorageKey } from "../models/key";
import { CreatePokerOptionDialog, PokerOption } from "../models/poker";
import { UserProfile } from "../models/user";
import { createCustomDeck, getCustomDecks } from "../repository/firestore/game";
import { setValue } from "../utils/input";
import { getItem } from "../utils/local-storage";

export default function CreatePokerOption(props: {isOpen: boolean, onSubmit: (result: CreatePokerOptionDialog) => void, onCancel: () => void, profile: UserProfile}) {
    const [estimateOptions, setEstimateOptions] = useState<Deck[]>([
        {
            deckName: 'Fibonacci',
            deckValues: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
        },
        {
            deckName: 'Manday',
            deckValues: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '7', '?', '☕'],
        },
    ]);

    const defaultOption: PokerOption = {
        estimateOptions: estimateOptions[0].deckValues,
        autoRevealCards: true,
        allowOthersToShowEstimates: true,
        allowOthersToClearUsers: false,
        allowOthersToDeleteEstimates: false,
        showAverage: true,
    };

    const [roomName, setRoomName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isSpectator, setSpectator] = useState(false);
    const [estimateOptionIndex, setEstimateOptionIndex] = useState(0);
    const [pokerOption, setPokerOption] = useState<PokerOption>({...defaultOption});
    const [isShowCollapse, setShowCollapse] = useState(false);
    const [isShowCreateCustomDeck, setShowCreateCustomDeck] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{isShow: boolean, message: string, severity: 'error' | 'success'}>({isShow: false, message: '', severity: 'error'});

    useEffect(() => {
        init();
        async function init() {
            if (props.profile.userUUID) {
                const customDecks = !props.profile.isAnonymous ? (await getCustomDecks(props.profile.userUUID)) : (getItem<Deck[]>(AnonymousLocalStorageKey.CustomDecks, true) || []);
                setEstimateOptions([...estimateOptions, ...customDecks]);
            }
            setDisplayName(props.profile.displayName || '');
        }
    }, [props.profile]);

    const optionList = [
        {
            title: 'Join as spectator',
            description: 'Join the game as a spectator with no ability to vote.',
            value: isSpectator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setSpectator(checked),
        },
        {
            title: 'Auto-reveal cards',
            description: 'Show cards automatically after everyone voted.',
            value: pokerOption.autoRevealCards,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, autoRevealCards: checked}),
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
        props.onSubmit({displayName: displayName.trim(), isSpectator, option: {...pokerOption, estimateOptions: estimateOptions[estimateOptionIndex].deckValues}, roomName: roomName.trim()})
    }

    function onClose() {
        setTimeout(() => {
            setShowCollapse(false);
            setRoomName('');
            setDisplayName(props.profile.displayName || '');
            setSpectator(false);
            setEstimateOptionIndex(0);
            setPokerOption({...defaultOption});
        }, 200);
        props.onCancel();
    }

    async function addCustomDeck(deck: Deck) {
        if (!props.profile.userUUID) {
            return;
        }
        if (props.profile.isAnonymous) {
            const customDecks = getItem<Deck[]>(AnonymousLocalStorageKey.CustomDecks, true) || [];
            localStorage.setItem(AnonymousLocalStorageKey.CustomDecks, JSON.stringify([...customDecks, deck]))
            return;
        }
        try {
            setLoading(true);
            await createCustomDeck(props.profile.userUUID, deck);
            setEstimateOptions([...estimateOptions, deck]);
            setAlert({message: 'Create new custom deck successfully', severity: 'success', isShow: true});
        } catch (error) {
            setAlert({message: 'Create new custom deck failed', severity: 'error', isShow: true});
        } finally {
            setShowCreateCustomDeck(false);
            setLoading(false);
        }
    }

    return (
        <>
            <Alert isShowAlert={alert.isShow} onDismiss={() => setAlert({...alert, isShow: false})} severity={alert.severity} message={alert.message} />
            <LoadingScreen isLoading={isLoading} />

            <Dialog open={props.isOpen} fullWidth>
                {!isShowCreateCustomDeck && <>
                    <DialogTitle>Game Option</DialogTitle>

                    <DialogContent className="flex flex-col gap-4 !max-w-2xl !w-full relative">
                        <TextField
                            fullWidth
                            variant='outlined'
                            placeholder='Enter Display Name'
                            label="Display's Name"
                            value={displayName}
                            onChange={setValue(setDisplayName)}
                            className="!mt-2"
                        />
                        <TextField
                            fullWidth
                            variant='outlined'
                            placeholder='Enter Room Name'
                            label="Room's Name"
                            value={roomName}
                            onChange={setValue(setRoomName)}
                        />
                        <TextField select label="Voting system" value={estimateOptionIndex} onChange={e => Number(e.target.value) !== -1 && setEstimateOptionIndex(Number(e.target.value))}>
                            {estimateOptions.map((estimate, index) => {
                                return (
                                    <MenuItem key={index} value={index}>{ `${estimate.deckName} ( ${estimate.deckValues.join(', ')} )` }</MenuItem>
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
                    onClose={() => setShowCreateCustomDeck(false)}
                />}
            </Dialog>
        </>
    )
}
