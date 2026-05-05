'use client'
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
    private static _listener: ((toasts: ToastNotification[]) => void) | null = null;

    static get toastList() {
        return this._toasts;
    }

    static setListener(fn: ((toasts: ToastNotification[]) => void) | null) {
        this._listener = fn;
    }

    static addToast(toast: ToastNotification): void;
    static addToast(message: string, status: ToastNotificationStatus): void;
    static addToast(toastOrMessage: ToastNotification | string, status?: ToastNotificationStatus): void {
        const toast = toastOrMessage instanceof ToastNotification
            ? toastOrMessage
            : new ToastNotification(toastOrMessage, status!);
        this._toasts.push(toast);
        this._listener?.([...this._toasts]);
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

    useEffect(() => {
        NotificationManager.setListener(setToasts);
        return () => NotificationManager.setListener(null);
    }, []);

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
