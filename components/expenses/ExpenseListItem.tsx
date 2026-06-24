"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import type { Expense } from "@/store/expenseStore";
import { getCategoryMeta } from "@/lib/utils/categories";

type ExpenseListItemProps = {
  expense: Expense;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: () => void;
  onEdit: () => void;
};

export function ExpenseListItem({
  expense,
  selected,
  onSelect,
  onDelete,
  onEdit
}: ExpenseListItemProps) {
  const meta = getCategoryMeta(expense.category);
  const touchStartX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  return (
    <div className="relative overflow-hidden rounded-[28px]">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-700">
        <Pencil className="h-5 w-5" />
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-rose-700">
        <Trash2 className="h-5 w-5" />
      </div>

      <div
        className="relative flex cursor-pointer items-center gap-3 rounded-[28px] border border-white/60 bg-white/90 px-4 py-4 shadow-sm transition"
        style={{ transform: `translateX(${dragOffset}px)` }}
        onClick={onEdit}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchMove={(event) => {
          const delta = event.touches[0].clientX - touchStartX.current;
          setDragOffset(Math.max(Math.min(delta, 72), -72));
        }}
        onTouchEnd={() => {
          if (dragOffset <= -60) {
            onDelete();
          } else if (dragOffset >= 60) {
            onEdit();
          }

          setDragOffset(0);
        }}
      >
        <div className="relative z-20">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect(event.target.checked)}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
        </div>

        <div
          className="relative z-20 flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl text-xl"
          style={{ backgroundColor: `${meta.color}22` }}
        >
          {meta.icon}
        </div>

        <div className="relative z-20 min-w-0 flex-1 text-left">
          <p className="truncate font-semibold text-slate-900">{expense.note || meta.bn}</p>
          <p className="text-xs text-muted-foreground">
            {meta.bn} • {format(new Date(expense.created_at || expense.date), "dd MMM, hh:mm a")}
          </p>
        </div>

        <div className="relative z-20 text-right">
          <p className="text-lg font-semibold text-rose-600">৳{expense.amount.toFixed(0)}</p>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
