import * as React from "react";
import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
};

const base = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
const variants: Record<string, string> = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
    ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
};
const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
};

export default function Button({
    variant = "primary",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={(props.type as any) ?? "button"}
            className={clsx(base, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}