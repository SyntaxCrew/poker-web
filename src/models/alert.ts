export interface Alert {
    isShow: boolean
    message: string
    severity: "success" | "info" | "warning" | "error"
}
