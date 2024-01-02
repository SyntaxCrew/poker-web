import React from "react";

export function pressEnter(callback: () => void) {
    return (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            callback();
        }
    }
}
