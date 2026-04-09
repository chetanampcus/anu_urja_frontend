"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "../component/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../component/dropdown-menu"
import CustomDropdown from "../component/CustomDropdown"

// Replaced SearchableFilter with CustomDropdown

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
  const [department, setDepartment] = useState("");

  const toggleColumn = (col: string) => {
    setSearchColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const availableProjects = [
    "तारापूर अणुऊर्जा प्रकल्प ३ & ४",
    "सुर्या प्रकल्प",
  ];
  const [selectedProject, setSelectedProject] = useState(availableProjects[0]);

  // Text constants for Marathi content
  const TEXT = {
    title: "अभिलेख कक्षात पाठवावयाची प्रकरणे",
    branch: "शाखा / विभागाचे नाव : पुनर्वसन शाखा, जिल्हाधिकारी कार्यालय पालघर",
    projectName: `प्रकरणाचे नाव: ${selectedProject}`,
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
    <div className="min-h-screen bg-gradient-to-br from-[#F7F7F7] via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <section
        className="sticky top-24 z-[900] -mt-6 h-14 w-full shrink-0 overflow-hidden bg-slate-900 shadow-[0_6px_16px_-4px_rgba(30,58,138,0.22)] sm:h-16"
        aria-label="Page title banner"
      >
        <Image
          src="/gov.png"
          alt=""
          fill
          priority
          className="object-cover object-[50%_35%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/82 via-indigo-900/72 to-slate-800/78" aria-hidden />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-center justify-center px-3 text-center sm:px-4">
          <div className="max-w-4xl space-y-0 leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            <h1 className="text-[13px] font-bold text-white sm:text-sm md:text-[0.9375rem]">{TEXT.title}</h1>
            <p className="text-[11px] font-medium text-white/90 sm:text-xs">{TEXT.branch}</p>
            <p className="text-[11px] font-semibold text-indigo-100 sm:text-xs">{TEXT.projectName}</p>
          </div>
        </div>
      </section>

      <main className="relative z-[16] mx-auto max-w-[1600px] px-3 py-12 sm:px-4">
        <div className="mb-6" style={{ zIndex: 100 }}>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Select Project / प्रकल्प निवडा:
          </label>
          <CustomDropdown
            placeholder="Select Project"
            options={availableProjects.map((p) => ({ label: p, value: p }))}
            value={selectedProject}
            onChange={setSelectedProject}
            className="w-full max-w-[350px]"
          />
        </div>

        <div className="relative z-[60] mb-6 rounded-xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/80">
          <div className="flex w-full flex-wrap items-center gap-4 p-4 lg:flex-nowrap">
              {/* Search ~20% narrower than an even split; filters use the rest */}
              <div className="flex min-h-10 w-full min-w-0 items-center gap-2 sm:gap-3 lg:w-[40%] lg:max-w-[40%] lg:shrink-0">
              <span className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">Search:</span>
              <div className="flex h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#F7F7F7] transition-colors focus-within:bg-[#FAFAFA] focus-within:ring-2 focus-within:ring-slate-300 dark:border-slate-600 dark:bg-slate-900/40 dark:focus-within:bg-slate-900/60 dark:focus-within:ring-slate-500 relative overflow-visible">
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
                    <button className="flex items-center justify-between gap-1.5 px-3 h-full border-l border-slate-200 hover:bg-[#F0F0F0] transition-colors focus:outline-none shrink-0 bg-transparent cursor-pointer rounded-r-lg text-sm text-slate-600 min-w-[110px]">
                      <span className="truncate max-w-[80px]">
                        {searchColumns.length === availableColumns.length ? "All" : `${searchColumns.length} Selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-[999] bg-[#FAFAFA] border border-slate-200 shadow-md rounded-md py-1">
                    {availableColumns.map(col => (
                      <DropdownMenuItem
                        key={col}
                        onClick={(e) => {
                          e.preventDefault()
                          toggleColumn(col)
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 shrink-0 transition-opacity ${searchColumns.includes(col) ? "opacity-100 text-slate-600" : "opacity-0"}`} />
                        {col}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>

              <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-3 text-left text-[14px] lg:w-0 lg:min-w-0">
                <span className="shrink-0 text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</span>

                <CustomDropdown
                  placeholder="Select a Shelf No"
                  options={[
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                  ]}
                  value={department}
                  onChange={(val) => setDepartment(val)}
                  showSearch={true}
                  className="min-w-[140px] flex-1 sm:max-w-[220px] lg:min-w-[160px] lg:max-w-none lg:flex-1"
                />

                {/* Set Priority */}
                <CustomDropdown
                  placeholder="Select Gattha No"
                  options={Array.from({ length: 4 }).map((_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }))}
                  value=""
                  onChange={() => {}}
                  className="min-w-[140px] flex-1 sm:max-w-[200px] lg:min-w-[160px] lg:max-w-none lg:flex-1"
                />

                <CustomDropdown
                  placeholder="Select Priority"
                  options={[
                    { label: "High", value: "High" },
                    { label: "Medium", value: "Medium" },
                    { label: "Low", value: "Low" }
                  ]}
                  value=""
                  onChange={() => {}}
                  className="min-w-[140px] flex-1 sm:max-w-[200px] lg:min-w-[160px] lg:max-w-none lg:flex-1"
                />

              </div>
            </div>
        </div>

        <div className="relative z-0 flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex min-h-0 flex-1 flex-col border-t border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800/50">
            <div className="max-h-[min(600px,70dvh)] flex-1 overflow-x-auto overflow-y-auto [scrollbar-width:thin]">
              <table className="records-table w-max min-w-full border-separate border-spacing-0 bg-slate-200 text-sm dark:bg-slate-700 [@media(min-width:1024px)_and_(max-height:760px)]:text-[13px] [@media(min-width:1024px)_and_(max-height:760px)]:[&_tbody_td]:!p-2 [@media(min-width:1024px)_and_(max-height:760px)]:[&_thead_th]:!px-2 [@media(min-width:1024px)_and_(max-height:760px)]:[&_thead_th]:!py-2">
                <thead className="sticky top-0 z-[12] bg-slate-200 dark:bg-slate-700">
                  <tr className="text-[0.8125rem] font-bold uppercase leading-none tracking-wide text-slate-900 sm:text-sm dark:text-slate-100">
                    <th className="sticky left-0 top-auto z-[18] box-border min-h-[3.5rem] min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b-0 border-l border-r border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      अ.क्र
                    </th>
                    <th className="sticky left-[4.5rem] top-auto z-[18] box-border min-h-[3.5rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-b-0 border-r border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      शेल्फ क्र.
                    </th>
                    <th className="sticky left-[9.5rem] top-auto z-[18] box-border min-h-[3.5rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-b-0 border-r border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      गट्टा क्र.
                    </th>
                    <th className="min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      नस्ती क्रमांक
                    </th>
                    <th className="min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      संचिका क्र.
                    </th>
                    <th className="min-h-[3.5rem] min-w-[280px] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-left align-middle dark:border-slate-500 dark:bg-slate-700 [@media(min-width:1024px)_and_(max-height:760px)]:min-w-[140px] [@media(min-width:1024px)_and_(max-width:1400px)]:min-w-[160px]">
                      विषय
                    </th>
                    <th colSpan={2} className="min-h-[3.5rem] border-b-0 border-x border-slate-300 bg-slate-300 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-600">
                      नस्ती बंद करताना त्यामधील पृष्ठ
                    </th>
                    <th className="min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      माहितीचे वर्गीकरण
                    </th>
                    <th className="min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      नस्ती नष्ट करण्याचा दिनांक
                    </th>
                    <th colSpan={2} className="min-h-[3.5rem] border-b-0 border-x border-slate-300 bg-slate-300 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-600">
                      व्यक्तीची सही
                    </th>
                    <th className="min-h-[3.5rem] min-w-[200px] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-left align-middle dark:border-slate-500 dark:bg-slate-700 [@media(min-width:1024px)_and_(max-height:760px)]:min-w-[120px] [@media(min-width:1024px)_and_(max-width:1400px)]:min-w-[140px]">
                      शेरा
                    </th>
                    <th className="min-h-[3.5rem] border-b-0 border-slate-300 bg-slate-200 py-3.5 px-3 text-center align-middle whitespace-nowrap dark:border-slate-500 dark:bg-slate-700">
                      पृष्ठ क्र.
                    </th>
                  </tr>
                  <tr className="text-xs font-bold uppercase leading-none tracking-wide text-slate-800 sm:text-[0.8125rem] dark:text-slate-200">
                    <th className="sticky left-0 top-auto z-[18] box-border min-h-[3rem] min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b border-l border-r border-t border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="sticky left-[4.5rem] top-auto z-[18] box-border min-h-[3rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-t border-b border-r border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="sticky left-[9.5rem] top-auto z-[18] box-border min-h-[3rem] min-w-[5rem] w-[5rem] max-w-[5rem] border-t border-b border-r border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-l border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500">
                      टिपणी भाग
                    </th>
                    <th className="min-h-[3rem] border-t border-b border-r border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500">
                      पत्रव्यवहार भाग
                    </th>
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-l border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500">
                      पाठविणा-या
                    </th>
                    <th className="min-h-[3rem] border-t border-b border-r border-slate-300 bg-slate-400 py-3 px-3 text-center dark:border-slate-500 dark:bg-slate-500">
                      स्वीकारणा-याची
                    </th>
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                    <th className="min-h-[3rem] border-t border-b border-slate-300 bg-slate-300 py-3 px-3 dark:border-slate-500 dark:bg-slate-600" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((record) => (
                    <tr key={record.id} className="group bg-white transition-colors duration-200 dark:bg-slate-800 [&_td]:align-top">
                      <td className="sticky left-0 z-[10] box-border min-w-[4.5rem] w-[4.5rem] max-w-[4.5rem] border-b border-l border-r border-slate-200 bg-white p-4 text-center font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {record.serialNo}
                      </td>
                      <td className="sticky left-[4.5rem] z-[10] box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-white p-4 text-center text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {record.shelfNo || "-"}
                      </td>
                      <td className="sticky left-[9.5rem] z-[10] box-border min-w-[5rem] w-[5rem] max-w-[5rem] border-b border-r border-slate-200 bg-white p-4 text-center text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {record.bundleNo || "-"}
                      </td>
                      <td className="border-b border-slate-100 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
                        <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F0F0F0] px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {record.refNo || "-"}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {record.fileNo || "-"}
                      </td>
                      <td className="border-b border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                        <div className="max-h-24 max-w-[300px] overflow-y-auto whitespace-pre-line break-words font-medium leading-relaxed text-slate-700 dark:text-slate-300 [scrollbar-width:thin] [@media(min-width:1024px)_and_(max-height:760px)]:max-w-[200px] [@media(min-width:1024px)_and_(max-width:1400px)]:max-w-[220px]">
                          {record.subject}
                        </div>
                      </td>
                      <td className="border-b border-l border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{record.notePages}</td>
                      <td className="border-b border-r border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{record.correspondencePages}</td>
                      <td className="border-b border-slate-100 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${record.classification === "अ" ? "border border-amber-200 bg-amber-100 text-amber-700" : record.classification === "ब" ? "border border-blue-200 bg-blue-100 text-slate-600" : "border border-slate-200 bg-[#F0F0F0] text-slate-700"}`}
                        >
                          {record.classification}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        {record.destructionDate === "कायम" ? (
                          <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{record.destructionDate}</span>
                        ) : (
                          record.destructionDate
                        )}
                      </td>
                      <td className="border-b border-l border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{record.senderSignature || "-"}</td>
                      <td className="border-b border-r border-slate-100 bg-white p-4 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{record.receiverSignature || "-"}</td>
                      <td className="border-b border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                        <div className="max-h-20 max-w-[250px] overflow-y-auto whitespace-pre-line break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400 [scrollbar-width:thin] [@media(min-width:1024px)_and_(max-height:760px)]:max-w-[180px] [@media(min-width:1024px)_and_(max-width:1400px)]:max-w-[200px]">
                          {record.remarks}
                        </div>
                      </td>
                      <td className="border-b border-slate-100 bg-white p-4 text-center font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{record.pageRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-slate-200 bg-gradient-to-r from-[#F7F7F7] to-[#F0F0F0] px-6 py-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800 sm:flex-row [@media(min-width:1024px)_and_(max-height:760px)]:gap-2 [@media(min-width:1024px)_and_(max-height:760px)]:px-4 [@media(min-width:1024px)_and_(max-height:760px)]:py-2.5">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{" "}
                  <span className="font-medium">{filteredData.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-slate-300 dark:border-slate-600"
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
                        : "border-slate-300 dark:border-slate-600"
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
    </div>
  )
}
