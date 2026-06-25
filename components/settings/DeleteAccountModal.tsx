"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type DeleteAccountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function DeleteAccountModal({ open, onOpenChange, onConfirm }: DeleteAccountModalProps) {
  const [checked, setChecked] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setChecked(false);
      setConfirmationText("");
    } finally {
      setIsDeleting(false);
    }
  }

  const canDelete = checked && confirmationText === "DELETE" && !isDeleting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This will soft-delete your profile, anonymize personal data, and sign you out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-[24px] border border-red-200 bg-red-50/70 px-4 py-4 text-sm text-red-900">
            <input type="checkbox" className="mt-1" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
            <span>I understand this is permanent</span>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type DELETE to confirm</label>
            <input
              value={confirmationText}
              onChange={(event) => setConfirmationText(event.target.value)}
              className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background"
              placeholder="DELETE"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="outline" className="rounded-full border-red-300 text-red-700 hover:bg-red-50" disabled={!canDelete} onClick={handleDelete}>
            {isDeleting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
