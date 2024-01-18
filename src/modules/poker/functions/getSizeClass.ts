import { Size } from "@core/@types/size"
import { CSSProperties } from "react"

export function imageSizeStyle(size?: Size): CSSProperties {
    let baseSize!: string;
    switch (size) {
        case 'large':
            baseSize = '4rem'
            break
        case 'small':
            baseSize = '2rem'
            break
        default:
            baseSize = '3rem'
            break
    }
    return { minWidth: baseSize, maxWidth: baseSize, minHeight: baseSize, maxHeight: baseSize }
}

export function imageLoadingSizeStyle(size?: Size): CSSProperties {
    let baseSize!: string;
    switch (size) {
        case 'large':
            baseSize = '2.5rem'
            break
        case 'small':
            baseSize = '1.5rem'
            break
        default:
            baseSize = '2rem'
            break
    }
    return { minWidth: baseSize, maxWidth: baseSize, minHeight: baseSize, maxHeight: baseSize }
}

export function fontSizeStyle(size?: Size): CSSProperties {
    switch (size) {
        case 'large':
            return {
                fontSize: '1.5rem',
                lineHeight: '2rem',
            }
        case 'small':
            return {
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
            }
        default:
            return {
                fontSize: '1.25rem',
                lineHeight: '1.75rem',
            }
    }
}
