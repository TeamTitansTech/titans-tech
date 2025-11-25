import { utils, writeFile } from 'xlsx';
import { format } from 'date-fns';
import type {
  ExportData,
  BearingClearanceSectionData,
  SlideSectionData,
  GibsSectionData,
  GibsStageData,
  LubricationSectionData,
} from './types';
import {
  formatFieldName,
  displayValue,
  extractBearingRows,
  hasActualData,
  calculateSlideMaxDeviation,
  calculateGibsFields,
} from './helpers';

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
        const outerDataObj = bearingData?.outerData;
        const outerBefore = bearingData?.outerBefore;
        const innerDataObj = bearingData?.innerData;
        const innerBefore = bearingData?.innerBefore;
        sheetData.push([
          'Combined With',
          displayValue(outerDataObj?.combinedWith || outerBefore?.combinedWith),
        ]);
        sheetData.push([
          'Mating Part',
          displayValue(outerDataObj?.matingPart || outerBefore?.matingPart),
        ]);
        sheetData.push([
          'Has Been Adjusted',
          displayValue(outerDataObj?.hasBeenAdjusted || outerBefore?.hasBeenAdjusted),
        ]);
        sheetData.push([]);
        sheetData.push(['Inner']);
        sheetData.push([
          'Combined With',
          displayValue(innerDataObj?.combinedWith || innerBefore?.combinedWith),
        ]);
        sheetData.push([
          'Mating Part',
          displayValue(innerDataObj?.matingPart || innerBefore?.matingPart),
        ]);
        sheetData.push([
          'Has Been Adjusted',
          displayValue(innerDataObj?.hasBeenAdjusted || innerBefore?.hasBeenAdjusted),
        ]);
        sheetData.push([]);

        // Shutdown Adjustment Mechanism
        sheetData.push(['Shutdown Adjustment Mechanism']);
        sheetData.push([
          'Slide Motor/Mounts',
          displayValue(outerDataObj?.slideMotorMounts || outerBefore?.slideMotorMounts),
        ]);
        sheetData.push([
          'Power Cord/Hoses',
          displayValue(outerDataObj?.powerCordHoses || outerBefore?.powerCordHoses),
        ]);
        sheetData.push([
          'Chains & Gears/Sprockets',
          displayValue(outerDataObj?.chainsGearsSprockets || outerBefore?.chainsGearsSprockets),
        ]);
        sheetData.push([
          'Locking Clamps',
          displayValue(outerDataObj?.lockingClamps || outerBefore?.lockingClamps),
        ]);
        if (outerDataObj?.notes || outerBefore?.notes) {
          sheetData.push(['Notes', displayValue(outerDataObj?.notes || outerBefore?.notes)]);
        }
      }
    }

    // Slide Section
    else if (sectionKey === 'SLIDE') {
      const slideData = sectionData as unknown as SlideSectionData;
      sheetData.push([sectionName]);
      sheetData.push([]);

      if (slideData.outerData) {
        sheetData.push(['Outer Measurements']);
        const outerData = slideData.outerData;

        // Metadata
        sheetData.push(['Field', 'Value']);
        sheetData.push(['Parallelism', displayValue(outerData.parallelism)]);
        sheetData.push([
          'Has Parallelism Been Adjusted',
          displayValue(outerData.hasParallelismBeenAdjusted),
        ]);
        sheetData.push([
          'Shutheight Indicators Checked',
          displayValue(outerData.shutheightIndicatorsChecked),
        ]);
        sheetData.push([
          'Overloads On Tonnage Monitor',
          displayValue(outerData.overloadsOnTonnageMonitor),
        ]);
        sheetData.push(['Shutheight Actual SH', displayValue(outerData.shutheightActualSh)]);
        sheetData.push(['Indicator Reading', displayValue(outerData.indicatorReading)]);
        sheetData.push([]);

        // Before measurements
        if (
          outerData.hasParallelismBeenAdjusted === 'YES' &&
          outerData.beforePosition1 !== undefined
        ) {
          sheetData.push(['Before Adjustment']);
          sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Max Deviation']);
          sheetData.push([
            displayValue(outerData.beforePosition1),
            displayValue(outerData.beforePosition2),
            displayValue(outerData.beforePosition3),
            displayValue(outerData.beforePosition4),
            displayValue(outerData.beforePosition5),
            calculateSlideMaxDeviation(outerData, 'before'),
          ]);
          sheetData.push([]);
        }

        // After measurements
        sheetData.push([
          outerData.hasParallelismBeenAdjusted === 'YES' ? 'After Adjustment' : 'Measurements',
        ]);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Max Deviation']);
        sheetData.push([
          displayValue(outerData.afterPosition1),
          displayValue(outerData.afterPosition2),
          displayValue(outerData.afterPosition3),
          displayValue(outerData.afterPosition4),
          displayValue(outerData.afterPosition5),
          calculateSlideMaxDeviation(outerData, 'after'),
        ]);
        sheetData.push([]);
      }

      if (slideData.innerData) {
        sheetData.push(['Inner Measurements']);
        const innerData = slideData.innerData;

        // Metadata
        sheetData.push(['Field', 'Value']);
        sheetData.push(['Parallelism', displayValue(innerData.parallelism)]);
        sheetData.push([
          'Has Parallelism Been Adjusted',
          displayValue(innerData.hasParallelismBeenAdjusted),
        ]);
        sheetData.push([
          'Shutheight Indicators Checked',
          displayValue(innerData.shutheightIndicatorsChecked),
        ]);
        sheetData.push([
          'Overloads On Tonnage Monitor',
          displayValue(innerData.overloadsOnTonnageMonitor),
        ]);
        sheetData.push(['Shutheight Actual SH', displayValue(innerData.shutheightActualSh)]);
        sheetData.push(['Indicator Reading', displayValue(innerData.indicatorReading)]);
        sheetData.push([]);

        // Before measurements
        if (
          innerData.hasParallelismBeenAdjusted === 'YES' &&
          innerData.beforePosition1 !== undefined
        ) {
          sheetData.push(['Before Adjustment']);
          sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Max Deviation']);
          sheetData.push([
            displayValue(innerData.beforePosition1),
            displayValue(innerData.beforePosition2),
            displayValue(innerData.beforePosition3),
            displayValue(innerData.beforePosition4),
            displayValue(innerData.beforePosition5),
            calculateSlideMaxDeviation(innerData, 'before'),
          ]);
          sheetData.push([]);
        }

        // After measurements
        sheetData.push([
          innerData.hasParallelismBeenAdjusted === 'YES' ? 'After Adjustment' : 'Measurements',
        ]);
        sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Max Deviation']);
        sheetData.push([
          displayValue(innerData.afterPosition1),
          displayValue(innerData.afterPosition2),
          displayValue(innerData.afterPosition3),
          displayValue(innerData.afterPosition4),
          displayValue(innerData.afterPosition5),
          calculateSlideMaxDeviation(innerData, 'after'),
        ]);
        sheetData.push([]);
      }

      if (slideData.notes) {
        sheetData.push(['Notes', slideData.notes]);
      }
    }

    // Gibs Section
    else if (sectionKey === 'GIBS') {
      const gibsData = sectionData as unknown as GibsSectionData;
      sheetData.push([sectionName]);
      sheetData.push([]);

      const renderGibsStage = (stageData: GibsStageData | undefined, stageName: string) => {
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

        sheetData.push([stageName]);
        const calculated = calculateGibsFields(stageData);

        if (hasFrontToBack) {
          sheetData.push(['Front to Back Points']);
          sheetData.push(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
          sheetData.push([
            displayValue(stageData.point1),
            displayValue(stageData.point2),
            displayValue(stageData.point3),
            displayValue(stageData.point4),
            displayValue(stageData.point5),
            displayValue(stageData.point6),
            displayValue(stageData.point7),
            displayValue(stageData.point8),
          ]);
          sheetData.push(['', 'Left', 'Right']);
          sheetData.push(['Top', calculated.frontTop.toFixed(4), calculated.backTop.toFixed(4)]);
          sheetData.push([
            'Bottom',
            calculated.frontBottom.toFixed(4),
            calculated.backBottom.toFixed(4),
          ]);
          sheetData.push([]);
        }

        if (hasLeftToRight) {
          sheetData.push(['Left to Right Points']);
          sheetData.push(['P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16']);
          sheetData.push([
            displayValue(stageData.point9),
            displayValue(stageData.point10),
            displayValue(stageData.point11),
            displayValue(stageData.point12),
            displayValue(stageData.point13),
            displayValue(stageData.point14),
            displayValue(stageData.point15),
            displayValue(stageData.point16),
          ]);
          sheetData.push(['', 'Top', 'Bottom']);
          sheetData.push([
            'Front',
            calculated.leftTop.toFixed(4),
            calculated.leftBottom.toFixed(4),
          ]);
          sheetData.push([
            'Back',
            calculated.rightTop.toFixed(4),
            calculated.rightBottom.toFixed(4),
          ]);
          if (calculated.usable !== undefined) {
            sheetData.push(['Usable', calculated.usable.toFixed(4)]);
          }
          sheetData.push([]);
        }
      };

      renderGibsStage(gibsData.outerBeforeAdjustment, 'Outer - Before Adjustment');
      renderGibsStage(gibsData.outerAfterAdjustment, 'Outer - After Adjustment');
      renderGibsStage(gibsData.outerFreeHangingAfterInstall, 'Outer - Free Hanging After Install');
      renderGibsStage(gibsData.innerBeforeAdjustment, 'Inner - Before Adjustment');
      renderGibsStage(gibsData.innerAfterAdjustment, 'Inner - After Adjustment');
      renderGibsStage(gibsData.innerBeforeToolInstallation, 'Inner - Before Tool Installation');
      renderGibsStage(gibsData.innerAfterToolInstallation, 'Inner - After Tool Installation');

      if (gibsData.notes) {
        sheetData.push(['Notes', gibsData.notes]);
      }
    }

    // Other Sections
    else {
      const otherData = sectionData as unknown as Record<string, unknown>;
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
      const gauges = Array.isArray((otherData as LubricationSectionData).gauges)
        ? (otherData as LubricationSectionData).gauges
        : [];
      if (gauges && gauges.length > 0) {
        sheetData.push(['Gauges']);
        sheetData.push(['System', 'Gauge', 'PSI']);
        gauges.forEach((gauge) => {
          sheetData.push([
            displayValue(gauge.system),
            displayValue(gauge.gaugeSwitchIdentifier),
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
