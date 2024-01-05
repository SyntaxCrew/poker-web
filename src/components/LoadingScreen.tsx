import { CircularProgress } from "@mui/material";

export default function LoadingScreen(props: {isLoading: boolean, isBackdropBrightness?: boolean}) {
    return (
        <>
            {<div className={"absolute w-screen h-screen ease-in duration-200 transition-[--tw-backdrop-brightness] " + (props.isLoading && !props.isBackdropBrightness ? 'z-[9999] backdrop-brightness-50' : props.isLoading ? 'z-[9999]' : '-z-10 backdrop-brightness-100')}>
                {props.isLoading && <div className="m-auto text-center h-full">
                    <div className="relative top-1/2 -translate-y-1/2">
                        <CircularProgress />
                    </div>
                </div>}
            </div>}
        </>
    )
}
