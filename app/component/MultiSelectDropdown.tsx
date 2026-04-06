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

        <div className="flex text-[13px] border-b border-black">
          <div className="w-1/2 border-r border-black py-1 text-left pl-2">
            शेल्फ क्र. - १
          </div>
          <div className="w-1/2 py-1 text-left pl-2">
            गठ्ठा क्र. - २
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-300 w-full border-collapse table-auto text-[13px] print:text-[11px]">

          {/* ================= HEADER ================= */}
          <thead className="bg-gray-200 text-center">

            <tr>
              <th rowSpan={2} className="border border-black p-1 w-12.5">अ.क्र</th>
              <th rowSpan={2} className="border border-black p-1 w-30">नस्ती क्रमांक</th>
              <th rowSpan={2} className="border border-black p-1 w-40">
                जिल्हाधिकारी ठाणे यांचे संदर्भ क्र.
              </th>
              <th rowSpan={2} className="border border-black p-1 w-75">विषय</th>

              <th colSpan={3} className="border border-black p-1">
                नस्ती बंद करताना त्यामागील पृष्ठ
              </th>

              <th rowSpan={2} className="border border-black p-1 w-35">
                माहितीचे वर्गीकरण (अ,ब,क, क-१, ड)
              </th>

              <th rowSpan={2} className="border border-black p-1 w-35">
                नस्ती नष्ट करण्याचा दिनांक
              </th>

              <th colSpan={2} className="border border-black p-1">
                व्यक्तीची सही
              </th>

              <th rowSpan={2} className="border border-black p-1 w-50">शेरा</th>
              <th rowSpan={2} className="border border-black p-1 w-25">पृष्ठ क्र.</th>

              {/* 👁 Eye Column */}
              <th rowSpan={2} className="border border-black p-1 w-17.5">
                पहा
              </th>
            </tr>

            <tr>
              <th className="border border-black p-1 w-20">टिप्पणी भाग</th>
              <th className="border border-black p-1 w-25">पत्रव्यवहार भाग</th>
              <th className="border border-black p-1 w-20">अ.ब.क. क-९, ड</th>

              <th className="border border-black p-1 w-30">पाठविणाऱ्याची</th>
              <th className="border border-black p-1 w-30">स्वीकारणाऱ्याची</th>
            </tr>

          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center p-2 border border-black">
                  No Data Found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index}>

                  <td className="border border-black p-1 text-center">{row.serial}</td>
                  <td className="border border-black p-1 text-center">{row.nastiNumber}</td>
                  <td className="border border-black p-1 text-center">{row.refNumber}</td>

                  <td className="border border-black p-1 whitespace-pre-wrap wrap-break-word">
                    {row.subject}
                  </td>

                  <td className="border border-black p-1 text-center">{row.commentPart}</td>
                  <td className="border border-black p-1 text-center">{row.correspondencePart}</td>
                  <td className="border border-black p-1 text-center">{row.infoCode}</td>

                  <td className="border border-black p-1 text-center">{row.classification}</td>

                  <td className="border border-black p-1 text-center">{row.statusDate}</td>

                  <td className="border border-black p-1 text-center">{row.sentBy}</td>
                  <td className="border border-black p-1 text-center">{row.acceptedBy}</td>

                  <td className="border border-black p-1 whitespace-pre-wrap wrap-break-word">
                    {row.remarks}
                  </td>

                  <td className="border border-black p-1 text-center">{row.pageNumber}</td>

                  {/* 👁 Eye Icon */}
                  <td className="border border-black p-1 text-center">
                    <button
                      onClick={() => console.log("View row:", row)}
                      className="p-1 rounded hover:bg-[#09b556]/10 transition"
                      title="View Details"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b3b3b"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>

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