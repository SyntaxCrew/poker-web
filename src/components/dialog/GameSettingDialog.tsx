import { Button, Dialog, DialogActions, DialogContent, Divider, IconButton, InputAdornment, MenuItem, Switch, TextField } from "@mui/material";
import HeaderDialog from "./HeaderDialog";
import { Poker, PokerOption, UpdatePokerOptionDialog } from "../../models/poker";
import { UserProfile } from "../../models/user";
import { ChangeEvent, useEffect, useState } from "react";
import { Deck } from "../../models/game";
import { notMultiSpace, notStartWithSpace, setValue } from "../../utils/input";
import { maximumRoomNameLength } from "../../constant/maximum-length";
import { Close } from "@mui/icons-material";
import CreateCustomDeck from "./CreateCustomDeckDialog";
import { randomString } from "../../utils/generator";

export default function GameSettingDialog(props: {open: boolean, onSubmit?: (data: UpdatePokerOptionDialog) => void, onClose?: () => void, profile: UserProfile, poker: Poker}) {
    const [roomName, setRoomName] = useState(props.poker.roomName);
    const [gameFacilitatorUUID, setGameFacilitatorUUID] = useState('');
    const [estimateOptionID, setEstimateOptionID] = useState('');
    const [estimateOptions, setEstimateOptions] = useState<Deck[]>([]);
    const [pokerOption, setPokerOption] = useState<PokerOption>({...props.poker.option});

    const [isShowCreateCustomDeck, setShowCreateCustomDeck] = useState(false);

    useEffect(() => {
        if (!props.open) {
            setTimeout(() => setShowCreateCustomDeck(false), 200)
            return;
        }
        setRoomName(props.poker.roomName);
        setEstimateOptions([...props.poker.option.estimateOption.decks]);
        setEstimateOptionID(props.poker.option.estimateOption.activeDeckID);
        setPokerOption(props.poker.option);
        const gameFacilitator = Object.entries(props.poker.user).find(([ , user ]) => user.isFacilitator);
        if (gameFacilitator) {
            const [ userUUID ] = gameFacilitator;
            setGameFacilitatorUUID(userUUID);
        }
    }, [props.open]);

    function onSubmit() {
        if (roomName.trim().length === 0 || props.onSubmit === undefined) {
            return;
        }
        const data: UpdatePokerOptionDialog = {
            roomName,
            oldFacilitatorUUID: gameFacilitatorUUID,
            newFacilitatorUUID: gameFacilitatorUUID,
            option: {
                ...pokerOption,
                estimateOption: {
                    activeDeckID: estimateOptionID,
                    decks: [...estimateOptions],
                },
            },
        }
        const gameFacilitator = Object.entries(props.poker.user).find(([ , user ]) => user.isFacilitator);
        if (gameFacilitator) {
            const [ userUUID ] = gameFacilitator;
            data.oldFacilitatorUUID = userUUID
        }
        props.onSubmit(data);
    }

    const inputs = ([
        {
            type: 'select',
            label: "Game Facilitator",
            value: gameFacilitatorUUID,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            onSelect: (value: string) => setGameFacilitatorUUID(value),
            element: (item: {value: string, text: string}) => <div className="w-full overflow-hidden">
                <div className="w-full whitespace-nowrap text-ellipsis overflow-hidden">{ item.text }</div>
            </div>,
            items: Object.entries(props.poker.user).map(([userUID, user]) => {
                return {
                    value: userUID,
                    text: user.displayName + (userUID === props.profile.userUUID ? ' (You)' : ''),
                }
            })
        },
        {
            type: 'text',
            placeholder: 'Enter Room Name',
            label: "Room's Name",
            value: roomName,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            onChange: setValue(setRoomName, { maximum: maximumRoomNameLength, others: [notStartWithSpace, notMultiSpace] }),
            endAdornmentText: (value: string) => `${value.length}/${maximumRoomNameLength}`,
        },
        {
            type: 'select',
            label: "Voting System",
            value: estimateOptionID,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            onSelect: (value: string) => value && setEstimateOptionID(value),
            onClick: (value: string) => !value && setShowCreateCustomDeck(true),
            element: (item: {value: string, text: string, clickable?: boolean}) => !item.value
                ? <div className="text-blue-500 font-bold">{ item.text }</div>
                : <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
                    <div className="w-full whitespace-pre-line">{ item.text }</div>
                    {item.clickable && item.value !== estimateOptionID && <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={event => {
                            event.stopPropagation();
                            setEstimateOptions(estimateOptions.filter(estimate => estimate.deckID !== item.value))
                        }}
                    >
                        <Close fontSize="inherit" color="error" />
                    </IconButton>}
                </div>,
            items: [...estimateOptions.map(estimate => {
                return {
                    value: estimate.deckID,
                    text: `${estimate.deckName} ( ${estimate.deckValues.join(', ')} )`,
                    clickable: !estimate.isDefault,
                }
            }), {
                value: '',
                text: 'Create custom deck...',
            }],
        },
        {
            type: 'switch',
            title: 'Auto-reveal cards',
            description: 'Show cards automatically after everyone voted.',
            value: pokerOption.autoRevealCards,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, autoRevealCards: checked}),
        },
        {
            type: 'switch',
            title: 'Allow others to show estimates',
            description: 'Allowed all players to flip cards and show results.',
            value: pokerOption.allowOthersToShowEstimates,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, allowOthersToShowEstimates: checked}),
        },
        {
            type: 'switch',
            title: 'Allow others to delete estimates',
            description: 'Allowed all players to delete other player',
            value: pokerOption.allowOthersToDeleteEstimates,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, allowOthersToDeleteEstimates: checked}),
        },
        {
            type: 'switch',
            title: 'Allow others to clear users',
            description: 'Allowed all players to clear all users',
            value: pokerOption.allowOthersToClearUsers,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, allowOthersToClearUsers: checked}),
        },
        {
            type: 'switch',
            title: 'Show average in the results',
            description: 'Include the average value in the results of the voting.',
            value: pokerOption.showAverage,
            disabled: !props.poker.user[props.profile.userUUID]?.isFacilitator,
            setValue: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => setPokerOption({...pokerOption, showAverage: checked}),
        },
    ])

    return (
        <Dialog open={props.open} onClose={() => props.onClose && props.onClose()} fullWidth>
            {!isShowCreateCustomDeck && <>
                <HeaderDialog title="Game Settings" onClose={props.onClose} />
                <DialogContent>
                    <div className="flex flex-col gap-4">
                        {inputs.map((input, index) => {
                            if (input.type === 'select') {
                                return (
                                    <TextField key={index} select label={input.label} value={input.value} onChange={e => input.onSelect && input.onSelect(e.target.value)} disabled={input.disabled}>
                                        {input.items?.map((item, index) => {
                                            return (
                                                <MenuItem key={index} value={item.value} onClick={() => input.onClick && input.onClick(item.value)}>
                                                    { input.element(item) }
                                                </MenuItem>
                                            );
                                        })}
                                    </TextField>
                                );
                            } else if (input.type === 'switch') {
                                return (
                                    <div key={index} className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col">
                                            <label htmlFor={input.label} className="font-bold">{ input.title }</label>
                                            <span className="text-gray-500">{ input.description }</span>
                                        </div>
                                        <Switch checked={Boolean(input.value)} onChange={input.setValue} disabled={input.disabled} />
                                    </div>
                                );
                            }
                            return (
                                <TextField
                                    fullWidth
                                    key={index}
                                    variant='outlined'
                                    placeholder={input.placeholder}
                                    label={input.label}
                                    value={input.value}
                                    onChange={input.onChange}
                                    disabled={input.disabled}
                                    InputProps={{
                                        endAdornment: input.endAdornmentText ? <InputAdornment position="end">{ input.endAdornmentText(input.value) }</InputAdornment> : undefined,
                                    }}
                                    className={!index ? "!mt-2": ""}
                                />
                            );
                        })}
                    </div>
                </DialogContent>

                <Divider />
                <DialogActions sx={{padding: '1rem'}}>
                    <Button variant="contained" color="error" onClick={() => props.onClose && props.onClose()}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={onSubmit} disabled={roomName.trim().length === 0}>Update</Button>
                </DialogActions>
            </>}

            {isShowCreateCustomDeck && <CreateCustomDeck
                onSubmit={async (deck) => {
                    setEstimateOptions([...estimateOptions, {...deck, deckID: randomString(20)}]);
                    setShowCreateCustomDeck(false);
                }}
                onClose={event => event === 'close' ? (props.onClose && props.onClose()) : setShowCreateCustomDeck(false)}
            />}
        </Dialog>
    );
}
