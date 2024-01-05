import React, { ChangeEvent, SetStateAction } from "react";

export function pressEnter(callback: () => void) {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            callback();
        }
    }
}

export function setValue(setState: (value: SetStateAction<string>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setState(event.target.value)
}
