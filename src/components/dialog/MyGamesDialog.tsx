import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, Divider, Tab, Tabs } from "@mui/material";
import ConfirmDialog from "./ConfirmDialog";
import HeaderDialog from "./HeaderDialog";
import SortingTable from "../partials/SortingTable";
import GlobalContext from "../../context/global";
import { MyPokerGame } from "../../models/poker";
import { UserProfile } from "../../models/user";
import { deleteRoom, getMyGames } from "../../repository/firestore/poker";

function TabPanel(props: {value: number, index: number, children: ReactNode}) {
    const { value, index, children } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            className="w-full relative lg:pl-2 lg:ml-24 lg:mt-0 mt-14"
        >
            {value === index && <div className="px-2">
                {children}
            </div>}
        </div>
    );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function MyGamesDialog(props: {open: boolean, onClose?: () => void, profile: UserProfile}) {
    const { alert, setLoading } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [selectedRoomID, setSelectedRoomID] = useState('');
    const [tabIndex, setTabIndex] = useState(0);
    const [isFetching, setFetching] = useState(true);
    const [myGames, setMyGames] = useState<MyPokerGame[]>([]);
    const [isOpenConfirmDialog, setOpenConfirmDialog] = useState(false);

    const [columns] = useState(['Room ID', 'Room Name', 'Facilitator', 'Voter/Total', 'Room Created At', 'Last Played At']);
    const [tabs] = useState([
        {
            label: 'All',
            filter: (myGames: MyPokerGame[]) => myGames,
        },
        {
            label: 'Facilitator',
            filter: (myGames: MyPokerGame[], userUID: string) => myGames.filter(myGame => myGame.facilitator.userUID === userUID),
        },
        {
            label: 'Guester',
            filter: (myGames: MyPokerGame[], userUID: string) => myGames.filter(myGame => myGame.facilitator.userUID !== userUID),
        },
    ]);

    const fetchData = useCallback(async (userUUID: string) => {
        setFetching(true);
        try {
            setMyGames(await getMyGames(userUUID));
        } catch (error) {
            alert({message: `${error}`, severity: 'error'});
        }
        setFetching(false);
    }, [alert])

    useEffect(() => {
        initial();
        if (props.open) {
            fetchData(props.profile.userUUID);
        }
    }, [props.open, props.profile]);

    useEffect(() => {
        setSelectedRoomID('');
    }, [tabIndex])

    const joinRoom = useCallback(() => {
        setTimeout(() => initial(), 200);
        if (props.onClose) {
            props.onClose();
        }
        navigate(`/${selectedRoomID}`);
    }, [selectedRoomID]);

    const removeRoom = useCallback(async (userUID: string, roomID: string) => {
        if (!userUID || !roomID) {
            return;
        }
        setLoading(true);
        try {
            await deleteRoom(userUID, roomID);
            alert({message: 'Delete room successfully', severity: 'success'});
        } catch (error) {
            alert({message: 'Delete room failed, please try again!', severity: 'error'});
        }
        setLoading(false);
        await fetchData(userUID);
        setSelectedRoomID('');
    }, [alert, fetchData])

    const initial = useCallback(() => {
        setSelectedRoomID('');
        setTabIndex(0);
        setOpenConfirmDialog(false);
    }, []);

    return (
        <>
            <Dialog
                open={props.open}
                onClose={() => props.onClose && props.onClose()}
                maxWidth='lg'
                fullWidth
                PaperProps={{ style: {
                    minHeight: '90%',
                    maxHeight: '90%',
                }}}
            >
                <HeaderDialog title="My Games" onClose={props.onClose} />
                <DialogContent className="flex flex-grow relative">
                        {/* Vertical Tabs */}
                        <div className="lg:block hidden h-full absolute overflow-y-auto hide-scrollbar -mt-5">
                            <div className="py-2">
                                <Tabs
                                    variant="scrollable"
                                    orientation="vertical"
                                    value={tabIndex}
                                    onChange={(_, value) => setTabIndex(value)}
                                    sx={{ borderRight: 1, borderColor: 'divider' }}
                                    className=""
                                >
                                    {tabs.map((tab, index) => {
                                        return <Tab key={index} label={tab.label} className="h-fit" />
                                    })}
                                </Tabs>
                            </div>
                        </div>

                        {/* Horizontal Tabs */}
                        <div className="lg:hidden w-full h-14 absolute z-10 bg-white -ml-6 -mt-5">
                            <div className="px-4 py-2">
                                <Tabs
                                    variant="scrollable"
                                    orientation="horizontal"
                                    value={tabIndex}
                                    onChange={(_, value) => setTabIndex(value)}
                                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                                >
                                    {tabs.map((tab, index) => {
                                        return <Tab key={index} label={tab.label} className="w-fit" />
                                    })}
                                </Tabs>
                            </div>
                        </div>

                        {tabs.map((tab, index) => {
                            const games = tab.filter(myGames.sort((a, b) => a.roomID.localeCompare(b.roomID)), props.profile.userUUID);
                            const data = games.map(game => {
                                return {
                                    id: game.roomID,
                                    data: [
                                        game.roomID,
                                        game.roomName,
                                        game.facilitator.displayName + (game.facilitator.userUID === props.profile.userUUID ? ' (You)' : ''),
                                        `${game.user.voter}/${game.user.total}`,
                                        game.createdAt.toLocaleString('en-US'),
                                        game.updatedAt?.toLocaleString('en-US') ?? '-',
                                    ]
                                }
                            });
                            return (
                                <TabPanel
                                    key={index}
                                    value={tabIndex}
                                    index={index}
                                    {...a11yProps(index)}
                                >
                                    <SortingTable
                                        isLoading={isFetching}
                                        columns={columns}
                                        data={data}
                                        selectedID={selectedRoomID}
                                        onClick={(roomID) => setSelectedRoomID(selectedRoomID === roomID ? '' : roomID)}
                                        className="lg:max-h-[calc(100vh-13rem)] max-h-[calc(100vh-17rem)]"
                                    />
                                </TabPanel>
                            )
                        })}
                </DialogContent>

                <Divider />
                <DialogActions>
                    <div className="flex items-center flex-wrap justify-end gap-2">
                        <Button variant="outlined" color="error" onClick={() => props.onClose && props.onClose()}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenConfirmDialog(true)}
                            disabled={selectedRoomID === '' || myGames.find(myGame => myGame.roomID === selectedRoomID)?.facilitator.userUID !== props.profile.userUUID
                        }>
                            Delete
                        </Button>
                        <Button variant="contained" color="success" onClick={joinRoom} disabled={selectedRoomID === ''}>Join</Button>
                    </div>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={isOpenConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                onSubmit={() => removeRoom(props.profile.userUUID, selectedRoomID)}
                title={`Confirm Delete Room`}
                content={`Are you sure to delete room id '${selectedRoomID}'`}
                confirmLevel="error"
            />
        </>
    );
}
