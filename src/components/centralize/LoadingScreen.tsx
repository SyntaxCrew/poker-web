import { Backdrop, CircularProgress } from "@mui/material";

export default function LoadingScreen(props: {isLoading: boolean, isBackdropBrightness?: boolean}) {
    return (
        <>
            <Backdrop
                sx={{ color: '#fff', zIndex: () => 9000 }}
                open={props.isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    )
}
