"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Printer,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../component/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../component/dropdown-menu";
import CustomDropdown from "../component/CustomDropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../component/dialog";
import { useRouter } from "next/navigation";
import PdfViewer from "../component/PdfViewer";

// Replaced SearchableFilter with CustomDropdown

interface FileRecord {
  id: number | string;
  serialNo: number;
  shelfNo: string;
  bundleNo: string;
  fileNo: string;
  refNo: string;
  subject: string;
  notePages: string;
  correspondencePages: string;
  classification: string;
  destructionDate: string;
  senderSignature: string;
  receiverSignature: string;
  remarks: string;
  pageRange: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface RecordApiItem {
  id?: number | string;
  legacyNo?: string | null;
  fileNo?: string | null;
  collectorFileNo?: string | null;
  gatthaNo?: string | null;
  shelfNo?: string | null;
  subject?: string | null;
  notePages?: string | null;
  correspondencePages?: string | null;
  classification?: string | null;
  destructionDate?: string | null;
  senderSignature?: string | null;
  receiverSignature?: string | null;
  remarks?: string | null;
  totalPages?: string | number | null;
}

interface RecordsPageApiResponse {
  content?: RecordApiItem[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
}

interface DocumentResponse {
  id: string;
  documentName: string;
  documentPath: string;
  recordId: string;
  createdAt: string;
  updatedAt: string;
}

const fallbackProjects = ["सुर्या प्रकल्प"];
const DEFAULT_SEARCH_COLUMNS = ["Subject", "Remarks", "File No"];

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function parseProjectsResponse(payload: unknown): ProjectOption[] {
  const root = toRecord(payload);
  const candidates =
    (Array.isArray(payload) && payload) ||
    (root && Array.isArray(root.projects) && root.projects) ||
    (root && Array.isArray(root.data) && root.data) ||
    [];

  const seenIds = new Set<string>();
  const parsed: ProjectOption[] = [];

  for (const item of candidates) {
    const row = toRecord(item);
    if (!row) continue;
    const idValue = row.id ?? row.projectId ?? row.uuid;
    const nameValue = row.name ?? row.projectName ?? row.title ?? row.label;
    const id = typeof idValue === "string" ? idValue.trim() : "";
    const name = typeof nameValue === "string" ? nameValue.trim() : "";
    if (!id || !name || seenIds.has(id)) continue;
    seenIds.add(id);
    parsed.push({ id, name });
  }

  return parsed;
}

function stringifyCell(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

function parseRecordsResponse(payload: unknown): RecordsPageApiResponse {
  const root = toRecord(payload);
  if (!root) return {};
  return {
    content: Array.isArray(root.content)
      ? (root.content as RecordApiItem[])
      : [],
    page: typeof root.page === "number" ? root.page : 0,
    size: typeof root.size === "number" ? root.size : 20,
    totalElements:
      typeof root.totalElements === "number" ? root.totalElements : 0,
    totalPages: typeof root.totalPages === "number" ? root.totalPages : 0,
    first: Boolean(root.first),
    last: Boolean(root.last),
  };
}

// const sampleData: FileRecord[] = [
//   {
//     id: 1,
//     serialNo: 1,
//     shelfNo: "",
//     bundleNo: "-",
//     fileNo: "40 (3) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 655",
//   },
//   {
//     id: 2,
//     serialNo: 2,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (2) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 505",
//   },
//   {
//     id: 3,
//     serialNo: 3,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "-",
//     refNo: "-",
//     subject:
//       "मौजे अक्करपट्टी व पोफरण येथील प्रकल्पाग्रस्तांसाठी कौशल्य विकास कार्यक्रमांतर्गत CSR FUND उपलब्ध करुन देणेबाबत.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "मौजे अक्करपट्टी व पोफरण येथील प्रकल्पाग्रस्तांसाठी कौशल्य विकास कार्यक्रमांतर्गत CSR FUND उपलब्ध करुन देणेबाबत संचिका असल्याने कायमस्वरुपी ठेवण्यात येते.",
//     pageRange: "1 ते 183",
//   },
//   {
//     id: 4,
//     serialNo: 4,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (1) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी घरबांधणी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर, जि. ठाणे येथील खालीलप्राणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी घरबांधणी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर, जि. ठाणे येथील खालीलप्राणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असल्याने संचिका कायमस्वरुपी ठेवण्यात येते.",
//     pageRange: "1 ते 307",
//   },
//   {
//     id: 5,
//     serialNo: 5,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "-",
//     refNo: "-",
//     subject: `तारापुर अणुउर्जा प्रकल्प टप्पा क्र. 3 व 4
// ---------------------------------------------------
// 1) मौजे अक्करपट्टी व पोफरण येथील प्रकल्पग्रस्तांच्या नोकरी व त्यांचे मुलांना शाळा प्रवेशाबाबत.
// 2) आर टी ई नुसार दिलेल्या प्रवेशाबाबत.`,
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks: `1) मौजे अक्करपट्टी व पोफरण येथील प्रकल्पग्रस्तांच्या नोकरी व त्यांचे मुलांना शाळा प्रवेशाबाबत व
// 2) आर टी ई नुसार दिलेल्या प्रवेशाबाबत माहिती असल्याने संचिका कायमस्वरुपी ठेवण्यात येते.`,
//     pageRange: "",
//   },
//   {
//     id: 6,
//     serialNo: 6,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "9 अ",
//     refNo: "-",
//     subject: "मौजे अक्करपट्टी संयुक्त मोजणी पत्रक गावठाण घरांचे मो.र.नं. 91",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "मौजे अक्करपट्टी संयुक्त मोजणी पत्रक गावठाण घरांचे मो.र.नं. 91 असल्याने संचिका कायमस्वरुपी ठेवण्यात येते.",
//     pageRange: "1 ते 505",
//   },
//   {
//     id: 7,
//     serialNo: 7,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (7) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 713",
//   },
//   {
//     id: 8,
//     serialNo: 8,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (4) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 433",
//   },
//   {
//     id: 9,
//     serialNo: 9,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (5) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 501",
//   },
//   {
//     id: 10,
//     serialNo: 10,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (8) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 775",
//   },
//   {
//     id: 11,
//     serialNo: 11,
//     shelfNo: "-",
//     bundleNo: "-",
//     fileNo: "40 (6) अ",
//     refNo: "-",
//     subject:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
//     notePages: "-",
//     correspondencePages: "-",
//     classification: "अ",
//     destructionDate: "कायम",
//     senderSignature: "",
//     receiverSignature: "",
//     remarks:
//       "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
//     pageRange: "1 ते 943",
//   },
// ];

function RecordsTableHeaderRows({ variant }: { variant: "screen" | "print" }) {
  const isP = variant === "print";
  const thP = (
    align: "center" | "left" = "center",
    bg: "soft" | "mid" = "soft",
  ) => {
    const bgc = bg === "mid" ? "bg-slate-300" : "bg-slate-200";
    const al = align === "left" ? "text-left" : "text-center";
    return `border border-slate-700 ${bgc} p-1.5 align-middle text-[8pt] font-bold leading-tight text-slate-900 ${al}`;
  };
  const pick = (printCn: string, screenCn: string) =>
    isP ? printCn : screenCn;

  return (
    <>
      <tr
        className={pick(
          "text-slate-900",
          "text-[0.8125rem] font-bold uppercase leading-none tracking-wide text-slate-900 sm:text-sm dark:text-slate-100",
        )}
      >
        <th
          className={pick(
            thP(),
            "sticky left-0 top-auto z-[18] box-border min-h-[3.5rem] min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b-0 border-l border-r border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          अ.क्र
        </th>
        <th
          className={pick(
            thP(),
            "sticky left-[4.5rem] top-auto z-[18] box-border min-h-[3.5rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-b-0 border-r border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          शेल्फ क्र.
        </th>
        <th
          className={pick(
            thP(),
            "sticky left-[9.5rem] top-auto z-[18] box-border min-h-[3.5rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-b-0 border-r border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          गट्टा क्र.
        </th>
        <th
          className={pick(
            thP(),
            "min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          नस्ती क्रमांक
        </th>
        <th
          className={pick(
            thP(),
            "min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          संचिका क्र.
        </th>
        <th
          className={pick(
            thP("left"),
            "min-h-[3.5rem] min-w-[280px] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-left align-middle dark:border-slate-500 dark:bg-slate-700 [@media(min-width:1024px)_and_(max-height:760px)]:min-w-[140px] [@media(min-width:1024px)_and_(max-width:1400px)]:min-w-[160px]",
          )}
        >
          विषय
        </th>
        <th
          colSpan={2}
          className={pick(
            thP("center", "mid"),
            "min-h-[3.5rem] border-b-0 border-x border-slate-300 bg-slate-300 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-600",
          )}
        >
          नस्ती बंद करताना त्यामधील पृष्ठ
        </th>
        <th
          className={pick(
            thP(),
            "min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          माहितीचे वर्गीकरण
        </th>
        <th
          className={pick(
            thP(),
            "min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          नस्ती नष्ट करण्याचा दिनांक
        </th>
        <th
          colSpan={2}
          className={pick(
            thP("center", "mid"),
            "min-h-[3.5rem] border-b-0 border-x border-slate-300 bg-slate-300 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-600",
          )}
        >
          व्यक्तीची सही
        </th>
        <th
          className={pick(
            thP("left"),
            "min-h-[3.5rem] min-w-[200px] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-left align-middle dark:border-slate-500 dark:bg-slate-700 [@media(min-width:1024px)_and_(max-height:760px)]:min-w-[120px] [@media(min-width:1024px)_and_(max-width:1400px)]:min-w-[140px]",
          )}
        >
          शेरा
        </th>
        <th
          className={pick(
            thP(),
            "min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700",
          )}
        >
          पृष्ठ क्र.
        </th>
        {!isP ? (
          <th className="min-h-[3.5rem] min-w-[5.5rem] max-w-[6rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-2 text-center align-middle text-[0.6875rem] font-bold uppercase leading-tight tracking-wide text-slate-900 sm:text-[0.75rem] dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100">
            View Files
          </th>
        ) : null}
      </tr>
      <tr
        className={pick(
          "text-slate-900",
          "text-xs font-bold uppercase leading-none tracking-wide text-slate-800 sm:text-[0.8125rem] dark:text-slate-200",
        )}
      >
        <th
          className={pick(
            thP(),
            "sticky left-0 top-auto z-[18] box-border min-h-[3rem] min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b border-l border-r border-t border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP(),
            "sticky left-[4.5rem] top-auto z-[18] box-border min-h-[3rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-t border-b border-r border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP(),
            "sticky left-[9.5rem] top-auto z-[18] box-border min-h-[3rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-t border-b border-r border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            `${thP("center", "mid")} bg-slate-400`,
            "min-h-[3rem] border-t border-b border-l border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500",
          )}
        >
          टिपणी भाग
        </th>
        <th
          className={pick(
            `${thP("center", "mid")} bg-slate-400`,
            "min-h-[3rem] border-t border-b border-r border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500",
          )}
        >
          पत्रव्यवहार भाग
        </th>
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            `${thP("center", "mid")} bg-slate-400`,
            "min-h-[3rem] border-t border-b border-l border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500",
          )}
        >
          पाठविणा-या
        </th>
        <th
          className={pick(
            `${thP("center", "mid")} bg-slate-400`,
            "min-h-[3rem] border-t border-b border-r border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500",
          )}
        >
          स्वीकारणा-याची
        </th>
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        <th
          className={pick(
            thP("center", "mid"),
            "min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600",
          )}
        />
        {!isP ? (
          <th
            className="min-h-[3rem] min-w-[5.5rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-2 dark:border-slate-500 dark:bg-slate-600"
            aria-hidden
          />
        ) : null}
      </tr>
    </>
  );
}

function RecordsDataRow({
  record,
  variant,
  onView,
  isViewLoading = false,
}: {
  record: FileRecord;
  variant: "screen" | "print";
  onView?: (record: FileRecord) => void;
  isViewLoading?: boolean;
}) {
  const isP = variant === "print";
  const tdSticky = (left: string, c: string) =>
    isP
      ? c
      : `${c} sticky ${left} z-[10] box-border bg-white dark:bg-slate-800`;
  const c1 =
    "border-b border-slate-200 p-4 text-center font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300";
  const c2 =
    "border-b border-r border-slate-200 bg-white p-4 text-center text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400";
  const pc = "p-1 text-[8pt] align-top";

  return (
    <tr
      className={
        isP
          ? ""
          : "group bg-white transition-colors duration-200 dark:bg-slate-800 [&_td]:align-top"
      }
    >
      <td
        className={tdSticky(
          "left-0",
          isP
            ? `${pc} text-center font-semibold`
            : `${c1} min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-l border-r`,
        )}
      >
        {record.serialNo}
      </td>
      <td
        className={tdSticky(
          "left-[4.5rem]",
          isP
            ? `${pc} text-center`
            : `${c2} min-w-[5rem] w-[5rem] max-w-[5rem]`,
        )}
      >
        {record.shelfNo || "-"}
      </td>
      <td
        className={tdSticky(
          "left-[9.5rem]",
          isP
            ? `${pc} text-center`
            : `${c2} min-w-[5rem] w-[5rem] max-w-[5rem]`,
        )}
      >
        {record.bundleNo || "-"}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-slate-100 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800"
        }
      >
        {isP ? (
          record.fileNo || "-"
        ) : (
          <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F0F0F0] px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {record.fileNo || "-"}
          </span>
        )}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        {record.refNo || "-"}
      </td>
      <td
        className={
          isP
            ? `${pc} text-left`
            : "border-b border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        }
      >
        <div
          className={
            isP
              ? "print-subject whitespace-pre-wrap break-words leading-snug"
              : "max-h-24 max-w-[300px] overflow-y-auto whitespace-pre-line break-words font-medium leading-relaxed text-slate-700 dark:text-slate-300 [scrollbar-width:thin] [@media(min-width:1024px)_and_(max-height:760px)]:max-w-[200px] [@media(min-width:1024px)_and_(max-width:1400px)]:max-w-[220px]"
          }
        >
          {record.subject}
        </div>
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-l border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        {record.notePages}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-r border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        {record.correspondencePages}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-slate-100 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800"
        }
      >
        {isP ? (
          record.classification
        ) : (
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${record.classification === "अ" ? "border border-amber-200 bg-amber-100 text-amber-700" : record.classification === "ब" ? "border border-blue-200 bg-blue-100 text-slate-600" : "border border-slate-200 bg-[#F0F0F0] text-slate-700"}`}
          >
            {record.classification}
          </span>
        )}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        {isP ? (
          record.destructionDate
        ) : record.destructionDate === "कायम" ? (
          <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {record.destructionDate}
          </span>
        ) : (
          record.destructionDate
        )}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-l border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        {record.senderSignature || "-"}
      </td>
      <td
        className={
          isP
            ? `${pc} text-center`
            : "border-b border-r border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        }
      >
        {record.receiverSignature || "-"}
      </td>
      <td
        className={
          isP
            ? `${pc} text-left`
            : "border-b border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
        }
      >
        <div
          className={
            isP
              ? "print-remarks whitespace-pre-wrap break-words text-slate-800"
              : "max-h-20 max-w-[250px] overflow-y-auto whitespace-pre-line break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400 [scrollbar-width:thin] [@media(min-width:1024px)_and_(max-height:760px)]:max-w-[180px] [@media(min-width:1024px)_and_(max-width:1400px)]:max-w-[200px]"
          }
        >
          {record.remarks}
        </div>
      </td>
      <td
        className={
          isP
            ? `${pc} text-center font-medium`
            : "border-b border-slate-100 bg-white p-4 text-center font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        }
      >
        {record.pageRange}
      </td>
      {!isP ? (
        <td className="border-b border-slate-100 bg-white p-2 text-center align-middle print:hidden dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onView?.(record)}
            disabled={isViewLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
            aria-label={`View files for record ${record.serialNo}`}
          >
            {isViewLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </td>
      ) : null}
    </tr>
  );
}

function RecordsPrintDocHeaderRow({
  title,
  branch,
  projectName,
  totalCount,
  printedAt,
}: {
  title: string;
  branch: string;
  projectName: string;
  totalCount: number;
  printedAt: string;
}) {
  return (
    <tr className="records-print-doc-header-row">
      <th colSpan={14} scope="colgroup" className="records-print-doc-header">
        <div className="text-center leading-tight text-black">
          <div className="text-[11pt] font-bold">{title}</div>
          <div className="mt-1 text-[9pt] text-slate-800">{branch}</div>
          <div className="mt-0.5 text-[9pt] font-semibold text-slate-900">
            {projectName}
          </div>
          <div className="mt-2 text-[8pt] text-slate-600">
            एकूण नोंदी: {totalCount} · मुद्रित: {printedAt}
          </div>
        </div>
      </th>
    </tr>
  );
}

export default function DashboardPage() {
  const [selectedRecord, setSelectedRecord] = useState<FileRecord | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDocumentName, setPdfDocumentName] = useState<string>("");
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  const [pdfStatusPopup, setPdfStatusPopup] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const [authChecked, setAuthChecked] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const availableColumns = DEFAULT_SEARCH_COLUMNS;
  const [searchColumns, setSearchColumns] =
    useState<string[]>([...DEFAULT_SEARCH_COLUMNS]);
  const [shelfNoFilter, setShelfNoFilter] = useState("");
  const [gatthaNoFilter, setGatthaNoFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [records, setRecords] = useState<FileRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const toggleColumn = (col: string) => {
    setSearchColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedProject, setSelectedProject] = useState(fallbackProjects[0]);
  const projectDropdownOptions =
    projectOptions.length > 0
      ? projectOptions.map((project) => ({
          label: project.name,
          value: project.name,
        }))
      : fallbackProjects.map((project) => ({ label: project, value: project }));
  const defaultProjectId =
    process.env.NEXT_PUBLIC_PROJECT_ID ??
    "9eb63058-187a-4014-9c25-bf9142d31ac2";
  const selectedProjectId =
    projectOptions.find((project) => project.name === selectedProject)?.id ??
    defaultProjectId;

  const getDocumentByRecordId = async (
    recordId: string,
  ): Promise<DocumentResponse> => {
    const response = await fetch(
      `${apiBaseUrl}/api/documents/record/${recordId}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      const error = new Error("Document fetch failed.");
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    const payload = (await response.json()) as DocumentResponse;
    if (process.env.NODE_ENV === "development") {
      console.debug("Fetched document by recordId", { recordId, payload });
    }
    return payload;
  };

  const resolveDocumentUrl = (documentPath: string): string => {
    const normalizedPath = documentPath.replace(/\\/g, "/").trim();
    if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

    const baseOrigin = new URL(apiBaseUrl).origin;
    const pathname = normalizedPath.startsWith("/")
      ? normalizedPath
      : `/${normalizedPath}`;
    return `${baseOrigin}${pathname}`;
  };

  const checkPdfAvailability = async (url: string): Promise<number | null> => {
    try {
      const response = await fetch(url, {
        method: "HEAD",
      });
      return response.status;
    } catch {
      // If CORS/network blocks pre-check, let iframe attempt rendering.
      return null;
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const authUser = localStorage.getItem("authUser");
    if (!isLoggedIn || !authUser) {
      setIsUnauthorized(true);
      return;
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchProjects = async () => {
      setIsProjectsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/api/projects`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;

        const payload: unknown = await response.json().catch(() => null);
        const parsedProjects = parseProjectsResponse(payload);
        if (isCancelled || parsedProjects.length === 0) return;

        setProjectOptions(parsedProjects);
        setSelectedProject((current) =>
          parsedProjects.some((project) => project.name === current)
            ? current
            : parsedProjects[0].name,
        );
      } catch {
        // Keep fallback static project options when API is unavailable.
      } finally {
        if (!isCancelled) setIsProjectsLoading(false);
      }
    };

    void fetchProjects();
    return () => {
      isCancelled = true;
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedProject,
    searchQuery,
    searchColumns,
    shelfNoFilter,
    gatthaNoFilter,
    classificationFilter,
  ]);

  useEffect(() => {
    let isCancelled = false;

    const fetchRecords = async () => {
      setRecordsLoading(true);
      setRecordsError(null);
      try {
        const searchFieldMap: Record<string, string> = {
          Subject: "subject",
          "File No": "fileNo",
          Remarks: "remarks",
          "Shelf No": "shelfNo",
        };
        const mappedSearchFields = searchColumns
          .map((column) => searchFieldMap[column])
          .filter(Boolean);
        const useBackendDefaultSearch =
          searchColumns.length === DEFAULT_SEARCH_COLUMNS.length &&
          DEFAULT_SEARCH_COLUMNS.every((column) =>
            searchColumns.includes(column),
          );

        const params = new URLSearchParams();
        params.set("projectId", selectedProjectId);
        params.set("page", String(Math.max(currentPage - 1, 0)));
        params.set("size", String(itemsPerPage));
        params.set("sortBy", "updatedAt");
        params.set("sortDir", "desc");
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (!useBackendDefaultSearch && mappedSearchFields.length > 0) {
          params.set("searchFields", mappedSearchFields.join(","));
        }
        if (shelfNoFilter) params.set("shelfNo", shelfNoFilter);
        if (gatthaNoFilter) params.set("gatthaNo", gatthaNoFilter);
        if (classificationFilter)
          params.set("classification", classificationFilter);

        const response = await fetch(
          `${apiBaseUrl}/api/records?${params.toString()}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch records.");
        }

        const payload: unknown = await response.json().catch(() => null);
        const parsed = parseRecordsResponse(payload);
        const content = Array.isArray(parsed.content) ? parsed.content : [];
        const serialStart = Math.max(currentPage - 1, 0) * itemsPerPage;
        const mappedRows: FileRecord[] = content.map((item, index) => ({
          id: item.id ?? `row-${serialStart + index + 1}`,
          serialNo: serialStart + index + 1,
          shelfNo: stringifyCell(item.shelfNo),
          bundleNo: stringifyCell(item.gatthaNo),
          fileNo: stringifyCell(item.fileNo),
          refNo: stringifyCell(item.collectorFileNo ?? item.legacyNo),
          subject: stringifyCell(item.subject),
          notePages: stringifyCell(item.notePages),
          correspondencePages: stringifyCell(item.correspondencePages),
          classification: stringifyCell(item.classification),
          destructionDate: stringifyCell(item.destructionDate),
          senderSignature: stringifyCell(item.senderSignature),
          receiverSignature: stringifyCell(item.receiverSignature),
          remarks: stringifyCell(item.remarks),
          pageRange: stringifyCell(item.totalPages),
        }));

        if (isCancelled) return;
        setRecords(mappedRows);
        setTotalElements(parsed.totalElements ?? 0);
        setTotalPages(parsed.totalPages ?? 0);
      } catch (error) {
        if (isCancelled) return;
        setRecords([]);
        setTotalElements(0);
        setTotalPages(0);
        setRecordsError(
          error instanceof Error ? error.message : "Unable to fetch records.",
        );
      } finally {
        if (!isCancelled) setRecordsLoading(false);
      }
    };

    if (selectedProjectId) {
      void fetchRecords();
    }

    return () => {
      isCancelled = true;
    };
  }, [
    apiBaseUrl,
    selectedProjectId,
    currentPage,
    itemsPerPage,
    searchQuery,
    searchColumns,
    shelfNoFilter,
    gatthaNoFilter,
    classificationFilter,
  ]);

  // Text constants for Marathi content
  const TEXT = {
    title: "अभिलेख कक्षात पाठवावयाची प्रकरणे",
    branch: "शाखा / विभागाचे नाव : पुनर्वसन शाखा, जिल्हाधिकारी कार्यालय पालघर",
    projectName: `प्रकरणाचे नाव: ${selectedProject}`,
  };

  const displayStart =
    totalElements === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const displayEnd = Math.min(currentPage * itemsPerPage, totalElements);
  const hasActiveSearchOrFilters =
    searchQuery.trim().length > 0 ||
    shelfNoFilter.length > 0 ||
    gatthaNoFilter.length > 0 ||
    classificationFilter.length > 0 ||
    searchColumns.length !== DEFAULT_SEARCH_COLUMNS.length ||
    DEFAULT_SEARCH_COLUMNS.some((column) => !searchColumns.includes(column));

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleResetSearchAndFilters = () => {
    setSearchQuery("");
    setSearchColumns([...DEFAULT_SEARCH_COLUMNS]);
    setShelfNoFilter("");
    setGatthaNoFilter("");
    setClassificationFilter("");
    setCurrentPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewPdf = async (record: FileRecord) => {
    const showPdfStatusPopup = (title: string, message: string) => {
      setPdfStatusPopup({ open: true, title, message });
    };

    const recordId = String(record.id ?? "").trim();
    if (!recordId) {
      showPdfStatusPopup("PDF Not Found", "PDF not found for this record.");
      return;
    }

    setViewingRecordId(recordId);
    try {
      const documentResponse = await getDocumentByRecordId(recordId);
      if (!documentResponse.documentPath) {
        showPdfStatusPopup("PDF Not Found", "PDF not found for this record.");
        return;
      }

      const resolvedPdfUrl = resolveDocumentUrl(documentResponse.documentPath);
      const pdfStatus = await checkPdfAvailability(resolvedPdfUrl);
      if (pdfStatus === 404) {
        showPdfStatusPopup("PDF Not Found", "PDF not found for this record.");
        return;
      }
      if (pdfStatus !== null && pdfStatus >= 500) {
        showPdfStatusPopup(
          "Unable to Load PDF",
          "Unable to load PDF. Please try again.",
        );
        return;
      }

      setPdfDocumentName(documentResponse.documentName || "Document.pdf");
      setPdfUrl(resolvedPdfUrl);
      setSelectedRecord(record);
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (status === 404) {
        showPdfStatusPopup("PDF Not Found", "PDF not found for this record.");
      } else {
        showPdfStatusPopup(
          "Unable to Load PDF",
          "Unable to load PDF. Please try again.",
        );
      }
      if (process.env.NODE_ENV === "development") {
        console.debug("View PDF failed", { recordId, status, error });
      }
    } finally {
      setViewingRecordId(null);
    }
  };

  const handleGoToLogin = () => {
    router.replace("/login");
  };

  if (!authChecked && !isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        Checking access...
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <Dialog open={isUnauthorized}>
          <DialogContent
            showCloseButton={false}
            className="max-w-md rounded-2xl border border-red-200/70 bg-white/95 p-0 shadow-2xl dark:border-red-900/60 dark:bg-slate-900/95"
          >
            <DialogHeader className="border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 dark:border-red-900/40 dark:from-red-950/40 dark:to-orange-950/20">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
                Access Denied
              </DialogTitle>
              <DialogDescription className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                You must login first to view this page. Please sign in to
                continue.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="px-6 py-4 sm:justify-end">
              <Button
                type="button"
                onClick={handleGoToLogin}
                className="w-full sm:w-auto"
              >
                Go to Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div
      data-print-root="dashboard"
      className="min-h-screen bg-gradient-to-br from-[#F7F7F7] via-blue-50 to-indigo-50 print:min-h-0 print:bg-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
    >
      <section
        className="sticky top-24 z-[900] -mt-6 h-14 w-full shrink-0 overflow-hidden bg-slate-900 shadow-[0_6px_16px_-4px_rgba(30,58,138,0.22)] print:hidden sm:h-16"
        aria-label="Page title banner"
      >
        <Image
          src="/Rehabilitation department logo of Palghar 1.png"
          alt=""
          fill
          priority
          className="object-cover object-[50%_35%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-900/82 via-indigo-900/72 to-slate-800/78"
          aria-hidden
        />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-center justify-center px-3 text-center sm:px-4">
          <div className="max-w-4xl space-y-0 leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            <h1 className="text-[13px] font-bold text-white sm:text-sm md:text-[0.9375rem]">
              {TEXT.title}
            </h1>
            <p className="text-[11px] font-medium text-white/90 sm:text-xs">
              {TEXT.branch}
            </p>
            <p className="text-[11px] font-semibold text-indigo-100 sm:text-xs">
              {TEXT.projectName}
            </p>
          </div>
        </div>
      </section>

      <main className="relative z-[16] mx-auto max-w-[1600px] px-3 py-12 print:py-4 print:px-4 sm:px-4">
        <div
          className="mb-6 flex flex-col gap-3 print:hidden sm:flex-row sm:items-end sm:justify-between sm:gap-4"
          style={{ zIndex: 100 }}
        >
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Project / प्रकल्प निवडा:
            </label>
            <CustomDropdown
              placeholder={
                isProjectsLoading ? "Loading projects..." : "Select Project"
              }
              options={projectDropdownOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              disabled={isProjectsLoading}
              className="w-full max-w-[350px]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handlePrint}
            className="w-full shrink-0 border-slate-300 bg-white hover:bg-slate-50 sm:w-auto dark:border-slate-600 dark:bg-white dark:hover:bg-slate-100"
          >
            <Printer className="h-4 w-4 shrink-0" aria-hidden />
            Print / Save as PDF
          </Button>
        </div>

        <div className="relative z-0 flex min-h-0 flex-col overflow-visible rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08),0_4px_16px_-4px_rgba(15,23,42,0.06)] print:rounded-none print:border-0 print:shadow-none dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.35),0_4px_24px_-6px_rgba(0,0,0,0.25)]">
          <div className="flex min-h-0 flex-1 flex-col overflow-visible border-t border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800/50">
            <div
              className="relative isolate z-[100] shrink-0 overflow-visible border-b border-slate-200 bg-white shadow-[inset_0_-1px_0_0_rgba(148,163,184,0.35)] print:hidden dark:border-slate-600 dark:bg-slate-800 dark:shadow-[inset_0_-1px_0_0_rgba(71,85,105,0.5)]"
              role="search"
            >
              <div className="relative z-[110] flex w-full max-w-full flex-wrap items-center gap-4 p-4 lg:flex-nowrap">
                <div className="flex min-h-10 w-full min-w-0 items-center gap-2 sm:gap-3 lg:w-[40%] lg:max-w-[40%] lg:shrink-0">
                  <span className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Search:
                  </span>
                  <div className="relative flex h-10 min-w-0 flex-1 overflow-visible rounded-lg border border-slate-200 bg-[#F7F7F7] transition-colors focus-within:bg-[#FAFAFA] focus-within:ring-2 focus-within:ring-slate-300 dark:border-slate-600 dark:bg-slate-900/40 dark:focus-within:bg-slate-900/60 dark:focus-within:ring-slate-500">
                    <div className="relative h-full min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full w-full rounded-l-lg border-0 bg-transparent pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-full min-w-[110px] shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-r-lg border-l border-slate-200 bg-transparent px-3 text-sm text-slate-600 transition-colors hover:bg-[#F0F0F0] focus:outline-none dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <span className="max-w-[80px] truncate">
                            {searchColumns.length === availableColumns.length
                              ? "All"
                              : `${searchColumns.length} Selected`}
                          </span>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={10}
                        className="z-[9999] w-48 rounded-md border border-slate-200 bg-[#FAFAFA] py-1 shadow-md dark:border-slate-600 dark:bg-slate-800"
                      >
                        {availableColumns.map((col) => (
                          <DropdownMenuItem
                            key={col}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleColumn(col);
                            }}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 shrink-0 transition-opacity ${searchColumns.includes(col) ? "text-slate-600 opacity-100 dark:text-slate-300" : "opacity-0"}`}
                            />
                            {col}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-3 text-left text-[14px] lg:w-0 lg:min-w-0">
                  <span className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Filters:
                  </span>
                  <CustomDropdown
                    placeholder="Select a Shelf No"
                    options={[
                      { label: "1", value: "1" },
                      { label: "2", value: "2" },
                      { label: "3", value: "3" },
                      { label: "4", value: "4" },
                    ]}
                    value={shelfNoFilter}
                    onChange={setShelfNoFilter}
                    showSearch={true}
                    className="min-w-[140px] flex-1 sm:max-w-[220px] lg:min-w-[160px] lg:max-w-none lg:flex-1"
                  />
                  <CustomDropdown
                    placeholder="Select Gattha No"
                    options={Array.from({ length: 4 }).map((_, i) => ({
                      label: `${i + 1}`,
                      value: `${i + 1}`,
                    }))}
                    value={gatthaNoFilter}
                    onChange={setGatthaNoFilter}
                    className="min-w-[140px] flex-1 sm:max-w-[200px] lg:min-w-[160px] lg:max-w-none lg:flex-1"
                  />
                  <CustomDropdown
                    placeholder="Select Information Level"
                    // (अ,ब,क,क-1, ड)
                    options={[
                      { label: "अ", value: "अ" },
                      { label: "ब", value: "ब" },
                      { label: "क", value: "क" },
                      { label: "क-1", value: "क-1" },
                      { label: "ड", value: "ड" },
                    ]}
                    value={classificationFilter}
                    onChange={setClassificationFilter}
                    className="min-w-[140px] flex-1 sm:max-w-[200px] lg:min-w-[160px] lg:max-w-none lg:flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetSearchAndFilters}
                    disabled={!hasActiveSearchOrFilters || recordsLoading}
                    className="h-10 min-w-[110px] shrink-0 border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-500"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative z-0 max-h-[min(600px,70dvh)] min-h-0 flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:thin] print:hidden">
              <table className="records-table w-max min-w-full border-separate border-spacing-0 bg-slate-200 text-sm dark:bg-slate-700 [@media(min-width:1024px)_and_(max-height:760px)]:text-[13px] [@media(min-width:1024px)_and_(max-height:760px)]:[&_tbody_td]:!p-2 [@media(min-width:1024px)_and_(max-height:760px)]:[&_thead_th]:!px-2 [@media(min-width:1024px)_and_(max-height:760px)]:[&_thead_th]:!py-2">
                <thead className="sticky top-0 z-[12] bg-slate-200 dark:bg-slate-700">
                  <RecordsTableHeaderRows variant="screen" />
                </thead>
                <tbody>
                  {recordsLoading ? (
                    <tr>
                      <td
                        colSpan={14}
                        className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : recordsError ? (
                    <tr>
                      <td
                        colSpan={14}
                        className="px-3 py-6 text-center text-sm text-red-600 dark:text-red-400"
                      >
                        {recordsError}
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={14}
                        className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        No records found for selected filters.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <RecordsDataRow
                        key={record.id}
                        record={record}
                        variant="screen"
                        isViewLoading={viewingRecordId === String(record.id)}
                        onView={handleViewPdf}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="hidden print:block">
              <table className="records-print-table">
                <thead>
                  <RecordsPrintDocHeaderRow
                    title={TEXT.title}
                    branch={TEXT.branch}
                    projectName={TEXT.projectName}
                    totalCount={totalElements}
                    printedAt={new Date().toLocaleString("mr-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  />
                  <RecordsTableHeaderRows variant="print" />
                </thead>
                <tbody>
                  {records.map((record) => (
                    <RecordsDataRow
                      key={`print-${record.id}`}
                      record={record}
                      variant="print"
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-slate-200 bg-gradient-to-r from-[#F7F7F7] to-[#F0F0F0] px-6 py-4 print:hidden dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 sm:flex-row [@media(min-width:1024px)_and_(max-height:760px)]:gap-2 [@media(min-width:1024px)_and_(max-height:760px)]:px-4 [@media(min-width:1024px)_and_(max-height:760px)]:py-2.5">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-medium">{displayStart}</span> to{" "}
                  <span className="font-medium">{displayEnd}</span> of{" "}
                  <span className="font-medium">{totalElements}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Items per page:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    className="w-20 rounded-md border border-slate-300 bg-[#FAFAFA] px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {[5, 10, 20, 50].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || recordsLoading}
                  className="border-slate-300 dark:border-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={recordsLoading}
                      className={
                        currentPage === page
                          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                          : "border-slate-300 dark:border-slate-600"
                      }
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={
                    currentPage === totalPages ||
                    totalPages === 0 ||
                    recordsLoading
                  }
                  className="border-slate-300 dark:border-slate-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Dialog
        open={pdfStatusPopup.open}
        onOpenChange={(nextOpen) =>
          setPdfStatusPopup((prev) => ({ ...prev, open: nextOpen }))
        }
      >
        <DialogContent className="max-w-md rounded-2xl border border-amber-200/70 bg-white p-0 shadow-2xl dark:border-amber-900/60 dark:bg-slate-900">
          <DialogHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 dark:border-amber-900/40 dark:from-amber-950/35 dark:to-orange-950/20">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/45 dark:text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl text-slate-900 dark:text-slate-100">
              {pdfStatusPopup.title || "Notice"}
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {pdfStatusPopup.message || "Something went wrong."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 py-4 sm:justify-end">
            <Button
              type="button"
              onClick={() =>
                setPdfStatusPopup({ open: false, title: "", message: "" })
              }
              className="w-full sm:w-auto"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PdfViewer
        isOpen={!!selectedRecord}
        pdfUrl={pdfUrl || ""}
        documentName={pdfDocumentName}
        selectedProject={selectedProject}
        rowData={selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
          setPdfUrl(null);
          setPdfDocumentName("");
        }}
      />
    </div>
  );
}
