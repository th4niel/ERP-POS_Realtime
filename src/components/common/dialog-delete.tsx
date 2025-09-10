import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

export default function DialogDelete({open, onOpenChange, title, onSubmit, isLoading}: {
    open: boolean, 
    onOpenChange: (open: boolean) => void;
    title: string;
    onSubmit: () => void;
    isLoading: boolean;
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
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button formAction={onSubmit}>
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Delete'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>;
};