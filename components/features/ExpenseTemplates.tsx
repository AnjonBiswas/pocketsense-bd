"use client";

import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpenseTemplate } from "@/lib/utils/expenseTemplates";

export function ExpenseTemplates({
  current,
  onSelect
}: {
  current: {
    amount: number;
    category: string;
    note: string;
  };
  onSelect: (template: ExpenseTemplate) => void;
}) {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/expense-templates", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        setTemplates(payload.templates || []);
      })
      .catch(() => null);
  }, []);

  async function saveCurrentTemplate() {
    if (!current.amount || !current.note.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/expense-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: current.note.trim(),
          amount: current.amount,
          category: current.category,
          note: current.note.trim()
        })
      });
      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.template) {
        setTemplates((existing) => [payload.template, ...existing].slice(0, 8));
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTemplate(id: string) {
    const response = await fetch(`/api/expense-templates?id=${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setTemplates((existing) => existing.filter((template) => template.id !== id));
    }
  }

  return (
    <div className="space-y-3 rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-emerald-950">Expense templates</p>
          <p className="text-xs text-emerald-800">Save frequent expenses like canteen lunch for one-tap reuse.</p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={saveCurrentTemplate} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save template"}
        </Button>
      </div>

      {templates.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between rounded-2xl bg-white px-3 py-3 shadow-sm">
              <button type="button" className="min-w-0 text-left" onClick={() => onSelect(template)}>
                <p className="truncate font-medium text-slate-900">{template.title}</p>
                <p className="text-xs text-muted-foreground">
                  ৳{template.amount} • {template.category}
                </p>
              </button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void deleteTemplate(template.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-emerald-900/80">No templates yet. Save your first repeat expense from this form.</p>
      )}
    </div>
  );
}
