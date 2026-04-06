"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, Eye, FileText, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "../component/button"
import { Input } from "../component/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../component/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../component/table"
import { Badge } from "../component/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../component/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../component/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../component/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../component/command"

function SearchableFilter({ placeholder, options, className }: { placeholder: string; options: string[], className?: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={`flex h-10 min-w-0 rounded-md bg-slate-50 border border-slate-200 hover:bg-white transition-colors cursor-pointer items-center justify-between px-3 text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-slate-300 data-[state=open]:bg-white data-[state=open]:ring-2 data-[state=open]:ring-slate-300 data-[state=open]:border-slate-300 ${className || "flex-1"}`}>
          <span className="flex-1 tracking-[0.01em] leading-5 truncate text-left">
            {value ? value : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 z-[999] bg-white border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden" align="start">
        <Command className="bg-white">
          <div className="border-b border-slate-100">
            <CommandInput placeholder="Search..." className="h-10 bg-transparent" />
          </div>
          <CommandList className="bg-white p-1.5">
            <CommandEmpty className="py-4 text-center text-sm text-slate-500">No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    setValue(currentValue === option.toLowerCase() ? "" : option)
                    setOpen(false)
                  }}
                  className="rounded-lg py-2 cursor-pointer flex justify-center text-slate-700 aria-selected:bg-slate-100 data-[selected=true]:bg-slate-100 hover:bg-slate-100 transition-colors mb-0.5 last:mb-0"
                >
                  <span className="truncate font-medium">{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface FileRecord {
  id: number
  serialNo: number
  shelfNo: string
  bundleNo: string
  fileNo: string
  refNo: string
  subject: string
  notePages: string
  correspondencePages: string
  classification: string
  destructionDate: string
  senderSignature: string
  receiverSignature: string
  remarks: string
  pageRange: string
}

const sampleData: FileRecord[] = [
  {
    id: 1,
    serialNo: 1,
    shelfNo: "",
    bundleNo: "-",
    fileNo: "40 (3) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 655",
  },
  {
    id: 2,
    serialNo: 2,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (2) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 505",
  },
  {
    id: 3,
    serialNo: 3,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "-",
    refNo: "-",
    subject: "मौजे अक्करपट्टी व पोफरण येथील प्रकल्पाग्रस्तांसाठी कौशल्य विकास कार्यक्रमांतर्गत CSR FUND उपलब्ध करुन देणेबाबत.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "मौजे अक्करपट्टी व पोफरण येथील प्रकल्पाग्रस्तांसाठी कौशल्य विकास कार्यक्रमांतर्गत CSR FUND उपलब्ध करुन देणेबाबत संचिका असल्याने कायमस्वरुपी ठेवण्यात येते.",
    pageRange: "1 ते 183",
  },
  {
    id: 4,
    serialNo: 4,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (1) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी घरबांधणी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर, जि. ठाणे येथील खालीलप्राणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी घरबांधणी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर, जि. ठाणे येथील खालीलप्राणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असल्याने संचिका कायमस्वरुपी ठेवण्यात येते.",
    pageRange: "1 ते 307",
  },
  {
    id: 5,
    serialNo: 5,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "-",
    refNo: "-",
    subject: `तारापुर अणुउर्जा प्रकल्प टप्पा क्र. 3 व 4
---------------------------------------------------
1) मौजे अक्करपट्टी व पोफरण येथील प्रकल्पग्रस्तांच्या नोकरी व त्यांचे मुलांना शाळा प्रवेशाबाबत.
2) आर टी ई नुसार दिलेल्या प्रवेशाबाबत.`,
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: `1) मौजे अक्करपट्टी व पोफरण येथील प्रकल्पग्रस्तांच्या नोकरी व त्यांचे मुलांना शाळा प्रवेशाबाबत व
2) आर टी ई नुसार दिलेल्या प्रवेशाबाबत माहिती असल्याने संचिका कायमस्वरुपी ठेवण्यात येते.`,
    pageRange: "",
  },
  {
    id: 6,
    serialNo: 6,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "9 अ",
    refNo: "-",
    subject: "मौजे अक्करपट्टी संयुक्त मोजणी पत्रक गावठाण घरांचे मो.र.नं. 91",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "मौजे अक्करपट्टी संयुक्त मोजणी पत्रक गावठाण घरांचे मो.र.नं. 91 असल्याने संचिका कायमस्वरुपी ठेवण्यात येते.",
    pageRange: "1 ते 505",
  },
  {
    id: 7,
    serialNo: 7,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (7) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 713",
  },
  {
    id: 8,
    serialNo: 8,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (4) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 433",
  },
  {
    id: 9,
    serialNo: 9,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (5) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 501",
  },
  {
    id: 10,
    serialNo: 10,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (8) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 775",
  },
  {
    id: 11,
    serialNo: 11,
    shelfNo: "-",
    bundleNo: "-",
    fileNo: "40 (6) अ",
    refNo: "-",
    subject: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे असून निवासी वापरास सुयोग्य आहे.",
    notePages: "-",
    correspondencePages: "-",
    classification: "अ",
    destructionDate: "कायम",
    senderSignature: "",
    receiverSignature: "",
    remarks: "अक्करपट्टी व पोफरणसाठी प्रकल्पांतर्गत (नवीन गावठाण) ता. पालघर जि. ठाणे येथील खालीलप्रमाणे दिलेले प्लॉट मध्ये बांधण्यात आलेले घर निर्धारित मानकाप्रमाणे संचिका असल्याने कायमस्वरुपी ठेवण्यात येत आहे.",
    pageRange: "1 ते 943",
  }
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const availableColumns = ["Subject", "File No", "Remarks", "Shelf No"]
  const [searchColumns, setSearchColumns] = useState<string[]>(availableColumns)

  const toggleColumn = (col: string) => {
    setSearchColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null)
  const totalRecords = 8

  // Text constants for Marathi content
  const TEXT = {
    title: "अभिलेख कक्षात पाठवावयाची प्रकरणे",
    branch: "शाखा / विभागाचे नाव : पुनर्वसन शाखा, जिल्हाधिकारी कार्यालय पालघर",
    projectName: "प्रकरणाचे नाव: तारापूर अणुऊर्जा प्रकल्प ३ & ४",
  }

  const filteredData = sampleData.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (searchColumns.includes("Subject") && record.subject.toLowerCase().includes(query)) return true;
    if (searchColumns.includes("File No") && record.fileNo.toLowerCase().includes(query)) return true;
    if (searchColumns.includes("Remarks") && record.remarks.toLowerCase().includes(query)) return true;
    if (searchColumns.includes("Shelf No") && record.shelfNo.toLowerCase().includes(query)) return true;

    return false;
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-800">{TEXT.title}</h1>
              <p className="text-xs text-slate-500">Document Management System</p>
            </div>
          </div>

        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Title Card */}
        <Card className="mb-6 border border-indigo-200/50 bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-950 shadow-md shadow-indigo-100/40">
          <CardContent className="py-3">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">{TEXT.title}</h2>
              <p className="text-indigo-800/80 text-sm font-medium leading-tight mb-0.5">{TEXT.branch}</p>
              <p className="text-indigo-800/80 text-sm font-medium leading-tight">{TEXT.projectName}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-0 shadow-xl bg-white">
          <CardContent className="p-0">
            {/* Search + Filter Wrapper */}
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap p-4 w-full">

              {/* Search */}
              <div className="flex flex-1 w-full shrink h-10 rounded-lg border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-300 overflow-visible transition-colors">
                <div className="relative flex-1 h-full min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full pl-9 pr-3 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-500 rounded-l-lg"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-between gap-1.5 px-3 h-full border-l border-slate-200 hover:bg-slate-100 transition-colors focus:outline-none shrink-0 bg-transparent cursor-pointer rounded-r-lg text-sm text-slate-600 min-w-[110px]">
                      <span className="truncate max-w-[80px]">
                        {searchColumns.length === availableColumns.length ? "All" : `${searchColumns.length} Selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-[999] bg-white border border-slate-200 shadow-md rounded-md py-1">
                    {availableColumns.map(col => (
                      <DropdownMenuItem
                        key={col}
                        onClick={(e) => {
                          e.preventDefault()
                          toggleColumn(col)
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 shrink-0 transition-opacity ${searchColumns.includes(col) ? "opacity-100 text-indigo-600" : "opacity-0"}`} />
                        {col}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 shrink-0 text-left text-[14px]">

                {/* Department */}
                <SearchableFilter
                  placeholder="Select Shelf No"
                  options={["1", "2", "3", "4"]}
                  className="w-[180px]"
                />

                {/* Set Priority */}
                <SearchableFilter
                  placeholder="Select Gattha No "
                  options={["a-1", "a-2", "b-3", "d-4"]}
                  className="w-[150px]"
                />

                {/* Type */}
                <SearchableFilter
                  placeholder="Select Mahitiche Vargikaran"
                  options={["a", "b", "c", "d"]}
                  className="w-[140px]"
                />

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-0">

            {/* Table Section */}
            {/* Table Section */}
            <div className="mt-4 border-t border-slate-100 bg-slate-50/30">

              {/* SCROLL AREA */}
              <div className="max-h-[600px] overflow-auto relative custom-scrollbar rounded-b-xl">
                <table className="w-full border-collapse text-sm">

                  {/* HEADER */}
                  <thead className="sticky top-0 z-[100] bg-gradient-to-r from-blue-50/95 to-indigo-50/95 backdrop-blur-md shadow-sm border-b border-indigo-100 will-change-transform translate-y-[-1px]">
                    {/* ROW 1 */}
                    <tr className="text-indigo-950 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4 align-middle whitespace-nowrap text-center">अ.क्र</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">शेल्फ क्र.</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">गट्टा क्र.</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">नस्ती क्रमांक</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">संदर्भ क्र.</th>
                      <th className="p-4 align-middle min-w-[280px] text-left">विषय</th>

                      <th colSpan={2} className="p-4 align-middle text-center border-x border-indigo-100/50 bg-indigo-100/30">
                        नस्ती बंद करताना त्यामागील पृष्ठ
                      </th>

                      <th className="p-4 align-middle whitespace-nowrap text-center">माहितीचे वर्गीकरण</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">नस्ती नष्ट करण्याचा दिनांक</th>

                      <th colSpan={2} className="p-4 align-middle text-center border-x border-indigo-100/50 bg-indigo-100/30">
                        व्यक्तीची सही
                      </th>

                      <th className="p-4 align-middle min-w-[200px] text-left">शेरा</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">पृष्ठ क्र.</th>
                      <th className="p-4 align-middle whitespace-nowrap text-center">View</th>
                    </tr>

                    {/* ROW 2 */}
                    <tr className="text-indigo-800 text-[11px] uppercase tracking-wider bg-indigo-100/20 border-t border-indigo-100/60">
                      {Array(6).fill(0).map((_, i) => (
                        <th key={i} className="p-2"></th>
                      ))}

                      <th className="p-2 text-center border-l bg-indigo-100/30 border-indigo-100/50">टिप्पणी भाग</th>
                      <th className="p-2 text-center border-r bg-indigo-100/30 border-indigo-100/50">पत्रव्यवहार भाग</th>

                      <th className="p-2"></th>
                      <th className="p-2"></th>

                      <th className="p-2 text-center border-l bg-indigo-100/30 border-indigo-100/50">पाठविणा-या</th>
                      <th className="p-2 text-center border-r bg-indigo-100/30 border-indigo-100/50">स्वीकारणा-याची</th>

                      <th className="p-2"></th>
                      <th className="p-2"></th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((record) => (
                      <tr
                        key={record.id}
                        className="group bg-white hover:bg-indigo-50/40 transition-colors duration-200"
                      >
                        <td className="p-4 text-center font-medium text-slate-700">{record.serialNo}</td>
                        <td className="p-4 text-center text-slate-600">{record.shelfNo || '-'}</td>
                        <td className="p-4 text-center text-slate-600">{record.bundleNo || '-'}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                            {record.fileNo || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-600">{record.refNo || '-'}</td>

                        <td className="p-4">
                          <div className="whitespace-pre-line break-words max-w-[300px] text-slate-700 leading-relaxed font-medium">
                            {record.subject}
                          </div>
                        </td>

                        <td className="p-4 text-center text-slate-600 border-l border-slate-50 group-hover:border-indigo-50/50">{record.notePages}</td>
                        <td className="p-4 text-center text-slate-600 border-r border-slate-50 group-hover:border-indigo-50/50">{record.correspondencePages}</td>

                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${record.classification === 'अ' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            record.classification === 'ब' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                            {record.classification}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-600">
                          {record.destructionDate === 'कायम' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                              {record.destructionDate}
                            </span>
                          ) : (
                            record.destructionDate
                          )}
                        </td>

                        <td className="p-4 text-center text-slate-600 border-l border-slate-50 group-hover:border-indigo-50/50">{record.senderSignature || '-'}</td>
                        <td className="p-4 text-center text-slate-600 border-r border-slate-50 group-hover:border-indigo-50/50">{record.receiverSignature || '-'}</td>

                        <td className="p-4">
                          <div className="whitespace-pre-line break-words max-w-[250px] text-slate-500 text-xs leading-relaxed">
                            {record.remarks}
                          </div>
                        </td>

                        <td className="p-4 text-center font-medium text-slate-700">{record.pageRange}</td>

                        <td className="p-4 text-center">
                          <button className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all font-medium text-sm group/btn">
                            <Eye className="w-4 h-4 mr-1.5 text-slate-400 group-hover/btn:text-indigo-600 transition-colors" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

          </CardContent>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
                <span className="font-medium">{filteredData.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Items per page:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-20 justify-between border-slate-300 bg-white"
                    >
                      {itemsPerPage}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-20 z-[999] bg-white border border-slate-200 shadow-md rounded-md">
                    {[5, 10, 20, 50].map((value) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => handleItemsPerPageChange(value)}
                        className={itemsPerPage === value ? "bg-indigo-50 text-indigo-700" : ""}
                      >
                        {value}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
                      : "border-slate-300"
                  }
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-slate-300"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
