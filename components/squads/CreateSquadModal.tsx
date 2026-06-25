"use client";

import { useState } from "react";
import { LoaderCircle, Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SquadMemberProfile } from "@/lib/utils/squads";

type CreateSquadModalProps = {
  onCreated: () => Promise<void> | void;
};

export function CreateSquadModal({ onCreated }: CreateSquadModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SquadMemberProfile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SquadMemberProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const searchMembers = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/squads/members?q=${encodeURIComponent(query.trim())}`, {
        cache: "no-store"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Member search failed.");
      }

      setResults(payload.members || []);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Member search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const createSquad = async () => {
    if (!name.trim()) {
      setError("Squad name is required.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/squads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          memberIds: selectedMembers.map((member) => member.id)
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to create squad.");
      }

      setOpen(false);
      setName("");
      setQuery("");
      setResults([]);
      setSelectedMembers([]);
      await onCreated();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create squad.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-primary text-primary-foreground">Create new squad</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create squad</DialogTitle>
          <DialogDescription>Start a shared expense group with your friends using phone search.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="squad-name">Squad name</Label>
            <Input id="squad-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Hall Foodies" />
          </div>

          <div className="space-y-3">
            <Label>Add members</Label>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by phone or name"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    searchMembers();
                  }
                }}
              />
              <Button type="button" variant="outline" className="rounded-full" onClick={searchMembers} disabled={isSearching}>
                {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {selectedMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <span key={member.id} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                    {member.name || member.phone}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMembers((current) => current.filter((item) => item.id !== member.id))
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              {results.map((member) => {
                const selected = selectedMembers.some((item) => item.id === member.id);

                return (
                  <button
                    key={member.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                    onClick={() => {
                      if (selected) return;
                      setSelectedMembers((current) => [...current, member]);
                    }}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{member.name || "Unnamed user"}</p>
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {selected ? "Added" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={createSquad} disabled={isCreating}>
            {isCreating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

