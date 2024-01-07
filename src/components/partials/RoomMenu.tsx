import { MouseEvent, useContext, useState } from "react";
import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { ExpandMore, GroupRemove, Restore, Settings } from "@mui/icons-material";
import GameSettingDialog from "../dialog/GameSettingDialog";
import VotingHistoryDialog from "../dialog/VotingHistoryDialog";
import GlobalContext from "../../context/global";
import { Menu as MenuModel } from "../../models/menu";
import { UpdatePokerOptionDialog } from "../../models/poker";
import { clearUsers, updatePokerOption } from "../../repository/firestore/poker";

export default function RoomMenu() {
    const { poker, profile, setLoading, alert } = useContext(GlobalContext);

    type Dialog = 'game-setting' | 'voting-history' | 'close';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isOpenMenu, setOpenMenu] = useState(false);
    const [openDialog, setOpenDialog] = useState<Dialog>('close');

    if (!poker) {
        return (<></>);
    }

    const isUsersExists = (isPoked?: boolean) => {
        if (!poker) {
            return false;
        }
        for (const pokerUser of Object.values(poker.user)) {
            if (!pokerUser.isSpectator && pokerUser.activeSessions?.length > 0 && (!isPoked || pokerUser.estimatePoint != null)) {
                return true;
            }
        }
        return false;
    }
    const displayButton = (isAllowOption: boolean) => isUsersExists() && poker && (poker.user[profile.userUUID]?.isFacilitator || (isAllowOption && !poker.user[profile.userUUID]?.isSpectator && poker.user[profile.userUUID]?.activeSessions?.length > 0))

    const toggle = (event: MouseEvent<HTMLButtonElement>) => {
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
                hasMenu: () => poker.user[profile.userUUID]?.isFacilitator || poker.option.allowOthersToClearUsers,
                onClick: () => poker && !!poker.roomID && displayButton(poker.option.allowOthersToClearUsers) && clearUsers(poker.roomID),
                disabled: poker?.estimateStatus === 'OPENING' || !displayButton(poker.option.allowOthersToClearUsers),
            },
        ],
        [
            {
                prefixIcon: <Settings fontSize="small" />,
                text: 'Game Settings',
                onClick: () => setOpenDialog('game-setting'),
            },
            {
                prefixIcon: <Restore fontSize="small" />,
                text: 'Voting History',
                disabled: true,
                onClick: () => setOpenDialog('voting-history'),
            },
        ]
    ];
    return (
        <>
            <IconButton className="!rounded-lg hover:!bg-gray-200 !ease-in !duration-200 !transition-colors" onClick={toggle}>
                <div className="text-black flex overflow-hidden items-center max-w-3xl px-2 gap-2">
                    <Typography fontWeight={900} fontSize={18}>{ poker.roomName }</Typography>
                    <ExpandMore className={"!ease-in !duration-200 !transition-transform" + (isOpenMenu ? ' rotate-180' : '')} />
                </div>
            </IconButton>

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

            <GameSettingDialog open={openDialog === 'game-setting'} onSubmit={updateGameSetting} onClose={() => setOpenDialog('close')} profile={profile} poker={poker} />
            <VotingHistoryDialog open={openDialog === 'voting-history'} onClose={() => setOpenDialog('close')} poker={poker} />
        </>
    );
}
