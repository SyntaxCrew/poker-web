import { Size } from "@core/@types/size"
import ImageLoading from "@core/components/ImageLoading"
import { fontSizeStyle, imageLoadingSizeStyle, imageSizeStyle } from "@modules/poker/functions/getSizeClass"

export default function UserAvatar(props: {size?: Size, displayName: string, imageURL?: string}) {
    if (props.imageURL) {
        return <ImageLoading url={props.imageURL} imageSize={imageSizeStyle(props.size)} loadingImageSize={imageLoadingSizeStyle(props.size)} className="rounded-full m-auto" />
    }
    return (
        <div className="rounded-full m-auto w-fit bg-blue-300 hover:brightness-90 ease-in duration-200 transition-[--tw-brightness]">
            <div className={`flex items-center justify-center font-bold text-white text-xl cursor-pointer select-none `} style={imageSizeStyle(props.size)}>
                <span style={fontSizeStyle(props.size)}>
                    { props.displayName ? props.displayName.charAt(0).toUpperCase() : 'U' }
                </span>
            </div>
        </div>
    )
}
