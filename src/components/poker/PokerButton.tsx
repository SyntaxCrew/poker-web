import { Button } from "@mui/material";
import { displayButton, flipCard, isUsersExists } from "../../composables/poker";
import { Poker } from "../../models/poker";
import { UserProfile } from "../../models/user";

export default function PokerButton(props: {poker: Poker, profile: UserProfile}) {
    return (
        <Button
            variant="contained"
            color="success"
            className="whitespace-nowrap"
            onClick={() => flipCard(props.poker)}
            disabled={(props.poker.estimateStatus === 'CLOSED' && !isUsersExists(props.poker, true)) || !displayButton(props.poker, props.profile, props.poker.option.allowOthersToShowEstimates)}
        >
            { props.poker.estimateStatus === 'OPENED' ? 'Vote Next Issue' : 'Reveal Cards' }
        </Button>
    )
}
