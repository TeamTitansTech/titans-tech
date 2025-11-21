import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { type Service } from '@/data/types/services.types';

// Type definitions for section data structures
interface BearingMeasurements extends Record<string, unknown> {
  hasBeenAdjusted?: boolean;
  combinedWith?: string;
  matingPart?: string;
  slideMotorMounts?: string;
  powerCordHoses?: string;
  chainsGearsSprockets?: string;
  lockingClamps?: string;
  notes?: string;
}

interface SlidePositionData extends Record<string, unknown> {
  position1?: number;
  position2?: number;
  position3?: number;
  position4?: number;
  position5?: number;
  position6?: number;
}

interface BearingClearanceSectionData {
  outerBefore?: BearingMeasurements;
  innerBefore?: BearingMeasurements;
  outerData?: BearingMeasurements;
  innerData?: BearingMeasurements;
}

interface SlideSectionData {
  outerBefore?: SlidePositionData;
  innerBefore?: SlidePositionData;
  outerData?: SlidePositionData;
  innerData?: SlidePositionData;
}

interface GibsSectionData {
  outerBefore?: Record<string, unknown>;
  innerBefore?: Record<string, unknown>;
  outerData?: Record<string, unknown>;
  innerData?: Record<string, unknown>;
}

interface GaugeData {
  system?: unknown;
  gauge?: unknown;
  psi?: unknown;
}

interface OtherSectionData extends Record<string, unknown> {
  gauges?: GaugeData[];
}

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
const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
};

// Helper function to calculate max deviation from slide position data
const calculateMaxDeviation = (data: Record<string, unknown>): string => {
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
    (val): val is number =>
      val !== undefined && val !== null && typeof val === 'number' && !isNaN(val) && val !== 0,
  );

  if (validValues.length > 1) {
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    return (max - min).toFixed(4);
  }
  return '-';
};

// Helper function to extract bearing measurement rows
const extractBearingRows = (data: unknown) => {
  if (!data || typeof data !== 'object') return [];
  const dataObj = data as Record<string, unknown>;

  const rows: {
    field: string;
    lh: unknown;
    rh: unknown;
    differential: string;
  }[] = [];
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

  Object.keys(dataObj).forEach((key) => {
    if (skipFields.includes(key)) {
      return;
    }

    const baseField = key.replace(/_RH$|_LH$/, '');

    if (!processedFields.has(baseField)) {
      processedFields.add(baseField);
      const lhValue = dataObj[`${baseField}_LH`];
      const rhValue = dataObj[`${baseField}_RH`];

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
const hasActualData = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;

  return Object.entries(data as Record<string, unknown>).some(([key, value]) => {
    if (key === 'hasBeenAdjusted' || key === 'combinedWith' || key === 'matingPart') {
      return value !== '' && value !== null && value !== undefined;
    }
    return typeof value === 'number' && !isNaN(value);
  });
};

interface ExportData {
  service: Service;
  completedSections: string[];
  completedSectionData: Record<string, Record<string, unknown>>;
  sectionRegistry: Record<string, unknown>;
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
    const sheetData: unknown[][] = [];

    // Bearing Clearance Section
    if (sectionKey === 'BEARING_CLEARANCE') {
      const bearingData = sectionData as unknown as BearingClearanceSectionData;
      sheetData.push([sectionName]);
      sheetData.push([]);

      // Before measurements
      const hasBeforeData =
        (bearingData?.outerBefore && hasActualData(bearingData.outerBefore)) ||
        (bearingData?.innerBefore && hasActualData(bearingData.innerBefore));

      if (hasBeforeData) {
        sheetData.push(['Before Maintenance']);
        sheetData.push([]);

        // Outer Before
        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerBeforeRows = extractBearingRows(bearingData?.outerBefore);
        outerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        // Inner Before
        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerBeforeRows = extractBearingRows(bearingData?.innerBefore);
        innerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);
      }

      // After measurements
      const hasAfterData =
        (bearingData?.outerData && hasActualData(bearingData.outerData)) ||
        (bearingData?.innerData && hasActualData(bearingData.innerData));

      if (hasAfterData) {
        if (hasBeforeData) {
          sheetData.push(['After Maintenance']);
          sheetData.push([]);
        }

        // Outer After
        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerAfterRows = extractBearingRows(bearingData?.outerData);
        outerAfterRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        // Inner After
        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerAfterRows = extractBearingRows(bearingData?.innerData);
        innerAfterRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        // Additional Information
        sheetData.push(['Additional Information']);
        sheetData.push([]);
        sheetData.push(['Outer']);
        const outerData = bearingData?.outerData;
        const outerBefore = bearingData?.outerBefore;
        const innerData = bearingData?.innerData;
        const innerBefore = bearingData?.innerBefore;
        sheetData.push([
          'Combined With',
          displayValue(outerData?.combinedWith || outerBefore?.combinedWith),
        ]);
        sheetData.push([
          'Mating Part',
          displayValue(outerData?.matingPart || outerBefore?.matingPart),
        ]);
        sheetData.push([
          'Has Been Adjusted',
          displayValue(outerData?.hasBeenAdjusted || outerBefore?.hasBeenAdjusted),
        ]);
        sheetData.push([]);
        sheetData.push(['Inner']);
        sheetData.push([
          'Combined With',
          displayValue(innerData?.combinedWith || innerBefore?.combinedWith),
        ]);
        sheetData.push([
          'Mating Part',
          displayValue(innerData?.matingPart || innerBefore?.matingPart),
        ]);
        sheetData.push([
          'Has Been Adjusted',
          displayValue(innerData?.hasBeenAdjusted || innerBefore?.hasBeenAdjusted),
        ]);
        sheetData.push([]);

        // Shutdown Adjustment Mechanism
        sheetData.push(['Shutdown Adjustment Mechanism']);
        sheetData.push([
          'Slide Motor/Mounts',
          displayValue(outerData?.slideMotorMounts || outerBefore?.slideMotorMounts),
        ]);
        sheetData.push([
          'Power Cord/Hoses',
          displayValue(outerData?.powerCordHoses || outerBefore?.powerCordHoses),
        ]);
        sheetData.push([
          'Chains & Gears/Sprockets',
          displayValue(outerData?.chainsGearsSprockets || outerBefore?.chainsGearsSprockets),
        ]);
        sheetData.push([
          'Locking Clamps',
          displayValue(outerData?.lockingClamps || outerBefore?.lockingClamps),
        ]);
        if (outerData?.notes || outerBefore?.notes) {
          sheetData.push(['Notes', displayValue(outerData?.notes || outerBefore?.notes)]);
        }
      }
    }

    // Slide Section
    else if (sectionKey === 'SLIDE') {
      const slideData = sectionData as unknown as SlideSectionData;
      sheetData.push([sectionName]);
      sheetData.push([]);

      // Outer Before
      if (slideData.outerBefore) {
        sheetData.push(['Outer - Before Maintenance']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(slideData.outerBefore.position1),
          displayValue(slideData.outerBefore.position2),
          displayValue(slideData.outerBefore.position3),
          displayValue(slideData.outerBefore.position4),
          displayValue(slideData.outerBefore.position5),
          displayValue(slideData.outerBefore.position6),
          calculateMaxDeviation(slideData.outerBefore),
        ]);
        sheetData.push([]);
      }

      // Outer After
      if (slideData.outerData) {
        sheetData.push([slideData.outerBefore ? 'Outer - After Maintenance' : 'Outer']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(slideData.outerData.position1),
          displayValue(slideData.outerData.position2),
          displayValue(slideData.outerData.position3),
          displayValue(slideData.outerData.position4),
          displayValue(slideData.outerData.position5),
          displayValue(slideData.outerData.position6),
          calculateMaxDeviation(slideData.outerData),
        ]);
        sheetData.push([]);
      }

      // Inner Before
      if (slideData.innerBefore) {
        sheetData.push(['Inner - Before Maintenance']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(slideData.innerBefore.position1),
          displayValue(slideData.innerBefore.position2),
          displayValue(slideData.innerBefore.position3),
          displayValue(slideData.innerBefore.position4),
          displayValue(slideData.innerBefore.position5),
          displayValue(slideData.innerBefore.position6),
          calculateMaxDeviation(slideData.innerBefore),
        ]);
        sheetData.push([]);
      }

      // Inner After
      if (slideData.innerData) {
        sheetData.push([slideData.innerBefore ? 'Inner - After Maintenance' : 'Inner']);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Deviation']);
        sheetData.push([
          displayValue(slideData.innerData.position1),
          displayValue(slideData.innerData.position2),
          displayValue(slideData.innerData.position3),
          displayValue(slideData.innerData.position4),
          displayValue(slideData.innerData.position5),
          displayValue(slideData.innerData.position6),
          calculateMaxDeviation(slideData.innerData),
        ]);
        sheetData.push([]);
      }
    }

    // Gibs Section
    else if (sectionKey === 'GIBS') {
      const gibsData = sectionData as unknown as GibsSectionData;
      sheetData.push([sectionName]);
      sheetData.push([]);

      const hasBeforeData =
        (gibsData?.outerBefore && hasActualData(gibsData.outerBefore)) ||
        (gibsData?.innerBefore && hasActualData(gibsData.innerBefore));

      if (hasBeforeData) {
        sheetData.push(['Before Maintenance']);
        sheetData.push([]);

        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerBeforeRows = extractBearingRows(gibsData?.outerBefore);
        outerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerBeforeRows = extractBearingRows(gibsData?.innerBefore);
        innerBeforeRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);
      }

      const hasAfterData =
        (gibsData?.outerData && hasActualData(gibsData.outerData)) ||
        (gibsData?.innerData && hasActualData(gibsData.innerData));

      if (hasAfterData) {
        if (hasBeforeData) {
          sheetData.push(['Data Measurements']);
          sheetData.push([]);
        }

        sheetData.push(['Outer']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const outerDataRows = extractBearingRows(gibsData?.outerData);
        outerDataRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);

        sheetData.push(['Inner']);
        sheetData.push(['Field', 'LH', 'RH', 'Diff']);
        const innerDataRows = extractBearingRows(gibsData?.innerData);
        innerDataRows.forEach((row) => {
          sheetData.push([row.field, displayValue(row.lh), displayValue(row.rh), row.differential]);
        });
        sheetData.push([]);
      }
    }

    // Other Sections (Clutch, Lubrication, Counterbalance)
    else {
      const otherData = sectionData as unknown as OtherSectionData;
      sheetData.push([sectionName]);
      sheetData.push([]);

      // Handle scalar fields
      const scalarFields = Object.entries(otherData).filter(
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
      const gauges = Array.isArray(otherData.gauges) ? otherData.gauges : [];
      if (gauges.length > 0) {
        sheetData.push(['Gauges']);
        sheetData.push(['System', 'Gauge', 'PSI']);
        gauges.forEach((gauge) => {
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
      const bearingData = sectionData as unknown as BearingClearanceSectionData;
      const hasBeforeData =
        (bearingData?.outerBefore && hasActualData(bearingData.outerBefore)) ||
        (bearingData?.innerBefore && hasActualData(bearingData.innerBefore));

      if (hasBeforeData) {
        doc.setFont('helvetica', 'bold');
        doc.text('Before Maintenance', margin + 2, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 5;

        // Outer Before
        const outerBeforeRows = extractBearingRows(bearingData?.outerBefore);
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
          yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
        }
      }

      const hasAfterData =
        (bearingData?.outerData && hasActualData(bearingData.outerData)) ||
        (bearingData?.innerData && hasActualData(bearingData.innerData));

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
        const outerAfterRows = extractBearingRows(bearingData?.outerData);
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
          yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
        }
      }
    }

    // Slide Section
    else if (sectionKey === 'SLIDE') {
      const slideData = sectionData as unknown as SlideSectionData;
      if (slideData.outerBefore) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Dev']],
          body: [
            [
              displayValue(slideData.outerBefore.position1),
              displayValue(slideData.outerBefore.position2),
              displayValue(slideData.outerBefore.position3),
              displayValue(slideData.outerBefore.position4),
              displayValue(slideData.outerBefore.position5),
              displayValue(slideData.outerBefore.position6),
              calculateMaxDeviation(slideData.outerBefore),
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
        yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
      }

      if (slideData.outerData) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        autoTable(doc, {
          startY: yPosition,
          head: [['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Pos 6', 'Max Dev']],
          body: [
            [
              displayValue(slideData.outerData.position1),
              displayValue(slideData.outerData.position2),
              displayValue(slideData.outerData.position3),
              displayValue(slideData.outerData.position4),
              displayValue(slideData.outerData.position5),
              displayValue(slideData.outerData.position6),
              calculateMaxDeviation(slideData.outerData),
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
        yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      }
    }

    // Other Sections
    else {
      const otherData = sectionData as unknown as OtherSectionData;
      const scalarFields = Object.entries(otherData).filter(
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
        yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      }
    }

    yPosition += 5;
  });

  // Generate filename - replace spaces with underscores for better file naming
  const serviceTypeName = translationCallbacks.getServiceTypeName().replace(/\s+/g, '_');
  const filename = `${serviceTypeName}_${service.date ? format(new Date(service.date), 'yyyy-MM-dd') : 'report'}.pdf`;

  doc.save(filename);
}
