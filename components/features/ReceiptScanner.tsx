"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Camera, FileText, LoaderCircle, ScanSearch, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { suggestCategoryFromNote, normalizeBanglaDigits } from "@/lib/ml/categorizer";

type ReceiptScannerProps = {
  onExtract: (payload: {
    amount?: number;
    date?: string;
    merchant?: string;
    note?: string;
    category?: string;
    receiptUrl?: string | null;
  }) => void;
};

function extractDate(text: string) {
  const match = text.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
  return match ? match[0].replace(/\//g, "-") : undefined;
}

function extractAmount(text: string) {
  const normalized = normalizeBanglaDigits(text);
  const matches = Array.from(normalized.matchAll(/(?:৳|tk|taka|টাকা)?\s*(\d+(?:\.\d{1,2})?)/gi))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);

  return matches.length ? Math.max(...matches) : undefined;
}

function extractMerchant(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || undefined;
}

async function fileToText(file: File) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv") || lowerName.endsWith(".txt")) {
    return file.text();
  }

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
    return workbook.SheetNames.map((sheetName) =>
      XLSX.utils
        .sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
        .flat()
        .join(" ")
    ).join("\n");
  }

  return "";
}

export function ReceiptScanner({ onExtract }: ReceiptScannerProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function uploadReceipt(file: File) {
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (!userId) {
        return null;
      }

      const path = `${userId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from("receipts").upload(path, file, {
        cacheControl: "3600",
        upsert: true
      });

      if (error) {
        return null;
      }

      const { data } = supabase.storage.from("receipts").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  }

  async function processImage(file: File) {
    const { recognize } = await import("tesseract.js");
    const result = await recognize(file, "eng+ben");
    return result.data.text;
  }

  async function handleFile(file: File) {
    setIsProcessing(true);
    setStatus("Scanning receipt...");

    try {
      const isImage = file.type.startsWith("image/");
      const extractedText = isImage ? await processImage(file) : await fileToText(file);
      const merchant = extractMerchant(extractedText || file.name.replace(/\.[^.]+$/, ""));
      const amount = extractAmount(extractedText);
      const date = extractDate(extractedText);
      const note = merchant ? `${merchant}${extractedText ? " receipt" : ""}` : "Scanned receipt";
      const category = suggestCategoryFromNote(`${merchant || ""} ${extractedText || ""}`).category || undefined;
      const receiptUrl = await uploadReceipt(file);

      if (isImage) {
        setPreviewUrl(URL.createObjectURL(file));
      }

      onExtract({
        amount,
        date,
        merchant,
        note,
        category,
        receiptUrl
      });
      setStatus(receiptUrl ? "Receipt scanned and uploaded to Supabase Storage." : "Receipt scanned. Review the fields before saving.");
    } catch {
      setStatus("Could not fully parse the file. Please review the fields manually.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-violet-200/80 bg-violet-50/80 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-base font-semibold text-violet-950">Receipt scanner</p>
          <p className="max-w-xl text-sm leading-6 text-violet-900/80">
            Camera capture, image upload, and spreadsheet receipt parsing with Bangla OCR support.
          </p>
        </div>
        <ScanSearch className="h-5 w-5 text-violet-700" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-[56px] justify-start rounded-2xl border-violet-200 bg-white px-4 py-3 text-left whitespace-normal"
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4 shrink-0" />
          <span className="min-w-0 leading-5">Camera</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-[56px] justify-start rounded-2xl border-violet-200 bg-white px-4 py-3 text-left whitespace-normal"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4 shrink-0" />
          <span className="min-w-0 leading-5">Image / PDF</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-auto min-h-[56px] justify-start rounded-2xl border-violet-200 bg-white px-4 py-3 text-left whitespace-normal"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="mr-2 h-4 w-4 shrink-0" />
          <span className="min-w-0 leading-5">Excel / CSV</span>
        </Button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.csv,.txt,.xlsx,.xls"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.currentTarget.value = "";
        }}
      />

      {isProcessing ? (
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-violet-900 shadow-sm">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {status}
        </div>
      ) : null}

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Receipt preview" className="h-44 w-full rounded-2xl object-cover sm:h-52" />
      ) : null}

      {status && !isProcessing ? <p className="text-sm leading-6 text-violet-900/80">{status}</p> : null}
    </div>
  );
}
