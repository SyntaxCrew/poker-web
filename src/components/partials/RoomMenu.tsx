import { MouseEvent, useCallback, useContext, useState } from "react";
import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { ExpandMore, GroupRemove, Restore, Settings, Share, Visibility } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import GameSettingDialog from "../dialog/GameSettingDialog";
import SpectatorListDialog from "../dialog/SpectatorListDialog";
import SharedLinkDialog from "../dialog/ShareLinkDialog";
import VotingHistoryDialog from "../dialog/VotingHistoryDialog";
import GlobalContext from "../../context/global";
import { displayButton, flipCard, isUsersExists } from "../../composables/poker";
import { Menu as MenuModel } from "../../models/menu";
import { UpdatePokerOptionDialog } from "../../models/poker";
import { clearUsers, updatePokerOption } from "../../repository/firestore/poker";

export default function RoomMenu() {
    const { poker, profile, setLoading, alert, isDisplayVoteButtonOnTopbar } = useContext(GlobalContext);

    const location = useLocation();

    const isPokerPath = useCallback(() => {
        const paths = location.pathname.split('/');
        return paths.length === 2 && paths[1].length > 0;
    }, [location.pathname]);

    type Dialog = 'shared' | 'spectators' | 'game-setting' | 'voting-history' | 'close';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isOpenMenu, setOpenMenu] = useState(false);
    const [openDialog, setOpenDialog] = useState<Dialog>('close');

    if (!poker || !isPokerPath()) {
        return (<></>);
    }

    const toggle = (event: MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
        setOpenMenu(!isOpenMenu);
    }

    async function updateGameSetting(data: UpdatePokerOptionDialog) {
        if (!poker) {
            return;
        }
        setLoading(true);
        try {
            await updatePokerOption(poker.roomID, data.roomName, data.oldFacilitatorUUID, data.newFacilitatorUUID, data.option);
            setOpenDialog('close');
            alert({message: 'Update game setting successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Something went wrong, please try again!', severity: 'error'});
        }
        setLoading(false);
    }

    const menu: MenuModel[][] = [
        [
            {
                prefixIcon: <GroupRemove fontSize="small" />,
                text: 'Clear Users',
                onClick: () => poker && !!poker.roomID && displayButton(poker, profile, poker.option.allowOthersToClearUsers) && clearUsers(poker.roomID),
                disabled: !displayButton(poker, profile, poker.option.allowOthersToClearUsers),
            },
            {
                prefixIcon: <Visibility fontSize="small" />,
                text: 'Spectators List',
                onClick: () => setOpenDialog('spectators'),
            },
        ],
        [
            {
                prefixIcon: <Share fontSize="small" />,
                text: 'Shared',
                onClick: () => setOpenDialog('shared'),
            },
            {
                prefixIcon: <Settings fontSize="small" />,
                text: 'Game Settings',
                onClick: () => setOpenDialog('game-setting'),
            },
            {
                prefixIcon: <Restore fontSize="small" />,
                text: 'Voting History',
                onClick: () => setOpenDialog('voting-history'),
            },
        ],
    ];
    return (
        <>
            <div className="w-fit flex overflow-hidden items-center max-w-3xl px-2 py-1 gap-1 rounded-lg text-black hover:bg-gray-200 ease-in duration-200 transition-colors cursor-pointer" onClick={toggle}>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">{ poker.roomName }</div>
                <ExpandMore className={"!ease-in !duration-200 !transition-transform -mr-1.5" + (isOpenMenu ? ' rotate-180' : '')} />
            </div>

            <Menu
                anchorEl={anchorEl}
                open={isOpenMenu}
                onClose={() => setOpenMenu(false)}
                elevation={8}
                className="w-full"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {menu.filter(menuItems => menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile))?.length > 0).map((menuItems, index) => {
                    return (
                        <div key={index} className="w-56 max-w-full">
                            {index > 0 && <Divider className="!my-2" />}
                            {menuItems.filter(menuItem => !menuItem.hasMenu || menuItem.hasMenu(profile)).map((menuItem, itemIndex) => {
                                return (
                                    <MenuItem key={`${index}${itemIndex}`} disabled={menuItem.disabled} onClick={() => menuItem.onClick && menuItem.onClick()}>
                                        <ListItemIcon>
                                            { menuItem.prefixIcon }
                                        </ListItemIcon>
                                        <ListItemText
                                            primaryTypographyProps={{
                                                style: {
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    marginLeft: '-.25rem',
                                                }
                                            }}
                                        >
                                            { menuItem.text }
                                        </ListItemText>
                                    </MenuItem>
                                );
                            })}
                        </div>
                    );
                })}
            </Menu>

            {isDisplayVoteButtonOnTopbar && <div className="flex items-center gap-4 ml-auto">
                <Button
                    variant="contained"
                    color="success"
                    className="whitespace-nowrap"
                    onClick={() => flipCard(poker)}
                    disabled={(poker.estimateStatus === 'CLOSED' && !isUsersExists(poker, true)) || !displayButton(poker, profile, poker.option.allowOthersToShowEstimates)}
                >
                    { poker.estimateStatus === 'OPENED' ? 'Vote Next Issue' : 'Show Cards' }
                </Button>
            </div>}

            <SharedLinkDialog open={openDialog === 'shared'} onClose={() => setOpenDialog('close')} roomID={poker.roomID} />
            <SpectatorListDialog open={openDialog === 'spectators'} onClose={() => setOpenDialog('close')} poker={poker} profile={profile} />
            <GameSettingDialog open={openDialog === 'game-setting'} onSubmit={updateGameSetting} onClose={() => setOpenDialog('close')} profile={profile} poker={poker} />
            <VotingHistoryDialog open={openDialog === 'voting-history'} onClose={() => setOpenDialog('close')} poker={poker} />
        </>
    );
}
