import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface BearingClearanceData {
  mainBearings_LH: number;
  mainBearings_RH: number;
  upperConnectionBearings_LH: number;
  upperConnectionBearings_RH: number;
  totalClearance_LH: number;
  totalClearance_RH: number;
}

interface ChartDataPoint {
  date: string;
  'CB RH': number;
  'CB LH': number;
  'Difference RH': number;
  'Difference LH': number;
}

export async function exportToPDF(
  machineName: string,
  date: DateRange | undefined,
  filteredInspectionsCount: number,
  latestBearingCheck: BearingClearanceData | undefined,
  chartData: ChartDataPoint[],
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Bearing Clearance Report', 14, 20);

  // Add machine info
  doc.setFontSize(12);
  doc.text(`Machine: ${machineName}`, 14, 30);
  doc.text(
    `Date Range: ${date?.from ? format(date.from, 'dd/MM/yyyy') : '-'} - ${date?.to ? format(date.to, 'dd/MM/yyyy') : '-'}`,
    14,
    37,
  );
  doc.text(`Total Measurements: ${filteredInspectionsCount}`, 14, 44);

  // Add latest measurements
  if (latestBearingCheck) {
    doc.setFontSize(14);
    doc.text('Latest Measurements (LH / RH)', 14, 54);

    autoTable(doc, {
      startY: 58,
      head: [['Metric', 'Value']],
      body: [
        [
          'Main Bearings (MB)',
          `${Number(latestBearingCheck.mainBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.mainBearings_RH).toFixed(4)}`,
        ],
        [
          'Upper Connection (UCB)',
          `${Number(latestBearingCheck.upperConnectionBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.upperConnectionBearings_RH).toFixed(4)}`,
        ],
        [
          'Total Clearance (TC)',
          `${Number(latestBearingCheck.totalClearance_LH).toFixed(4)} / ${Number(latestBearingCheck.totalClearance_RH).toFixed(4)}`,
        ],
      ],
    });
  }

  // Add historical data table
  if (chartData.length > 0) {
    doc.setFontSize(14);
    doc.text('Historical Data', 14, doc.lastAutoTable.finalY + 10);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Date', 'CB RH', 'CB LH', 'Diff RH', 'Diff LH']],
      body: chartData.map((row) => [
        row.date,
        row['CB RH'].toFixed(4),
        row['CB LH'].toFixed(4),
        row['Difference RH'].toFixed(4),
        row['Difference LH'].toFixed(4),
      ]),
    });
  }

  doc.save(`bearing-clearance-${machineName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function exportToWord(
  machineName: string,
  date: DateRange | undefined,
  filteredInspectionsCount: number,
  latestBearingCheck: BearingClearanceData | undefined,
  chartData: ChartDataPoint[],
) {
  const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } =
    await import('docx');

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Bearing Clearance Report', bold: true, size: 32 })],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [new TextRun({ text: `Machine: ${machineName}`, size: 24 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date Range: ${date?.from ? format(date.from, 'dd/MM/yyyy') : '-'} - ${date?.to ? format(date.to, 'dd/MM/yyyy') : '-'}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total Measurements: ${filteredInspectionsCount}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Latest measurements
          ...(latestBearingCheck
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Latest Measurements (LH / RH)',
                      bold: true,
                      size: 28,
                    }),
                  ],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('Metric')] }),
                        new TableCell({ children: [new Paragraph('Value')] }),
                      ],
                    }),
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('Main Bearings (MB)')] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              `${Number(latestBearingCheck.mainBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.mainBearings_RH).toFixed(4)}`,
                            ),
                          ],
                        }),
                      ],
                    }),
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('Upper Connection (UCB)')] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              `${Number(latestBearingCheck.upperConnectionBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.upperConnectionBearings_RH).toFixed(4)}`,
                            ),
                          ],
                        }),
                      ],
                    }),
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('Total Clearance (TC)')] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              `${Number(latestBearingCheck.totalClearance_LH).toFixed(4)} / ${Number(latestBearingCheck.totalClearance_RH).toFixed(4)}`,
                            ),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new Paragraph({ text: '' }),
              ]
            : []),

          // Historical data
          ...(chartData.length > 0
            ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Historical Data', bold: true, size: 28 })],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('Date')] }),
                        new TableCell({ children: [new Paragraph('CB RH')] }),
                        new TableCell({ children: [new Paragraph('CB LH')] }),
                        new TableCell({ children: [new Paragraph('Diff RH')] }),
                        new TableCell({ children: [new Paragraph('Diff LH')] }),
                      ],
                    }),
                    ...chartData.map(
                      (row) =>
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph(row.date)] }),
                            new TableCell({
                              children: [new Paragraph(row['CB RH'].toFixed(4))],
                            }),
                            new TableCell({
                              children: [new Paragraph(row['CB LH'].toFixed(4))],
                            }),
                            new TableCell({
                              children: [new Paragraph(row['Difference RH'].toFixed(4))],
                            }),
                            new TableCell({
                              children: [new Paragraph(row['Difference LH'].toFixed(4))],
                            }),
                          ],
                        }),
                    ),
                  ],
                }),
              ]
            : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bearing-clearance-${machineName}-${format(new Date(), 'yyyy-MM-dd')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToExcel(
  machineName: string,
  date: DateRange | undefined,
  filteredInspectionsCount: number,
  latestBearingCheck: BearingClearanceData | undefined,
  chartData: ChartDataPoint[],
) {
  const XLSX = await import('xlsx');

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Bearing Clearance Report'],
    [''],
    ['Machine', machineName],
    [
      'Date Range',
      `${date?.from ? format(date.from, 'dd/MM/yyyy') : '-'} - ${date?.to ? format(date.to, 'dd/MM/yyyy') : '-'}`,
    ],
    ['Total Measurements', filteredInspectionsCount],
    [''],
  ];

  if (latestBearingCheck) {
    summaryData.push(
      ['Latest Measurements (LH / RH)'],
      ['Metric', 'Value'],
      [
        'Main Bearings (MB)',
        `${Number(latestBearingCheck.mainBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.mainBearings_RH).toFixed(4)}`,
      ],
      [
        'Upper Connection (UCB)',
        `${Number(latestBearingCheck.upperConnectionBearings_LH).toFixed(4)} / ${Number(latestBearingCheck.upperConnectionBearings_RH).toFixed(4)}`,
      ],
      [
        'Total Clearance (TC)',
        `${Number(latestBearingCheck.totalClearance_LH).toFixed(4)} / ${Number(latestBearingCheck.totalClearance_RH).toFixed(4)}`,
      ],
    );
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Historical data sheet
  if (chartData.length > 0) {
    const historicalData = [
      ['Date', 'CB RH', 'CB LH', 'Difference RH', 'Difference LH'],
      ...chartData.map((row) => [
        row.date,
        row['CB RH'],
        row['CB LH'],
        row['Difference RH'],
        row['Difference LH'],
      ]),
    ];

    const historicalSheet = XLSX.utils.aoa_to_sheet(historicalData);
    XLSX.utils.book_append_sheet(wb, historicalSheet, 'Historical Data');
  }

  // Write file
  XLSX.writeFile(wb, `bearing-clearance-${machineName}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
