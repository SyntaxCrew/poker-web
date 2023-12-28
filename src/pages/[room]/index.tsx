import { useParams } from "react-router-dom";

export default function PokerRoomPage() {
    const { room } = useParams();
    return (
        <div>{ room }</div>
    );
}