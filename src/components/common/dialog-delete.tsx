import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

export default function DialogDelete({open, onOpenChange, title}: {
    open: boolean, 
    onOpenChange: (open: boolean) => void;
    title: string;
}) {
    return <Dialog open={open} onOpenChange={onOpenChange}> 
        <DialogContent className="sm:max-w-[425px]">
            <form className="grid gap-6">
                <DialogHeader>
                    <DialogTitle>Delete {title}</DialogTitle>
                    <DialogDescription>
                        Are you sure want to delete{' '} <span className="lowercase">{title}</span>
                    </DialogDescription>
                </DialogHeader>
            </form>
        </DialogContent>
    </Dialog>;
};