import Image from "next/image";
import { CSSProperties, MouseEventHandler, useCallback, useEffect, useState } from "react";

export default function ImageLoading(props: {url: string, imageSize: CSSProperties, loadingImageSize: CSSProperties, className?: string, onClick?: MouseEventHandler<HTMLImageElement>}) {
    const [imagePlaceholder] = useState("https://www.signfix.com.au/wp-content/uploads/2017/09/placeholder-600x400.png")

    const [url, setURL] = useState(props.url);
    const [isLoading, setLoading] = useState(true);
    const [isError, setError] = useState(false);

    useEffect(() => {
        if (url != props.url) {
            setLoading(true);
            setURL(props.url);
            setError(false);
        }
    }, [props.url, url]);

    const setLoadingResult = useCallback((isError: boolean) => {
        setLoading(false)
        setError(isError)
    }, [])

    return (
        <div className="relative">
            {isLoading && <div className={"aspect-square bg-gray-700 text-white animate-pulse " + (props.className ? ` ${props.className}` : '')} style={props.imageSize}>
                <span className={"loading loading-spinner relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 "} style={props.loadingImageSize}></span>
            </div>}

            {isError && <Image
                unoptimized
                priority
                loader={() => url}
                width={100}
                height={100}
                alt="Placeholder Image"
                src={imagePlaceholder}
                referrerPolicy="no-referrer"
                className={"object-cover " + (props.className ? ` ${props.className}` : '')}
                style={props.imageSize}
            />}
            {!isError && <Image
                unoptimized
                priority
                loader={() => url}
                width={100}
                height={100}
                alt="Image"
                src={url}
                referrerPolicy="no-referrer"
                className={(isLoading ? 'absolute w-0 h-0 opacity-0' : `object-cover hover:brightness-90 ease-in duration-200 transition-[--tw-brightness] `) + (props.className ? ` ${props.className}` : '')}
                style={props.imageSize}
                onLoad={() => setLoadingResult(false)}
                onError={() => setLoadingResult(true)}
                onClick={props.onClick}
            />}
        </div>
    );
}
