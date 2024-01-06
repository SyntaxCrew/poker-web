import React, { ChangeEvent, SetStateAction } from "react";

export function pressEnter(callback: () => void, pressEscape?: () => void) {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            callback();
        } else if (pressEscape && event.key === 'Escape') {
            pressEscape();
        }
    }
}

export function setValue(setState: (value: SetStateAction<string>) => void, opt?: { maximum?: number, regexs?: RegExp[], others?: ((value: string) => string)[] }) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value = event.target.value;
        if (opt) {
            if (opt.regexs) {
                for (const regex of opt.regexs) {
                    value = validateFormPattern(value, regex);
                }
            }
            if (opt.others) {
                for (const other of opt.others) {
                    value = other(value);
                }
            }
            if (opt.maximum && value.length > opt.maximum) {
                return;
            }
        }
        setState(value);
    }
}

export const validateFormPattern = (value: string, regex: RegExp): string => value?.toString().replace(regex, '')

export const noSpace = (value: string): string => value?.trim().replace(" ", "")
export const notStartWithSpace = (value: string): string => value?.trim() ? value : ""
export const notMultiSpace = (value: string): string => value?.replace("  ", " ")

export const uppercase = (value: string): string => value?.toUpperCase()
export const lowercase = (value: string): string => value?.toLowerCase()

export const maxLength = (value: string, length: number): string => value?.length > length ? value.substring(0, Math.min(length, value?.length)) : value

export const dashIsolate = (value: string): string => [" ", "-"].includes(value) ? "" : value?.replace(" ", "-").replace("--", "-")
