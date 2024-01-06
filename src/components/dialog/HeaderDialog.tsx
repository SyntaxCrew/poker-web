import { DialogTitle, Divider, IconButton } from "@mui/material";
import { Close, ArrowBack } from "@mui/icons-material";

export default function HeaderDialog(props: {title: string, onClose?: (event: 'close' | 'back') => void, canBack?: boolean}) {
    return (
        <>
            <DialogTitle>
                <div className="flex items-center justify-between gap-4 overflow-hidden w-full">
                        {props.canBack && <ArrowBack onClick={() => props.onClose && props.onClose('back')} className="cursor-pointer" />}
                        <div className="text-ellipsis whitespace-nowrap overflow-hidden w-full">{ props.title }</div>
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => props.onClose && props.onClose('close')}
                            className="w-fit"
                        >
                            <Close fontSize="inherit" color="error" />
                        </IconButton>
                    </div>
            </DialogTitle>
            <Divider />
        </>
    );
}
