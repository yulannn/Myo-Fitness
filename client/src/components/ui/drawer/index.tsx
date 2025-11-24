import * as React from "react";
import { Drawer as VaulDrawer } from "vaul";
import { clsx } from "clsx";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children }) => {
    return (
        <VaulDrawer.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <VaulDrawer.Portal>
                <VaulDrawer.Overlay className="fixed inset-0 bg-black/70 z-50" />
                <VaulDrawer.Content
                    className={clsx(
                        "fixed bottom-0 left-0 right-0 z-50",
                        "rounded-t-2xl bg-white dark:bg-neutral-900",
                        "p-4 shadow-xl"
                    )}
                >
                    <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                    {children}
                </VaulDrawer.Content>
            </VaulDrawer.Portal>
        </VaulDrawer.Root>
    );
};

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("flex flex-col space-y-1.5", className)} {...props} />
);

export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={clsx("mt-4 flex flex-col space-y-2", className)} {...props} />
);

export const DrawerTitle = React.forwardRef<
    React.ComponentRef<typeof VaulDrawer.Title>,
    React.ComponentPropsWithoutRef<typeof VaulDrawer.Title>
>(({ className, ...props }, ref) => (
    <VaulDrawer.Title
        ref={ref}
        className={clsx("text-lg font-semibold", className)}
        {...props}
    />
));

export const DrawerDescription = React.forwardRef<
    React.ComponentRef<typeof VaulDrawer.Description>,
    React.ComponentPropsWithoutRef<typeof VaulDrawer.Description>
>(({ className, ...props }, ref) => (
    <VaulDrawer.Description
        ref={ref}
        className={clsx("text-sm text-neutral-500 dark:text-neutral-400", className)}
        {...props}
    />
));
