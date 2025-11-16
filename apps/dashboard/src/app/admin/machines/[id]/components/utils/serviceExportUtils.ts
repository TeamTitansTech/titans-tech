import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { type Service } from '@/data/types/services.types';

// Helper function to format field names
const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to display value or "-" for empty
const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
};

// Helper function to calculate max deviation from slide position data
const calculateMaxDeviation = (data: any): string => {
  if (!data) return '-';

  const positions = [
    data.position1,
    data.position2,
    data.position3,
    data.position4,
    data.position5,
    data.position6,
  ];
  const validValues = positions.filter(
    (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
  );

  if (validValues.length > 1) {
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    return (max - min).toFixed(4);
  }
  return '-';
};

// Helper function to extract bearing measurement rows
const extractBearingRows = (data: any) => {
  if (!data) return [];

  const rows: { field: string; lh: any; rh: any; differential: string }[] = [];
  const processedFields = new Set<string>();

  // Fields to skip (non-measurement fields)
  const skipFields = [
    'hasBeenAdjusted',
    'combinedWith',
    'matingPart',
    'slideMotorMounts',
    'powerCordHoses',
    'chainsGearsSprockets',
    'lockingClamps',
    'notes',
  ];

  Object.keys(data).forEach((key) => {
    if (skipFields.includes(key)) {
      return;
    }

    const baseField = key.replace(/_RH$|_LH$/, '');

    if (!processedFields.has(baseField)) {
      processedFields.add(baseField);
      const lhValue = data[`${baseField}_LH`];
      const rhValue = data[`${baseField}_RH`];

      let differential = '-';
      if (typeof lhValue === 'number' && typeof rhValue === 'number') {
        differential = String(Math.abs(rhValue - lhValue));
      }

      rows.push({
        field: formatFieldName(baseField),
        lh: lhValue,
        rh: rhValue,
        differential,
      });
    }
  });

  return rows;
};

// Helper function to check if data has actual values
const hasActualData = (data: any): boolean => {
  if (!data) return false;

  return Object.entries(data).some(([key, value]) => {
    if (key === 'hasBeenAdjusted' || key === 'combinedWith' || key === 'matingPart') {
      return value !== '' && value !== null && value !== undefined;
    }
    return typeof value === 'number' && !isNaN(value);
  });
};

interface ExportData {
  service: Service;
  completedSections: string[];
  completedSectionData: Record<string, any>;
  sectionRegistry: any;
  translationCallbacks: {
    getSectionName: (key: string) => string;
    getServiceTypeName: () => string;
  };
}

// Export to Excel
export function exportToExcel(data: ExportData): void {
  const { service, completedSections, completedSectionData, translationCallbacks } = data;

  const workbook = utils.book_new();

  // Sheet 1: Service Details
  const detailsData = [
    ['Service Type', translationCallbacks.getServiceTypeName()],
    ['Date', service.date ? format(new Date(service.date), 'PPP') : '-'],
    ['Performed By', service.performedBy || '-'],
    [],
    ['Completed Sections'],
    ...completedSections.map((key) => [translationCallbacks.getSectionName(key)]),
  ];

  const detailsSheet = utils.aoa_to_sheet(detailsData);
  utils.book_append_sheet(workbook, detailsSheet, 'Service Details');

  // Sheet 2+: Each Section's Data
  completedSections.forEach((sectionKey) => {
    const sectionData = completedSectionData[sectionKey];
    const sectionName = translationCallbacks.getSectionName(sectionKey);
    const sheetData: any[] = [];

    // Bearing Clearance Section
    if (sectionKey === 'BEARING_CLEARANCE') {
      sheetData.push([sectionName]);
      sheetData.push([]);

      // Before measurements
      const hasBeforeData =
        (sectionData?.outerBefore && hasActualData(sectionData.outerBefore)) ||
        (sectionData?.innerBefore && hasActualData(sectionData.innerBefore));

      if (hasBeforeData) {
        sheetData.push(['Before Maintenance']);
        sheetData.push([]);

        // Outer Before
        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerBeforeRows = extractBearingRows(sectionData?.outerBefore);
        outerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        // Inner Before
        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerBeforeRows = extractBearingRows(sectionData?.innerBefore);
        innerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);
      }

      // After measurements
      const hasAfterData =
        (sectionData?.outerData && hasActualData(sectionData.outerData)) ||
        (sectionData?.innerData && hasActualData(sectionData.innerData));

      if (hasAfterData) {
        if (hasBeforeData) {
          sheetData.push(['After Maintenance']);
          sheetData.push([]);
        }

        // Outer After
        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerAfterRows = extractBearingRows(sectionData?.outerData);
        outerAfterRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        // Inner After
        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerAfterRows = extractBearingRows(sectionData?.innerData);
        innerAfterRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        // Additional Information
        sheetData.push(['Additional Information']);
        sheetData.push([]);
        sheetData.push(['Outer']);
        sheetData.push([
          'Combined With',
          displayValue(
            sectionData?.outerData?.combinedWith || sectionData?.outerBefore?.combinedWith,
          ),
        ]);
        sheetData.push([
          'Mating Part',
          displayValue(sectionData?.outerData?.matingPart || sectionData?.outerBefore?.matingPart),
        ]);
        sheetData.push([
          'Has Been Adjusted',
          displayValue(
            sectionData?.outerData?.hasBeenAdjusted || sectionData?.outerBefore?.hasBeenAdjusted,
          ),
        ]);
        sheetData.push([]);
        sheetData.push(['Inner']);
        sheetData.push([
          'Combined With',
          displayValue(
            sectionData?.innerData?.combinedWith || sectionData?.innerBefore?.combinedWith,
          ),
        ]);
        sheetData.push([
          'Mating Part',
          displayValue(sectionData?.innerData?.matingPart || sectionData?.innerBefore?.matingPart),
        ]);
        sheetData.push([
          'Has Been Adjusted',
          displayValue(
            sectionData?.innerData?.hasBeenAdjusted || sectionData?.innerBefore?.hasBeenAdjusted,
          ),
        ]);
        sheetData.push([]);

        // Shutdown Adjustment Mechanism
        sheetData.push(['Shutdown Adjustment Mechanism']);
        sheetData.push([
          'Slide Motor/Mounts',
          displayValue(
            sectionData?.outerData?.slideMotorMounts || sectionData?.outerBefore?.slideMotorMounts,
          ),
        ]);
        sheetData.push([
          'Power Cord/Hoses',
          displayValue(
            sectionData?.outerData?.powerCordHoses || sectionData?.outerBefore?.powerCordHoses,
          ),
        ]);
        sheetData.push([
          'Chains & Gears/Sprockets',
          displayValue(
            sectionData?.outerData?.chainsGearsSprockets ||
              sectionData?.outerBefore?.chainsGearsSprockets,
          ),
        ]);
        sheetData.push([
          'Locking Clamps',
          displayValue(
            sectionData?.outerData?.lockingClamps || sectionData?.outerBefore?.lockingClamps,
          ),
        ]);
        if (sectionData?.outerData?.notes || sectionData?.outerBefore?.notes) {
          sheetData.push([
            'Notes',
            displayValue(sectionData?.outerData?.notes || sectionData?.outerBefore?.notes),
          ]);
        }
      }
    }

    // Slide Section
    else if (sectionKey === 'SLIDE') {
      sheetData.push([sectionName]);
      sheetData.push([]);

      // Outer Before
      if (sectionData.outerBefore) {
        sheetData.push(['Outer - Before Maintenance']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(sectionData.outerBefore.position1),
          displayValue(sectionData.outerBefore.position2),
          displayValue(sectionData.outerBefore.position3),
          displayValue(sectionData.outerBefore.position4),
          displayValue(sectionData.outerBefore.position5),
          displayValue(sectionData.outerBefore.position6),
          calculateMaxDeviation(sectionData.outerBefore),
        ]);
        sheetData.push([]);
      }

      // Outer After
      if (sectionData.outerData) {
        sheetData.push([sectionData.outerBefore ? 'Outer - After Maintenance' : 'Outer']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(sectionData.outerData.position1),
          displayValue(sectionData.outerData.position2),
          displayValue(sectionData.outerData.position3),
          displayValue(sectionData.outerData.position4),
          displayValue(sectionData.outerData.position5),
          displayValue(sectionData.outerData.position6),
          calculateMaxDeviation(sectionData.outerData),
        ]);
        sheetData.push([]);
      }

      // Inner Before
      if (sectionData.innerBefore) {
        sheetData.push(['Inner - Before Maintenance']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(sectionData.innerBefore.position1),
          displayValue(sectionData.innerBefore.position2),
          displayValue(sectionData.innerBefore.position3),
          displayValue(sectionData.innerBefore.position4),
          displayValue(sectionData.innerBefore.position5),
          displayValue(sectionData.innerBefore.position6),
          calculateMaxDeviation(sectionData.innerBefore),
        ]);
        sheetData.push([]);
      }

      // Inner After
      if (sectionData.innerData) {
        sheetData.push([sectionData.innerBefore ? 'Inner - After Maintenance' : 'Inner']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(sectionData.innerData.position1),
          displayValue(sectionData.innerData.position2),
          displayValue(sectionData.innerData.position3),
          displayValue(sectionData.innerData.position4),
          displayValue(sectionData.innerData.position5),
          displayValue(sectionData.innerData.position6),
          calculateMaxDeviation(sectionData.innerData),
        ]);
        sheetData.push([]);
      }
    }

    // Gibs Section
    else if (sectionKey === 'GIBS') {
      sheetData.push([sectionName]);
      sheetData.push([]);

      const hasBeforeData =
        (sectionData?.outerBefore && hasActualData(sectionData.outerBefore)) ||
        (sectionData?.innerBefore && hasActualData(sectionData.innerBefore));

      if (hasBeforeData) {
        sheetData.push(['Before Maintenance']);
        sheetData.push([]);

        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerBeforeRows = extractBearingRows(sectionData?.outerBefore);
        outerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerBeforeRows = extractBearingRows(sectionData?.innerBefore);
        innerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);
      }

      const hasAfterData =
        (sectionData?.outerData && hasActualData(sectionData.outerData)) ||
        (sectionData?.innerData && hasActualData(sectionData.innerData));

      if (hasAfterData) {
        if (hasBeforeData) {
          sheetData.push(['Data Measurements']);
          sheetData.push([]);
        }

        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerDataRows = extractBearingRows(sectionData?.outerData);
        outerDataRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerDataRows = extractBearingRows(sectionData?.innerData);
        innerDataRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);
      }
    }

    // Other Sections (Clutch, Lubrication, Counterbalance)
    else {
      sheetData.push([sectionName]);
      sheetData.push([]);

      // Handle scalar fields
      const scalarFields = Object.entries(sectionData).filter(
        ([key, value]) =>
          key !== 'gauges' &&
          (typeof value !== 'object' || value === null) &&
          value !== null &&
          value !== undefined &&
          value !== '',
      );

      if (scalarFields.length > 0) {
        sheetData.push(['Field', 'Value']);
        scalarFields.forEach(([key, value]) => {
          sheetData.push([formatFieldName(key), displayValue(value)]);
        });
        sheetData.push([]);
      }

      // Handle gauges
      const gauges = Array.isArray(sectionData.gauges) ? sectionData.gauges : [];
      if (gauges.length > 0) {
        sheetData.push(['Gauges']);
        sheetData.push(['System', 'Gauge', 'PSI']);
        gauges.forEach((gauge: any) => {
          sheetData.push([
            displayValue(gauge.system),
            displayValue(gauge.gauge),
            displayValue(gauge.psi),
          ]);
        });
      }
    }

    if (sheetData.length > 0) {
      const sheet = utils.aoa_to_sheet(sheetData);
      // Truncate sheet name to 31 characters (Excel limit)
      const sheetName = sectionName.substring(0, 31);
      utils.book_append_sheet(workbook, sheet, sheetName);
    }
  });

  // Generate filename
  const filename = `${translationCallbacks.getServiceTypeName()}_${service.date ? format(new Date(service.date), 'yyyy-MM-dd') : 'report'}.xlsx`;

  writeFile(workbook, filename);
}

// Export to PDF
export function exportToPDF(data: ExportData): void {
  const { service, completedSections, completedSectionData, translationCallbacks } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - 2 * margin;

  // Color scheme - Blue to match UI buttons (Tailwind blue-600)
  const primaryBlue: [number, number, number] = [66, 66, 66]; // RGB for #2563eb

  // Title with blue color
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(translationCallbacks.getServiceTypeName(), margin, yPosition);
  yPosition += 10;

  // Service Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text(
    `Data da realizacao: ${service.date ? format(new Date(service.date), 'PPP') : '-'}`,
    margin,
    yPosition,
    { maxWidth: contentWidth },
  );
  yPosition += 6;
  doc.text(`Realizado por: ${service.performedBy || '-'}`, margin, yPosition, {
    maxWidth: contentWidth,
  });
  yPosition += 12;

  // Completed Sections
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('Areas Preenchidas', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  completedSections.forEach((key) => {
    const sectionName = translationCallbacks.getSectionName(key);
    doc.text(`\u2713 ${sectionName}`, margin + 5, yPosition);
    yPosition += 5;
  });
  yPosition += 10;

  // Detailed Data
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text('Dados Preenchidos', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Loop through sections and add their data
  completedSections.forEach((sectionKey) => {
    const sectionData = completedSectionData[sectionKey];
    const sectionName = translationCallbacks.getSectionName(sectionKey);

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Section title with blue color
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(sectionName, margin, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    // Bearing Clearance Section
    if (sectionKey === 'BEARING_CLEARANCE') {
      const hasBeforeData =
        (sectionData?.outerBefore && hasActualData(sectionData.outerBefore)) ||
        (sectionData?.innerBefore && hasActualData(sectionData.innerBefore));

      if (hasBeforeData) {
        doc.setFont('helvetica', 'bold');
        doc.text('Before Maintenance', margin + 2, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 5;

        // Outer Before
        const outerBeforeRows = extractBearingRows(sectionData?.outerBefore);
        if (outerBeforeRows.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [['Field', 'LH', 'RH', 'Diff']],
            body: outerBeforeRows.map((row) => [
              row.field,
              displayValue(row.lh),
              displayValue(row.rh),
              row.differential,
            ]),
            theme: 'grid',
            headStyles: {
              fillColor: primaryBlue,
              fontSize: 8,
              textColor: [255, 255, 255],
              fontStyle: 'bold',
            },
            bodyStyles: { fontSize: 7 },
            margin: { left: margin + 2 },
            tableWidth: contentWidth / 2 - 3,
          });
          yPosition = (doc as any).lastAutoTable.finalY + 5;
        }
      }

      const hasAfterData =
        (sectionData?.outerData && hasActualData(sectionData.outerData)) ||
        (sectionData?.innerData && hasActualData(sectionData.innerData));

      if (hasAfterData) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        if (hasBeforeData) {
          doc.setFont('helvetica', 'bold');
          doc.text('After Maintenance', margin + 2, yPosition);
          doc.setFont('helvetica', 'normal');
          yPosition += 5;
        }

        // Outer After
        const outerAfterRows = extractBearingRows(sectionData?.outerData);
        if (outerAfterRows.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [['Field', 'LH', 'RH', 'Diff']],
            body: outerAfterRows.map((row) => [
              row.field,
              displayValue(row.lh),
              displayValue(row.rh),
              row.differential,
            ]),
            theme: 'grid',
            headStyles: {
              fillColor: primaryBlue,
              fontSize: 8,
              textColor: [255, 255, 255],
              fontStyle: 'bold',
            },
            bodyStyles: { fontSize: 7 },
            margin: { left: margin + 2 },
            tableWidth: contentWidth / 2 - 3,
          });
          yPosition = (doc as any).lastAutoTable.finalY + 8;
        }
      }
    }

    // Slide Section
    else if (sectionKey === 'SLIDE') {
      if (sectionData.outerBefore) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Dev']],
          body: [
            [
              displayValue(sectionData.outerBefore.position1),
              displayValue(sectionData.outerBefore.position2),
              displayValue(sectionData.outerBefore.position3),
              displayValue(sectionData.outerBefore.position4),
              displayValue(sectionData.outerBefore.position5),
              displayValue(sectionData.outerBefore.position6),
              calculateMaxDeviation(sectionData.outerBefore),
            ],
          ],
          theme: 'grid',
          headStyles: {
            fillColor: primaryBlue,
            fontSize: 7,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          bodyStyles: { fontSize: 7 },
          margin: { left: margin + 2 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }

      if (sectionData.outerData) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        autoTable(doc, {
          startY: yPosition,
          head: [['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Dev']],
          body: [
            [
              displayValue(sectionData.outerData.position1),
              displayValue(sectionData.outerData.position2),
              displayValue(sectionData.outerData.position3),
              displayValue(sectionData.outerData.position4),
              displayValue(sectionData.outerData.position5),
              displayValue(sectionData.outerData.position6),
              calculateMaxDeviation(sectionData.outerData),
            ],
          ],
          theme: 'grid',
          headStyles: {
            fillColor: primaryBlue,
            fontSize: 7,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          bodyStyles: { fontSize: 7 },
          margin: { left: margin + 2 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    // Other Sections
    else {
      const scalarFields = Object.entries(sectionData).filter(
        ([key, value]) =>
          key !== 'gauges' &&
          (typeof value !== 'object' || value === null) &&
          value !== null &&
          value !== undefined &&
          value !== '',
      );

      if (scalarFields.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Field', 'Value']],
          body: scalarFields.map(([key, value]) => [formatFieldName(key), displayValue(value)]),
          theme: 'grid',
          headStyles: {
            fillColor: primaryBlue,
            fontSize: 8,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          bodyStyles: { fontSize: 7 },
          margin: { left: margin + 2 },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    yPosition += 5;
  });

  // Generate filename - replace spaces with underscores for better file naming
  const serviceTypeName = translationCallbacks.getServiceTypeName().replace(/\s+/g, '_');
  const filename = `${serviceTypeName}_${service.date ? format(new Date(service.date), 'yyyy-MM-dd') : 'report'}.pdf`;

  doc.save(filename);
}
