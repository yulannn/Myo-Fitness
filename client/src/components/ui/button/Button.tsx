import * as React from "react";
import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
};

const base = "inline-flex items-center justify-center rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-offset-2";
const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-[#7CD8EE] to-[#2F4858] text-white shadow-md hover:shadow-lg transition-all active:scale-95",
    secondary: "bg-white border border-gray-200 text-[#2F4858] hover:bg-gray-50 focus:ring-[#7CD8EE]",
    ghost: "bg-transparent text-[#2F4858] hover:bg-[#7CD8EE]/10 focus:ring-[#7CD8EE]",
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