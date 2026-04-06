'use client';

const MarathiTable = ({ data = [] }: { data?: any[] }) => {
  return (
    <div className="w-full border border-black font-serif">

      {/* ================= HEADER ================= */}
      <div className="text-center leading-tight print:text-[12px]">
        <div className="text-[14px] font-semibold py-1 border-b border-black">
          अभिलेख कक्षात पाठवावयाची प्रकरणे
        </div>
        <div className="text-[13px] py-1 border-b border-black">
          शाखा / विभागाचे नाव : पुनर्वसन शाखा, जिल्हाधिकारी कार्यालय पालघर
        </div>
        <div className="text-[13px] py-1 border-b border-black">
          प्रकरणाचे नाव: तारापूर अणुऊर्जा प्रकल्प ३ & ४
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="w-full overflow-auto">
        <table className="min-w-325 w-full border-collapse table-fixed text-[13px] print:text-[11px]">

          {/* ✅ COLUMN WIDTHS */}
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "22%" }} />

            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />

            <col style={{ width: "8%" }} />
            <col style={{ width: "10%" }} />

            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />

            <col style={{ width: "12%" }} />
            <col style={{ width: "4%" }} />
          </colgroup>

          {/* ================= HEADER ================= */}
          <thead className="bg-gray-200 text-center">
            <tr>
              <th rowSpan={2} className="border border-black p-1">अ.क्र</th>
              <th rowSpan={2} className="border border-black p-1">शेल्फ क्र.</th>
              <th rowSpan={2} className="border border-black p-1">गठ्ठा क्र.</th>

              <th rowSpan={2} className="border border-black p-1">नस्ती क्रमांक</th>
              <th rowSpan={2} className="border border-black p-1">जिल्हाधिकारी ठाणे यांचे संदर्भ क्र.</th>
              <th rowSpan={2} className="border border-black p-1">विषय</th>

              <th colSpan={2} className="border border-black p-1">नस्ती बंद करताना त्यामागील पृष्ठ</th>

              <th rowSpan={2} className="border border-black p-1">माहितीचे वर्गीकरण</th>

              <th rowSpan={2} className="border border-black p-1">नस्ती नष्ट करण्याचा दिनांक</th>

              <th colSpan={2} className="border border-black p-1">व्यक्तीची सही</th>

              <th rowSpan={2} className="border border-black p-1">शेरा</th>
              <th rowSpan={2} className="border border-black p-1">पृष्ठ क्र.</th>
            </tr>

            <tr>
              <th className="border border-black p-1">टिप्पणी भाग</th>
              <th className="border border-black p-1">पत्रव्यवहार भाग</th>

              <th className="border border-black p-1">पाठविणाऱ्याची</th>
              <th className="border border-black p-1">स्वीकारणाऱ्याची</th>
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center p-2 border border-black">No Data Found</td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index} style={{ pageBreakInside: 'avoid' }}>
                  <td className="border border-black p-1 text-center">{row.serial}</td>
                  <td className="border border-black p-1 text-center">{row.shelfNo || '-'}</td>
                  <td className="border border-black p-1 text-center">{row.bundleNo || '-'}</td>
                  <td className="border border-black p-1 text-center">{row.nastiNumber}</td>
                  <td className="border border-black p-1 text-center">{row.refNumber}</td>
                  <td className="border border-black p-1 whitespace-pre-wrap wrap-break-word">{row.subject}</td>

                  <td className="border border-black p-1 text-center">{row.commentPart}</td>
                  <td className="border border-black p-1 text-center">{row.correspondencePart}</td>

                  <td className="border border-black p-1 text-center">{row.classification}</td>
                  <td className="border border-black p-1 text-center">{row.statusDate}</td>

                  <td className="border border-black p-1 text-center">{row.sentBy}</td>
                  <td className="border border-black p-1 text-center">{row.acceptedBy}</td>

                  <td className="border border-black p-1 whitespace-pre-wrap wrap-break-word">{row.remarks}</td>
                  <td className="border border-black p-1 text-center">{row.pageNumber}</td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default MarathiTable;