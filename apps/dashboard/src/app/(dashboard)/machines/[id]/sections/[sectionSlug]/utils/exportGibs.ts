import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface GibsData {
  point1: number;
  point2: number;
  point3: number;
  point4: number;
  point5: number;
  point6: number;
  point7: number;
  point8: number;
  point9: number;
  point10: number;
  point11: number;
  point12: number;
  point13: number;
  point14: number;
  point15: number;
  point16: number;
  leftTop?: number;
  leftBottom?: number;
  rightTop?: number;
  rightBottom?: number;
  frontTop?: number;
  frontBottom?: number;
  backTop?: number;
  backBottom?: number;
  hasBeenAdjusted?: string;
  usable?: string;
}

interface ChartDataPoint {
  date: string;
  'Avg Front-Back': number;
  'Left Avg': number;
  'Right Avg': number;
  Difference: number;
}

export async function exportToPDF(
  machineName: string,
  date: DateRange | undefined,
  filteredInspectionsCount: number,
  latestGibsCheck: GibsData | undefined,
  chartData: ChartDataPoint[],
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Gibs Measurements Report', 14, 20);

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
  if (latestGibsCheck) {
    doc.setFontSize(14);
    doc.text('Latest Measurements', 14, 54);

    // Front to Back Points
    const frontToBackData = [
      ['Point 1-4', `${Number(latestGibsCheck.point1).toFixed(4)} / ${Number(latestGibsCheck.point2).toFixed(4)} / ${Number(latestGibsCheck.point3).toFixed(4)} / ${Number(latestGibsCheck.point4).toFixed(4)}`],
      ['Point 5-8', `${Number(latestGibsCheck.point5).toFixed(4)} / ${Number(latestGibsCheck.point6).toFixed(4)} / ${Number(latestGibsCheck.point7).toFixed(4)} / ${Number(latestGibsCheck.point8).toFixed(4)}`],
      ['Point 9-12', `${Number(latestGibsCheck.point9).toFixed(4)} / ${Number(latestGibsCheck.point10).toFixed(4)} / ${Number(latestGibsCheck.point11).toFixed(4)} / ${Number(latestGibsCheck.point12).toFixed(4)}`],
      ['Point 13-16', `${Number(latestGibsCheck.point13).toFixed(4)} / ${Number(latestGibsCheck.point14).toFixed(4)} / ${Number(latestGibsCheck.point15).toFixed(4)} / ${Number(latestGibsCheck.point16).toFixed(4)}`],
    ];

    autoTable(doc, {
      startY: 58,
      head: [['Measurement', 'Values']],
      body: frontToBackData,
    });

    // Directional measurements
    const directionalData = [
      ['Left Top', latestGibsCheck.leftTop ? Number(latestGibsCheck.leftTop).toFixed(4) : '-'],
      [
        'Left Bottom',
        latestGibsCheck.leftBottom ? Number(latestGibsCheck.leftBottom).toFixed(4) : '-',
      ],
      ['Right Top', latestGibsCheck.rightTop ? Number(latestGibsCheck.rightTop).toFixed(4) : '-'],
      [
        'Right Bottom',
        latestGibsCheck.rightBottom ? Number(latestGibsCheck.rightBottom).toFixed(4) : '-',
      ],
      ['Front Top', latestGibsCheck.frontTop ? Number(latestGibsCheck.frontTop).toFixed(4) : '-'],
      [
        'Front Bottom',
        latestGibsCheck.frontBottom ? Number(latestGibsCheck.frontBottom).toFixed(4) : '-',
      ],
      ['Back Top', latestGibsCheck.backTop ? Number(latestGibsCheck.backTop).toFixed(4) : '-'],
      [
        'Back Bottom',
        latestGibsCheck.backBottom ? Number(latestGibsCheck.backBottom).toFixed(4) : '-',
      ],
      ['Has Been Adjusted', latestGibsCheck.hasBeenAdjusted || '-'],
    ];

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Direction', 'Value']],
      body: directionalData,
    });
  }

  // Add historical data table
  if (chartData.length > 0) {
    doc.setFontSize(14);
    doc.text('Historical Data', 14, doc.lastAutoTable.finalY + 10);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Date', 'Avg Front-Back', 'Left Avg', 'Right Avg', 'Difference']],
      body: chartData.map((row) => [
        row.date,
        row['Avg Front-Back'].toFixed(4),
        row['Left Avg'].toFixed(4),
        row['Right Avg'].toFixed(4),
        row.Difference.toFixed(4),
      ]),
    });
  }

  doc.save(`gibs-measurements-${machineName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export async function exportToWord(
  machineName: string,
  date: DateRange | undefined,
  filteredInspectionsCount: number,
  latestGibsCheck: GibsData | undefined,
  chartData: ChartDataPoint[],
) {
  const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } =
    await import('docx');
  const { saveAs } = await import('file-saver');

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Gibs Measurements Report',
            heading: 'Heading1',
          }),
          new Paragraph({
            children: [new TextRun({ text: `Machine: ${machineName}`, bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date Range: ${date?.from ? format(date.from, 'dd/MM/yyyy') : '-'} - ${date?.to ? format(date.to, 'dd/MM/yyyy') : '-'}`,
              }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Total Measurements: ${filteredInspectionsCount}` })],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Latest Measurements',
            heading: 'Heading2',
          }),
        ],
      },
    ],
  });

  if (latestGibsCheck) {
    const frontToBackRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Measurement')] }),
          new TableCell({ children: [new Paragraph('Values')] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Point 1-4')] }),
          new TableCell({
            children: [
              new Paragraph(
                `${Number(latestGibsCheck.point1).toFixed(4)} / ${Number(latestGibsCheck.point2).toFixed(4)} / ${Number(latestGibsCheck.point3).toFixed(4)} / ${Number(latestGibsCheck.point4).toFixed(4)}`,
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Point 5-8')] }),
          new TableCell({
            children: [
              new Paragraph(
                `${Number(latestGibsCheck.point5).toFixed(4)} / ${Number(latestGibsCheck.point6).toFixed(4)} / ${Number(latestGibsCheck.point7).toFixed(4)} / ${Number(latestGibsCheck.point8).toFixed(4)}`,
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Point 9-12')] }),
          new TableCell({
            children: [
              new Paragraph(
                `${Number(latestGibsCheck.point9).toFixed(4)} / ${Number(latestGibsCheck.point10).toFixed(4)} / ${Number(latestGibsCheck.point11).toFixed(4)} / ${Number(latestGibsCheck.point12).toFixed(4)}`,
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Point 13-16')] }),
          new TableCell({
            children: [
              new Paragraph(
                `${Number(latestGibsCheck.point13).toFixed(4)} / ${Number(latestGibsCheck.point14).toFixed(4)} / ${Number(latestGibsCheck.point15).toFixed(4)} / ${Number(latestGibsCheck.point16).toFixed(4)}`,
              ),
            ],
          }),
        ],
      }),
    ];

    doc.addSection({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: frontToBackRows,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Directional Measurements',
          heading: 'Heading3',
        }),
      ],
    });

    const directionalRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Direction')] }),
          new TableCell({ children: [new Paragraph('Value')] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Left Top')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.leftTop ? Number(latestGibsCheck.leftTop).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Left Bottom')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.leftBottom ? Number(latestGibsCheck.leftBottom).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Right Top')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.rightTop ? Number(latestGibsCheck.rightTop).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Right Bottom')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.rightBottom ? Number(latestGibsCheck.rightBottom).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Front Top')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.frontTop ? Number(latestGibsCheck.frontTop).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Front Bottom')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.frontBottom ? Number(latestGibsCheck.frontBottom).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Back Top')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.backTop ? Number(latestGibsCheck.backTop).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Back Bottom')] }),
          new TableCell({
            children: [
              new Paragraph(
                latestGibsCheck.backBottom ? Number(latestGibsCheck.backBottom).toFixed(4) : '-',
              ),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Has Been Adjusted')] }),
          new TableCell({
            children: [new Paragraph(latestGibsCheck.hasBeenAdjusted || '-')],
          }),
        ],
      }),
    ];

    doc.addSection({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: directionalRows,
        }),
      ],
    });
  }

  if (chartData.length > 0) {
    const historicalRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('Date')] }),
          new TableCell({ children: [new Paragraph('Avg Front-Back')] }),
          new TableCell({ children: [new Paragraph('Left Avg')] }),
          new TableCell({ children: [new Paragraph('Right Avg')] }),
          new TableCell({ children: [new Paragraph('Difference')] }),
        ],
      }),
      ...chartData.map(
        (row) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(row.date)] }),
              new TableCell({ children: [new Paragraph(row['Avg Front-Back'].toFixed(4))] }),
              new TableCell({ children: [new Paragraph(row['Left Avg'].toFixed(4))] }),
              new TableCell({ children: [new Paragraph(row['Right Avg'].toFixed(4))] }),
              new TableCell({ children: [new Paragraph(row.Difference.toFixed(4))] }),
            ],
          }),
      ),
    ];

    doc.addSection({
      children: [
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'Historical Data',
          heading: 'Heading2',
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: historicalRows,
        }),
      ],
    });
  }

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `gibs-measurements-${machineName}-${format(new Date(), 'yyyy-MM-dd')}.docx`);
}

export async function exportToExcel(
  machineName: string,
  date: DateRange | undefined,
  filteredInspectionsCount: number,
  latestGibsCheck: GibsData | undefined,
  chartData: ChartDataPoint[],
) {
  const XLSX = await import('xlsx');

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Gibs Measurements Report'],
    [''],
    ['Machine', machineName],
    [
      'Date Range',
      `${date?.from ? format(date.from, 'dd/MM/yyyy') : '-'} - ${date?.to ? format(date.to, 'dd/MM/yyyy') : '-'}`,
    ],
    ['Total Measurements', filteredInspectionsCount],
    [''],
  ];

  if (latestGibsCheck) {
    summaryData.push(['Latest Measurements']);
    summaryData.push(['Front to Back Points']);
    summaryData.push(['Point 1', Number(latestGibsCheck.point1).toFixed(4)]);
    summaryData.push(['Point 2', Number(latestGibsCheck.point2).toFixed(4)]);
    summaryData.push(['Point 3', Number(latestGibsCheck.point3).toFixed(4)]);
    summaryData.push(['Point 4', Number(latestGibsCheck.point4).toFixed(4)]);
    summaryData.push(['Point 5', Number(latestGibsCheck.point5).toFixed(4)]);
    summaryData.push(['Point 6', Number(latestGibsCheck.point6).toFixed(4)]);
    summaryData.push(['Point 7', Number(latestGibsCheck.point7).toFixed(4)]);
    summaryData.push(['Point 8', Number(latestGibsCheck.point8).toFixed(4)]);
    summaryData.push(['Point 9', Number(latestGibsCheck.point9).toFixed(4)]);
    summaryData.push(['Point 10', Number(latestGibsCheck.point10).toFixed(4)]);
    summaryData.push(['Point 11', Number(latestGibsCheck.point11).toFixed(4)]);
    summaryData.push(['Point 12', Number(latestGibsCheck.point12).toFixed(4)]);
    summaryData.push(['Point 13', Number(latestGibsCheck.point13).toFixed(4)]);
    summaryData.push(['Point 14', Number(latestGibsCheck.point14).toFixed(4)]);
    summaryData.push(['Point 15', Number(latestGibsCheck.point15).toFixed(4)]);
    summaryData.push(['Point 16', Number(latestGibsCheck.point16).toFixed(4)]);
    summaryData.push(['']);
    summaryData.push(['Directional Measurements']);
    summaryData.push([
      'Left Top',
      latestGibsCheck.leftTop ? Number(latestGibsCheck.leftTop).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Left Bottom',
      latestGibsCheck.leftBottom ? Number(latestGibsCheck.leftBottom).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Right Top',
      latestGibsCheck.rightTop ? Number(latestGibsCheck.rightTop).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Right Bottom',
      latestGibsCheck.rightBottom ? Number(latestGibsCheck.rightBottom).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Front Top',
      latestGibsCheck.frontTop ? Number(latestGibsCheck.frontTop).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Front Bottom',
      latestGibsCheck.frontBottom ? Number(latestGibsCheck.frontBottom).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Back Top',
      latestGibsCheck.backTop ? Number(latestGibsCheck.backTop).toFixed(4) : '-',
    ]);
    summaryData.push([
      'Back Bottom',
      latestGibsCheck.backBottom ? Number(latestGibsCheck.backBottom).toFixed(4) : '-',
    ]);
    summaryData.push(['Has Been Adjusted', latestGibsCheck.hasBeenAdjusted || '-']);
  }

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Historical data sheet
  if (chartData.length > 0) {
    const historicalData = [
      ['Date', 'Avg Front-Back', 'Left Avg', 'Right Avg', 'Difference'],
      ...chartData.map((row) => [
        row.date,
        row['Avg Front-Back'].toFixed(4),
        row['Left Avg'].toFixed(4),
        row['Right Avg'].toFixed(4),
        row.Difference.toFixed(4),
      ]),
    ];

    const historicalWs = XLSX.utils.aoa_to_sheet(historicalData);
    XLSX.utils.book_append_sheet(wb, historicalWs, 'Historical Data');
  }

  // Write file
  XLSX.writeFile(wb, `gibs-measurements-${machineName}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
