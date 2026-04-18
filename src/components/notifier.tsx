import { useEffect, useState } from "react";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";
import "./notifier.css";

export enum ToastNotificationStatus {
    Info = "info",
    Success = "success",
    Warning = "warning",
    Error = "error",
}

const STATUS_ICONS = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
} as const;

export class ToastNotification {
    constructor(message: string, status: ToastNotificationStatus) {
        this.message = message;
        this.status = status;
        this.createdAt = new Date();
    }

    public message: string;
    public status: ToastNotificationStatus;
    public createdAt: Date;
}

export class NotificationManager {
    private constructor() { }

    private static _toasts: ToastNotification[] = [];

    static get toastList() {
        return this._toasts;
    }

    static addToast(toast: ToastNotification) {
        this._toasts.push(toast);
    }
}

interface IToastProps {
    toast: ToastNotification;
    onDismiss: () => void;
}

function Toast({ toast, onDismiss }: IToastProps) {
    const Icon = STATUS_ICONS[toast.status];
    return (
        <div className={`toast ${toast.status}`}>
            <Icon className="toast-icon" size={16} />
            <span className="toast-message">{toast.message}</span>
            <button className="toast-dismiss" onClick={onDismiss} aria-label="Dismiss">
                <X size={14} />
            </button>
        </div>
    );
}

export default function Notifier() {
    const [toasts, setToasts] = useState<ToastNotification[]>([]);

    const dismiss = (index: number) => {
        NotificationManager.toastList.splice(index, 1);
        setToasts([...NotificationManager.toastList]);
    };

    return (
        <div className="notifier">
            {toasts.map((toast, index) => (
                <Toast key={index} toast={toast} onDismiss={() => dismiss(index)} />
            ))}
        </div>
    );
}
