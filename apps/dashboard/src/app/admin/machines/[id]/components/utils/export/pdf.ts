import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type {
  ExportData,
  TranslationCallbacks,
  BearingClearanceSectionData,
  SlideSectionData,
  SlideData,
  GibsSectionData,
  GibsStageData,
  LubricationSectionData,
  ClutchSectionData,
  CounterbalanceSectionData,
  CounterbalanceData,
  TrammingSectionData,
  TrammingData,
  PistonsSectionData,
  PistonsData,
} from './types';
import {
  formatFieldName,
  displayValue,
  translateEnumValue,
  calculateSlideMaxDeviation,
  extractBearingRows,
  hasActualData,
  calculateGibsFields,
} from './helpers';

// Export to PDF
export function exportToPDF(data: ExportData): void {
  const { service, completedSections, completedSectionData, translationCallbacks } = data;
  const t = translationCallbacks;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - 2 * margin;

  // Color scheme
  const primaryColor: [number, number, number] = [66, 66, 66];

  // Helper to check page break
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > 270) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Helper to get enum translations
  const getEnumTranslations = () => ({
    yes: t.getCommonStatusTranslation('yes'),
    no: t.getCommonStatusTranslation('no'),
    dnc: t.getCommonStatusTranslation('dnc'),
    na: t.getCommonStatusTranslation('na'),
  });

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(t.getServiceTypeName(), margin, yPosition);
  yPosition += 12;

  // ===== SERVICE DETAILS SECTION =====
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(t.getServiceTranslation('serviceDetails'), margin, yPosition);
  yPosition += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Service details table
  const serviceDetailsRows: string[][] = [
    [
      t.getServiceTranslation('realizationDate'),
      service.date ? format(new Date(service.date), 'PPP') : '-',
    ],
    [t.getServiceTranslation('performedBy'), service.performedBy || '-'],
    [
      t.getServiceTranslation('inspectionObservations.isPressLevel'),
      t.getInspectionEnumTranslation('yesNoNaDnc', service.isPressLevel?.toLowerCase() || ''),
    ],
    [
      t.getServiceTranslation('inspectionObservations.driveBeltCondition'),
      t.getInspectionEnumTranslation(
        'driveBeltCondition',
        service.driveBeltCondition?.toLowerCase() || '',
      ),
    ],
    [
      t.getServiceTranslation('inspectionObservations.areAllProtectiveCovers'),
      t.getInspectionEnumTranslation(
        'protectiveCoversStatus',
        service.areAllProtectiveCovers?.toLowerCase() || '',
      ),
    ],
  ];

  if (service.areAllProtectiveCovers === 'NO') {
    serviceDetailsRows.push([
      t.getServiceTranslation('inspectionObservations.whyNotCovered'),
      t.getInspectionEnumTranslation('whyNotCovered', service.whyNotCovered?.toLowerCase() || ''),
    ]);
    if (service.whyNotCovered === 'OTHER_EXPLAIN' && service.protectiveCoversExplanation) {
      serviceDetailsRows.push([
        t.getServiceTranslation('inspectionObservations.protectiveCoversExplanation'),
        service.protectiveCoversExplanation,
      ]);
    }
  }

  serviceDetailsRows.push([
    t.getServiceTranslation('inspectionObservations.areCracksVisible'),
    t.getInspectionEnumTranslation('yesNoDnc', service.areCracksVisible?.toLowerCase() || ''),
  ]);

  if (service.areCracksVisible === 'YES' && service.cracksLocation) {
    serviceDetailsRows.push([
      t.getServiceTranslation('inspectionObservations.cracksLocation'),
      service.cracksLocation,
    ]);
  }

  serviceDetailsRows.push([
    t.getServiceTranslation('inspectionObservations.isMainMotorSecure'),
    t.getInspectionEnumTranslation('yesNoDnc', service.isMainMotorSecure?.toLowerCase() || ''),
  ]);
  serviceDetailsRows.push([
    t.getServiceTranslation('inspectionObservations.isMotorPlateSecure'),
    t.getInspectionEnumTranslation('yesNoDnc', service.isMotorPlateSecure?.toLowerCase() || ''),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
    body: serviceDetailsRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      fontSize: 8,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: contentWidth - 70 },
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ===== FILLED AREAS SECTION =====
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(t.getServiceTranslation('filledAreas'), margin, yPosition);
  yPosition += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  completedSections.forEach((key) => {
    checkPageBreak(6);
    const sectionName = t.getSectionName(key);
    doc.text(`✓ ${sectionName}`, margin + 3, yPosition);
    yPosition += 5;
  });
  yPosition += 8;

  // ===== FILLED DATA SECTIONS =====
  checkPageBreak(15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(t.getServiceTranslation('filledData'), margin, yPosition);
  yPosition += 8;

  // Loop through each section
  completedSections.forEach((sectionKey) => {
    const sectionData = completedSectionData[sectionKey];
    const sectionName = t.getSectionName(sectionKey);

    checkPageBreak(15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(sectionName, margin, yPosition);
    yPosition += 6;
    doc.setTextColor(0, 0, 0);

    // ===== BEARING CLEARANCE =====
    if (sectionKey === 'BEARING_CLEARANCE') {
      yPosition = renderBearingClearance(
        doc,
        sectionData as unknown as BearingClearanceSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== SLIDE =====
    else if (sectionKey === 'SLIDE') {
      yPosition = renderSlide(
        doc,
        sectionData as unknown as SlideSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== GIBS =====
    else if (sectionKey === 'GIBS') {
      yPosition = renderGibs(
        doc,
        sectionData as unknown as GibsSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
      );
    }

    // ===== LUBRICATION =====
    else if (sectionKey === 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') {
      yPosition = renderLubrication(
        doc,
        sectionData as unknown as LubricationSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== CLUTCH =====
    else if (sectionKey === 'CLUTCH') {
      yPosition = renderClutch(
        doc,
        sectionData as unknown as ClutchSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== COUNTERBALANCE =====
    else if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
      yPosition = renderCounterbalance(
        doc,
        sectionData as unknown as CounterbalanceSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== TRAMMING =====
    else if (sectionKey === 'TRAMMING') {
      yPosition = renderTramming(
        doc,
        sectionData as unknown as TrammingSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== PISTONS =====
    else if (sectionKey === 'PISTONS') {
      yPosition = renderPistons(
        doc,
        sectionData as unknown as PistonsSectionData,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    // ===== GENERIC SECTION =====
    else {
      yPosition = renderGenericSection(
        doc,
        sectionData as Record<string, unknown>,
        t,
        yPosition,
        margin,
        contentWidth,
        primaryColor,
        checkPageBreak,
        getEnumTranslations,
      );
    }

    yPosition += 5;
  });

  // Generate filename
  const serviceTypeName = t.getServiceTypeName().replace(/\s+/g, '_');
  const filename = `${serviceTypeName}_${service.date ? format(new Date(service.date), 'yyyy-MM-dd') : 'report'}.pdf`;

  doc.save(filename);
}

// ===== SECTION RENDERERS =====

function renderBearingClearance(
  doc: jsPDF,
  bearingData: BearingClearanceSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  const hasBeforeData =
    (bearingData?.outerBefore && hasActualData(bearingData.outerBefore)) ||
    (bearingData?.innerBefore && hasActualData(bearingData.innerBefore));
  const hasAfterData =
    (bearingData?.outerData && hasActualData(bearingData.outerData)) ||
    (bearingData?.innerData && hasActualData(bearingData.innerData));

  // Before Maintenance
  if (hasBeforeData) {
    checkPageBreak(40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('sections.beforeMaintenance'), margin + 2, yPosition);
    yPosition += 5;

    // Outer Before Table
    const outerBeforeRows = extractBearingRows(bearingData?.outerBefore);
    if (outerBeforeRows.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t.getTableTranslation('outer'), margin + 2, yPosition);
      yPosition += 3;

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            t.getTableTranslation('field'),
            t.getTableTranslation('lh'),
            t.getTableTranslation('rh'),
            t.getTableTranslation('diff'),
          ],
        ],
        body: outerBeforeRows.map((row) => [
          t.getBearingFieldTranslation(row.field) || formatFieldName(row.field),
          translateEnumValue(row.lh, enumTranslations),
          translateEnumValue(row.rh, enumTranslations),
          row.differential,
        ]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin + 2, right: margin },
        tableWidth: contentWidth / 2 - 5,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
    }

    // Inner Before Table
    const innerBeforeRows = extractBearingRows(bearingData?.innerBefore);
    if (innerBeforeRows.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t.getTableTranslation('inner'), margin + 2, yPosition);
      yPosition += 3;

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            t.getTableTranslation('field'),
            t.getTableTranslation('lh'),
            t.getTableTranslation('rh'),
            t.getTableTranslation('diff'),
          ],
        ],
        body: innerBeforeRows.map((row) => [
          t.getBearingFieldTranslation(row.field) || formatFieldName(row.field),
          translateEnumValue(row.lh, enumTranslations),
          translateEnumValue(row.rh, enumTranslations),
          row.differential,
        ]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin + 2, right: margin },
        tableWidth: contentWidth / 2 - 5,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
    }
  }

  // After Maintenance
  if (hasAfterData) {
    if (hasBeforeData) {
      checkPageBreak(40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(t.getServiceTranslation('sections.afterMaintenance'), margin + 2, yPosition);
      yPosition += 5;
    }

    // Outer After Table
    const outerAfterRows = extractBearingRows(bearingData?.outerData);
    if (outerAfterRows.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t.getTableTranslation('outer'), margin + 2, yPosition);
      yPosition += 3;

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            t.getTableTranslation('field'),
            t.getTableTranslation('lh'),
            t.getTableTranslation('rh'),
            t.getTableTranslation('diff'),
          ],
        ],
        body: outerAfterRows.map((row) => [
          t.getBearingFieldTranslation(row.field) || formatFieldName(row.field),
          translateEnumValue(row.lh, enumTranslations),
          translateEnumValue(row.rh, enumTranslations),
          row.differential,
        ]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin + 2, right: margin },
        tableWidth: contentWidth / 2 - 5,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
    }

    // Inner After Table
    const innerAfterRows = extractBearingRows(bearingData?.innerData);
    if (innerAfterRows.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t.getTableTranslation('inner'), margin + 2, yPosition);
      yPosition += 3;

      autoTable(doc, {
        startY: yPosition,
        head: [
          [
            t.getTableTranslation('field'),
            t.getTableTranslation('lh'),
            t.getTableTranslation('rh'),
            t.getTableTranslation('diff'),
          ],
        ],
        body: innerAfterRows.map((row) => [
          t.getBearingFieldTranslation(row.field) || formatFieldName(row.field),
          translateEnumValue(row.lh, enumTranslations),
          translateEnumValue(row.rh, enumTranslations),
          row.differential,
        ]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin + 2, right: margin },
        tableWidth: contentWidth / 2 - 5,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
    }
  }

  // Additional Information
  if (hasBeforeData || hasAfterData) {
    checkPageBreak(30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('additionalInformation'), margin + 2, yPosition);
    yPosition += 5;

    const outerDataObj = bearingData?.outerData || bearingData?.outerBefore;
    const innerDataObj = bearingData?.innerData || bearingData?.innerBefore;

    const additionalRows: string[][] = [];
    additionalRows.push([t.getTableTranslation('outer'), '']);
    additionalRows.push([
      `  ${t.getBearingFieldTranslation('combinedWith')}`,
      translateEnumValue(outerDataObj?.combinedWith, enumTranslations),
    ]);
    additionalRows.push([
      `  ${t.getBearingFieldTranslation('matingPart')}`,
      translateEnumValue(outerDataObj?.matingPart, enumTranslations),
    ]);
    additionalRows.push([
      `  ${t.getBearingFieldTranslation('hasBeenAdjusted')}`,
      translateEnumValue(outerDataObj?.hasBeenAdjusted, enumTranslations),
    ]);
    additionalRows.push([t.getTableTranslation('inner'), '']);
    additionalRows.push([
      `  ${t.getBearingFieldTranslation('combinedWith')}`,
      translateEnumValue(innerDataObj?.combinedWith, enumTranslations),
    ]);
    additionalRows.push([
      `  ${t.getBearingFieldTranslation('matingPart')}`,
      translateEnumValue(innerDataObj?.matingPart, enumTranslations),
    ]);
    additionalRows.push([
      `  ${t.getBearingFieldTranslation('hasBeenAdjusted')}`,
      translateEnumValue(innerDataObj?.hasBeenAdjusted, enumTranslations),
    ]);

    autoTable(doc, {
      startY: yPosition,
      body: additionalRows,
      theme: 'plain',
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
      },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

    // Shutdown Adjustment Mechanism
    checkPageBreak(25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('shutdownAdjustmentMechanism'), margin + 2, yPosition);
    yPosition += 4;

    const shutdownRows: string[][] = [
      [
        t.getBearingFieldTranslation('slideMotorMounts'),
        translateEnumValue(outerDataObj?.slideMotorMounts, enumTranslations),
      ],
      [
        t.getBearingFieldTranslation('powerCordHoses'),
        translateEnumValue(outerDataObj?.powerCordHoses, enumTranslations),
      ],
      [
        t.getBearingFieldTranslation('chainsGearsSprockets'),
        translateEnumValue(outerDataObj?.chainsGearsSprockets, enumTranslations),
      ],
      [
        t.getBearingFieldTranslation('lockingClamps'),
        translateEnumValue(outerDataObj?.lockingClamps, enumTranslations),
      ],
    ];

    if (outerDataObj?.notes) {
      shutdownRows.push([t.getServiceTranslation('notes'), String(outerDataObj.notes)]);
    }

    autoTable(doc, {
      startY: yPosition,
      body: shutdownRows,
      theme: 'plain',
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
      },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  return yPosition;
}

function renderSlide(
  doc: jsPDF,
  slideData: SlideSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  const renderSlideData = (data: SlideData, title: string) => {
    checkPageBreak(50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    yPosition += 4;

    // Metadata table
    const metadataRows: string[][] = [
      [
        t.getSlideFieldTranslation('parallelism'),
        translateEnumValue(data.parallelism, enumTranslations),
      ],
      [
        t.getSlideFieldTranslation('hasParallelismBeenAdjusted'),
        translateEnumValue(data.hasParallelismBeenAdjusted, enumTranslations),
      ],
      [
        t.getSlideFieldTranslation('shutheightIndicatorsChecked'),
        translateEnumValue(data.shutheightIndicatorsChecked, enumTranslations),
      ],
      [
        t.getSlideFieldTranslation('overloadsOnTonnageMonitor'),
        translateEnumValue(data.overloadsOnTonnageMonitor, enumTranslations),
      ],
      [t.getSlideFieldTranslation('shutheightActualSh'), displayValue(data.shutheightActualSh)],
      [t.getSlideFieldTranslation('indicatorReading'), displayValue(data.indicatorReading)],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
      body: metadataRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7 },
      margin: { left: margin + 2, right: margin },
      tableWidth: contentWidth - 5,
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // Before measurements
    if (data.hasParallelismBeenAdjusted === 'YES' && data.beforePosition1 !== undefined) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(t.getSlideFieldTranslation('beforeAdjustment'), margin + 2, yPosition);
      yPosition += 3;

      autoTable(doc, {
        startY: yPosition,
        head: [
          ['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', t.getSlideFieldTranslation('maxDeviation')],
        ],
        body: [
          [
            displayValue(data.beforePosition1),
            displayValue(data.beforePosition2),
            displayValue(data.beforePosition3),
            displayValue(data.beforePosition4),
            displayValue(data.beforePosition5),
            calculateSlideMaxDeviation(data, 'before'),
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin + 2, right: margin },
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
    }

    // After measurements
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const measurementLabel =
      data.hasParallelismBeenAdjusted === 'YES'
        ? t.getSlideFieldTranslation('afterAdjustment')
        : t.getSlideFieldTranslation('measurements');
    doc.text(measurementLabel, margin + 2, yPosition);
    yPosition += 3;

    autoTable(doc, {
      startY: yPosition,
      head: [
        ['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', t.getSlideFieldTranslation('maxDeviation')],
      ],
      body: [
        [
          displayValue(data.afterPosition1),
          displayValue(data.afterPosition2),
          displayValue(data.afterPosition3),
          displayValue(data.afterPosition4),
          displayValue(data.afterPosition5),
          calculateSlideMaxDeviation(data, 'after'),
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7 },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  };

  if (slideData.outerData) {
    renderSlideData(slideData.outerData, t.getMeasurementsTranslation('outerMeasurements'));
  }

  if (slideData.innerData) {
    renderSlideData(slideData.innerData, t.getMeasurementsTranslation('innerMeasurements'));
  }

  if (slideData.notes) {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getSlideFieldTranslation('notes'), margin + 2, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(slideData.notes, contentWidth - 10);
    doc.text(splitNotes, margin + 2, yPosition);
    yPosition += splitNotes.length * 4 + 5;
  }

  return yPosition;
}

function renderGibs(
  doc: jsPDF,
  gibsData: GibsSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
): number {
  const renderGibsStage = (
    stageData: GibsStageData | undefined,
    stageName: string,
    isOuter: boolean = false,
  ) => {
    if (!stageData) return;

    const frontToBackPoints = [1, 2, 3, 4, 5, 6, 7, 8];
    const leftToRightPoints = [9, 10, 11, 12, 13, 14, 15, 16];

    const hasFrontToBack = frontToBackPoints.some(
      (i) => (stageData as Record<string, unknown>)[`point${i}`] !== undefined,
    );
    const hasLeftToRight = leftToRightPoints.some(
      (i) => (stageData as Record<string, unknown>)[`point${i}`] !== undefined,
    );

    if (!hasFrontToBack && !hasLeftToRight) return;

    checkPageBreak(40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(stageName, margin + 2, yPosition);
    yPosition += 4;

    const calculated = calculateGibsFields(stageData);

    if (hasFrontToBack) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(t.getGibsFieldTranslation('frontToBackTitle'), margin + 3, yPosition);
      yPosition += 3;

      // Points row
      autoTable(doc, {
        startY: yPosition,
        head: [['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']],
        body: [
          [
            displayValue(stageData.point1),
            displayValue(stageData.point2),
            displayValue(stageData.point3),
            displayValue(stageData.point4),
            displayValue(stageData.point5),
            displayValue(stageData.point6),
            displayValue(stageData.point7),
            displayValue(stageData.point8),
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 6, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 6, halign: 'center' },
        margin: { left: margin + 3, right: margin },
        tableWidth: contentWidth / 2,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;

      // Calculated sums
      const sumRows: string[][] = [
        [
          t.getGibsFieldTranslation('top'),
          calculated.frontTop.toFixed(4),
          calculated.backTop.toFixed(4),
        ],
      ];
      if (!isOuter) {
        sumRows.push([
          t.getGibsFieldTranslation('bottom'),
          calculated.frontBottom.toFixed(4),
          calculated.backBottom.toFixed(4),
        ]);
      }

      autoTable(doc, {
        startY: yPosition,
        head: [['', t.getGibsFieldTranslation('left'), t.getGibsFieldTranslation('right')]],
        body: sumRows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 6, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 6, halign: 'center' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        margin: { left: margin + 3, right: margin },
        tableWidth: contentWidth / 3,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;
    }

    if (hasLeftToRight) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(t.getGibsFieldTranslation('leftToRightTitle'), margin + 3, yPosition);
      yPosition += 3;

      // Points row
      autoTable(doc, {
        startY: yPosition,
        head: [['P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16']],
        body: [
          [
            displayValue(stageData.point9),
            displayValue(stageData.point10),
            displayValue(stageData.point11),
            displayValue(stageData.point12),
            displayValue(stageData.point13),
            displayValue(stageData.point14),
            displayValue(stageData.point15),
            displayValue(stageData.point16),
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 6, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 6, halign: 'center' },
        margin: { left: margin + 3, right: margin },
        tableWidth: contentWidth / 2,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 2;

      // Calculated sums
      const lrRows: string[][] = [
        [
          t.getGibsFieldTranslation('front'),
          calculated.leftTop.toFixed(4),
          calculated.leftBottom.toFixed(4),
        ],
        [
          t.getGibsFieldTranslation('back'),
          calculated.rightTop.toFixed(4),
          calculated.rightBottom.toFixed(4),
        ],
      ];
      if (calculated.usable !== undefined) {
        lrRows.push([t.getGibsFieldTranslation('usable'), calculated.usable.toFixed(4), '']);
      }

      autoTable(doc, {
        startY: yPosition,
        head: [['', t.getGibsFieldTranslation('top'), t.getGibsFieldTranslation('bottom')]],
        body: lrRows,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 6, textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 6, halign: 'center' },
        columnStyles: { 0: { fontStyle: 'bold' } },
        margin: { left: margin + 3, right: margin },
        tableWidth: contentWidth / 3,
      });
      yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
    }
  };

  // Outer stages
  if (gibsData.outerBefore || gibsData.outerData || gibsData.outerFreeHangingData) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${t.getTableTranslation('outer')} ${t.getGibsFieldTranslation('directionalTitle')}`,
      margin + 2,
      yPosition,
    );
    yPosition += 5;
    renderGibsStage(gibsData.outerBefore, t.getGibsFieldTranslation('beforeAdjustment'), true);
    renderGibsStage(gibsData.outerData, t.getGibsFieldTranslation('afterAdjustment'), true);
    renderGibsStage(
      gibsData.outerFreeHangingData,
      t.getGibsFieldTranslation('freeHangingAfterInstall'),
      true,
    );
  }

  // Inner stages
  if (
    gibsData.innerBefore ||
    gibsData.innerData ||
    gibsData.innerBeforeTool ||
    gibsData.innerDataTool
  ) {
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${t.getTableTranslation('inner')} ${t.getGibsFieldTranslation('directionalTitle')}`,
      margin + 2,
      yPosition,
    );
    yPosition += 5;
    renderGibsStage(gibsData.innerBefore, t.getGibsFieldTranslation('beforeAdjustment'));
    renderGibsStage(gibsData.innerData, t.getGibsFieldTranslation('afterAdjustment'));
    renderGibsStage(gibsData.innerBeforeTool, t.getGibsFieldTranslation('beforeToolInstallation'));
    renderGibsStage(gibsData.innerDataTool, t.getGibsFieldTranslation('afterToolInstallation'));
  }

  if (gibsData.notes) {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('notes'), margin + 2, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(gibsData.notes, contentWidth - 10);
    doc.text(splitNotes, margin + 2, yPosition);
    yPosition += splitNotes.length * 4 + 5;
  }

  return yPosition;
}

function renderLubrication(
  doc: jsPDF,
  lubricationData: LubricationSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  checkPageBreak(30);

  // Scalar fields
  const scalarRows: string[][] = [
    [
      t.getLubricationFieldTranslation('changedOil'),
      translateEnumValue(lubricationData.changedOil, enumTranslations),
    ],
    [
      t.getLubricationFieldTranslation('oilTemperature'),
      displayValue(lubricationData.oilTemperature),
    ],
    [t.getLubricationFieldTranslation('oilMfgType'), displayValue(lubricationData.oilMfgType)],
    [
      t.getLubricationFieldTranslation('changedFilter'),
      translateEnumValue(lubricationData.changedFilter, enumTranslations),
    ],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
    body: scalarRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 7 },
    margin: { left: margin + 2, right: margin },
  });
  yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // Gauges
  const gauges = lubricationData.gauges || [];
  if (gauges.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('gauges'), margin + 2, yPosition);
    yPosition += 4;

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          t.getTableTranslation('system'),
          t.getTableTranslation('gauge'),
          t.getTableTranslation('psi'),
        ],
      ],
      body: gauges.map((gauge) => [
        displayValue(gauge.system),
        displayValue(gauge.gaugeSwitchIdentifier),
        displayValue(gauge.psi),
      ]),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7 },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  return yPosition;
}

function renderClutch(
  doc: jsPDF,
  clutchData: ClutchSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  // Helper to get clutch field value
  const getClutchValue = (key: keyof ClutchSectionData, combine?: boolean): string => {
    if (combine && key.toString().endsWith('Value')) {
      const baseKey = key.toString().replace('Value', '');
      const value = clutchData[key];
      const unit = clutchData[`${baseKey}Unit` as keyof ClutchSectionData];
      return value !== null && value !== undefined && value !== ''
        ? `${value} ${unit || 'PSI'}`
        : '-';
    }
    return translateEnumValue(clutchData[key], enumTranslations);
  };

  // Build all clutch data as a single table with section headers
  const clutchTableData: (string | { content: string; colSpan: number; styles: object })[][] = [];

  // Basic Information section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('basicInformation'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([t.getClutchFieldTranslation('clutchType'), getClutchValue('clutchType')]);
  clutchTableData.push([
    t.getClutchFieldTranslation('clutchLocation'),
    getClutchValue('clutchLocation'),
  ]);

  // Brake Spring Settings section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('brakeSpringSettings'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeSpringBrake'),
    getClutchValue('brakeSpringBrake'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeSpringClutch'),
    getClutchValue('brakeSpringClutch'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeSpringFB'),
    getClutchValue('brakeSpringFB'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeSpringFTB'),
    getClutchValue('brakeSpringFTB'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeSpringRTB'),
    getClutchValue('brakeSpringRTB'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeSpringStudBolt'),
    getClutchValue('brakeSpringStudBolt'),
  ]);

  // Brake Measurements section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('brakeMeasurements'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeStoppingTime'),
    getClutchValue('brakeStoppingTime'),
  ]);
  clutchTableData.push([t.getClutchFieldTranslation('brakeLining'), getClutchValue('brakeLining')]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeClearing'),
    getClutchValue('brakeClearing'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeClearanceTotal'),
    getClutchValue('brakeClearanceTotal'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('brakeClearanceRear'),
    getClutchValue('brakeClearanceRear'),
  ]);

  // Flywheel section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('flywheel'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('flywheelStoppingTime'),
    getClutchValue('flywheelStoppingTime'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('flywheelBearings'),
    getClutchValue('flywheelBearings'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('flywheelBrake'),
    getClutchValue('flywheelBrake'),
  ]);

  // Clutch & Seals section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('clutchSeals'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([t.getClutchFieldTranslation('rotaryUnion'), getClutchValue('rotaryUnion')]);
  clutchTableData.push([
    t.getClutchFieldTranslation('clutchEngagements'),
    getClutchValue('clutchEngagements'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('clutchLining'),
    getClutchValue('clutchLining'),
  ]);
  clutchTableData.push([t.getClutchFieldTranslation('clutchSeals'), getClutchValue('clutchSeals')]);
  clutchTableData.push([
    t.getClutchFieldTranslation('separateBrakeSeals'),
    getClutchValue('separateBrakeSeals'),
  ]);
  clutchTableData.push([t.getClutchFieldTranslation('flexDisc'), getClutchValue('flexDisc')]);

  // Adjustments section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('adjustments'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('splinesDriveRingDisc'),
    getClutchValue('splinesDriveRingDisc'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('adjustingNutLockSecure'),
    getClutchValue('adjustingNutLockSecure'),
  ]);

  // Gear Backlash section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('gearBacklash'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchSectionTranslation('before'),
    getClutchValue('gearBacklashBefore'),
  ]);
  clutchTableData.push([
    t.getClutchSectionTranslation('after'),
    getClutchValue('gearBacklashAfter'),
  ]);

  // Crank Endplay section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('crankEndplay'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchSectionTranslation('before'),
    getClutchValue('crankEndplayBefore'),
  ]);
  clutchTableData.push([
    t.getClutchSectionTranslation('after'),
    getClutchValue('crankEndplayAfter'),
  ]);

  // Air System section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('airSystem'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('airRegulator'),
    getClutchValue('airRegulatorValue', true),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('airClutchTravel'),
    getClutchValue('airClutchTravel'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('airLineOilerSetting'),
    getClutchValue('airLineOilerSetting'),
  ]);

  // Hydraulic System section
  clutchTableData.push([
    {
      content: t.getClutchSectionTranslation('hydraulicSystem'),
      colSpan: 2,
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    },
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('hydClutchClearanceTotal'),
    getClutchValue('hydClutchClearanceTotal'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('hydClutchClearanceRear'),
    getClutchValue('hydClutchClearanceRear'),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('hydraulicPressure'),
    getClutchValue('hydraulicPressureValue', true),
  ]);
  clutchTableData.push([
    t.getClutchFieldTranslation('accumulator'),
    getClutchValue('accumulatorValue', true),
  ]);

  checkPageBreak(100);
  autoTable(doc, {
    startY: yPosition,
    head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
    body: clutchTableData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: contentWidth - 80 },
    },
    margin: { left: margin + 2, right: margin },
  });
  yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  // Notes
  if (clutchData.notes) {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('notes'), margin + 2, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(String(clutchData.notes), contentWidth - 10);
    doc.text(splitNotes, margin + 2, yPosition);
    yPosition += splitNotes.length * 4 + 5;
  }

  return yPosition;
}

function renderCounterbalance(
  doc: jsPDF,
  counterbalanceData: CounterbalanceSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  const counterbalanceFields = [
    'counterbalanceType',
    'airbagPistonSeals',
    'airbagPistonSealsLeakLocation',
    'regulator',
    'gauge',
    'pneumaticsPlumbing',
    'rodSeals',
    'rodBushing',
    'oilWick',
  ];

  // Helper to get counterbalance value
  const getCbValue = (data: CounterbalanceData | undefined, field: string): string => {
    if (!data) return '-';
    return translateEnumValue(data[field as keyof CounterbalanceData], enumTranslations);
  };

  // Create a side-by-side table with Outer and Inner columns
  const hasOuter = !!counterbalanceData.outerData;
  const hasInner = !!counterbalanceData.innerData;

  if (hasOuter || hasInner) {
    checkPageBreak(50);

    // Build table with 3 columns: Field, Outer, Inner
    const cbTableData: string[][] = counterbalanceFields.map((field) => [
      t.getCounterbalanceFieldTranslation(field),
      getCbValue(counterbalanceData.outerData, field),
      getCbValue(counterbalanceData.innerData, field),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          t.getTableTranslation('field'),
          t.getTableTranslation('outer'),
          t.getTableTranslation('inner'),
        ],
      ],
      body: cbTableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: (contentWidth - 70) / 2, halign: 'center' },
        2: { cellWidth: (contentWidth - 70) / 2, halign: 'center' },
      },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  }

  if (counterbalanceData.notes) {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('notes'), margin + 2, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(counterbalanceData.notes, contentWidth - 10);
    doc.text(splitNotes, margin + 2, yPosition);
    yPosition += splitNotes.length * 4 + 5;
  }

  return yPosition;
}

function renderTramming(
  doc: jsPDF,
  trammingData: TrammingSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  checkPageBreak(20);

  // Basic fields as a proper table
  const basicRows: string[][] = [
    [
      t.getTrammingFieldTranslation('slideTram'),
      translateEnumValue(trammingData.slideTram, enumTranslations),
    ],
    [t.getTrammingFieldTranslation('unit'), trammingData.unit || 'inches'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
    body: basicRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: contentWidth - 80 },
    },
    margin: { left: margin + 2, right: margin },
  });
  yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  const renderTrammingData = (data: TrammingData | undefined, title: string) => {
    if (!data) return;

    checkPageBreak(40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    yPosition += 4;

    // Field names now match Prisma directly (without outer/inner prefix)
    const points = [
      {
        label: t.getTrammingFieldTranslation('top'),
        top: 'topTop',
        bottom: 'topBottom',
        left: 'topLeft',
        right: 'topRight',
      },
      {
        label: t.getTrammingFieldTranslation('bottom'),
        top: 'bottomTop',
        bottom: 'bottomBottom',
        left: 'bottomLeft',
        right: 'bottomRight',
      },
      {
        label: t.getTrammingFieldTranslation('left'),
        top: 'leftTop',
        bottom: 'leftBottom',
        left: 'leftLeft',
        right: 'leftRight',
      },
      {
        label: t.getTrammingFieldTranslation('right'),
        top: 'rightTop',
        bottom: 'rightBottom',
        left: 'rightLeft',
        right: 'rightRight',
      },
    ];

    const rows: string[][] = points.map((point) => [
      point.label,
      displayValue((data as Record<string, unknown>)[point.top]),
      displayValue((data as Record<string, unknown>)[point.bottom]),
      displayValue((data as Record<string, unknown>)[point.left]),
      displayValue((data as Record<string, unknown>)[point.right]),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          t.getTableTranslation('position'),
          t.getTrammingFieldTranslation('top'),
          t.getTrammingFieldTranslation('bottom'),
          t.getTrammingFieldTranslation('left'),
          t.getTrammingFieldTranslation('right'),
        ],
      ],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7, halign: 'center' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  };

  renderTrammingData(trammingData.outerData, t.getMeasurementsTranslation('outerMeasurements'));
  renderTrammingData(trammingData.innerData, t.getMeasurementsTranslation('innerMeasurements'));

  if (trammingData.notes) {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('notes'), margin + 2, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(trammingData.notes, contentWidth - 10);
    doc.text(splitNotes, margin + 2, yPosition);
    yPosition += splitNotes.length * 4 + 5;
  }

  return yPosition;
}

function renderPistons(
  doc: jsPDF,
  pistonsData: PistonsSectionData,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  checkPageBreak(25);

  // Top-level fields as a proper table
  const topRows: string[][] = [
    [
      t.getPistonsFieldTranslation('guideSeals'),
      translateEnumValue(pistonsData.guideSeals, enumTranslations),
    ],
    [
      t.getPistonsFieldTranslation('pistonSeals'),
      translateEnumValue(pistonsData.pistonSeals, enumTranslations),
    ],
    [
      t.getPistonsFieldTranslation('vacuumSystem'),
      translateEnumValue(pistonsData.vacuumSystem, enumTranslations),
    ],
    [
      t.getPistonsFieldTranslation('vacuumSystemAirPressureSetting'),
      pistonsData.vacuumSystemAirPressureSetting
        ? `${pistonsData.vacuumSystemAirPressureSetting} ${pistonsData.vacuumSystemAirPressureUnit || 'PSI'}`
        : '-',
    ],
    [t.getPistonsFieldTranslation('unit'), pistonsData.unit || 'inches'],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
    body: topRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: contentWidth - 80 },
    },
    margin: { left: margin + 2, right: margin },
  });
  yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;

  const renderPistonsData = (data: PistonsData | undefined, title: string) => {
    if (!data) return;

    checkPageBreak(30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    yPosition += 4;

    // Field names now match Prisma directly (without outer/inner prefix)
    const pistons = [
      {
        label: t.getTableTranslation('lh'),
        top: 'lhTop',
        bottom: 'lhBottom',
        left: 'lhLeft',
        right: 'lhRight',
      },
      {
        label: t.getTableTranslation('rh'),
        top: 'rhTop',
        bottom: 'rhBottom',
        left: 'rhLeft',
        right: 'rhRight',
      },
    ];

    const rows: string[][] = pistons.map((piston) => [
      piston.label,
      displayValue((data as Record<string, unknown>)[piston.top]),
      displayValue((data as Record<string, unknown>)[piston.bottom]),
      displayValue((data as Record<string, unknown>)[piston.left]),
      displayValue((data as Record<string, unknown>)[piston.right]),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          t.getPistonsFieldTranslation('piston'),
          t.getPistonsFieldTranslation('top'),
          t.getPistonsFieldTranslation('bottom'),
          t.getTrammingFieldTranslation('left'),
          t.getTrammingFieldTranslation('right'),
        ],
      ],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7, halign: 'center' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  };

  renderPistonsData(pistonsData.outerData, t.getMeasurementsTranslation('outerMeasurements'));
  renderPistonsData(pistonsData.innerData, t.getMeasurementsTranslation('innerMeasurements'));

  if (pistonsData.notes) {
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(t.getServiceTranslation('notes'), margin + 2, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(pistonsData.notes, contentWidth - 10);
    doc.text(splitNotes, margin + 2, yPosition);
    yPosition += splitNotes.length * 4 + 5;
  }

  return yPosition;
}

function renderGenericSection(
  doc: jsPDF,
  genericData: Record<string, unknown>,
  t: TranslationCallbacks,
  yPosition: number,
  margin: number,
  contentWidth: number,
  primaryColor: [number, number, number],
  checkPageBreak: (space: number) => void,
  getEnumTranslations: () => { yes: string; no: string; dnc: string; na: string },
): number {
  const enumTranslations = getEnumTranslations();

  checkPageBreak(30);

  const scalarFields = Object.entries(genericData).filter(
    ([key, value]) =>
      key !== 'gauges' &&
      key !== 'id' &&
      key !== 'createdAt' &&
      key !== 'updatedAt' &&
      (typeof value !== 'object' || value === null) &&
      value !== null &&
      value !== undefined &&
      value !== '',
  );

  if (scalarFields.length > 0) {
    const rows: string[][] = scalarFields.map(([key, value]) => [
      formatFieldName(key),
      translateEnumValue(value, enumTranslations),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [[t.getTableTranslation('field'), t.getTableTranslation('value')]],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, fontSize: 7, textColor: [255, 255, 255] },
      bodyStyles: { fontSize: 7 },
      margin: { left: margin + 2, right: margin },
    });
    yPosition = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  return yPosition;
}
