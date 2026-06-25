import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { ReportPdfDocument, getReportPdfFileName } from "@/components/reports/ReportPdfDocument";

async function fetchReportData(request: NextRequest) {
  const host = request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    throw new Error("Unable to resolve host.");
  }

  const response = await fetch(`${protocol}://${host}/api/reports?${request.nextUrl.searchParams.toString()}`, {
    headers: {
      cookie: request.headers.get("cookie") || ""
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch report data for PDF export.");
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const report = await fetchReportData(request);
    const documentElement = React.createElement(ReportPdfDocument, {
      report
    }) as unknown as React.ReactElement<DocumentProps>;
    const instance = pdf(documentElement);
    const blob = await instance.toBlob();
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${getReportPdfFileName(report.endDate)}"`
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export report." },
      { status: 500 }
    );
  }
}
