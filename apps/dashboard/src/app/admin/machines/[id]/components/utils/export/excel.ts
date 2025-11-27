import { utils, writeFile, type WorkSheet } from 'xlsx';
import { format } from 'date-fns';
import type {
  ExportData,
  TranslationCallbacks,
  BearingClearanceSectionData,
  SlideSectionData,
  GibsSectionData,
  GibsStageData,
  LubricationSectionData,
  ClutchSectionData,
  CounterbalanceSectionData,
  TrammingSectionData,
  PistonsSectionData,
} from './types';
import {
  formatFieldName,
  displayValue,
  extractBearingRows,
  hasActualData,
  calculateSlideMaxDeviation,
  calculateGibsFields,
} from './helpers';

// Helper to set column widths
function setColumnWidths(sheet: WorkSheet, widths: number[]) {
  sheet['!cols'] = widths.map((w) => ({ wch: w }));
}

export function exportToExcel(data: ExportData): void {
  const { service, completedSections, completedSectionData, translationCallbacks } = data;

  // Default translation callbacks if not provided
  const t: TranslationCallbacks = translationCallbacks || {
    getSectionName: (key: string) => key,
    getServiceTypeName: () => service.type || 'Service',
    getTableTranslation: (key: string) => key,
    getBearingFieldTranslation: (key: string) => formatFieldName(key),
    getSlideFieldTranslation: (key: string) => formatFieldName(key),
    getGibsFieldTranslation: (key: string) => formatFieldName(key),
    getLubricationFieldTranslation: (key: string) => formatFieldName(key),
    getClutchFieldTranslation: (key: string) => formatFieldName(key),
    getClutchSectionTranslation: (key: string) => formatFieldName(key),
    getCounterbalanceFieldTranslation: (key: string) => formatFieldName(key),
    getTrammingFieldTranslation: (key: string) => formatFieldName(key),
    getPistonsFieldTranslation: (key: string) => formatFieldName(key),
    getServiceTranslation: (key: string) => formatFieldName(key),
    getCommonStatusTranslation: (key: string) => key,
    getMeasurementsTranslation: (key: string) => formatFieldName(key),
    getInspectionEnumTranslation: (_enumType: string, value: string) => value || '-',
  };

  const workbook = utils.book_new();
  const sheetData: unknown[][] = [];

  // ============================================================================
  // Service Details Header
  // ============================================================================
  sheetData.push(['RELATÓRIO DE SERVIÇO']);
  sheetData.push([]);
  sheetData.push(['Tipo de Serviço:', t.getServiceTypeName()]);
  sheetData.push(['Data:', service.date ? format(new Date(service.date), 'dd/MM/yyyy') : '-']);
  sheetData.push(['Realizado por:', service.performedBy || '-']);
  sheetData.push([]);

  // Observation Fields (if present)
  if (service.isPressLevel || service.driveBeltCondition || service.areAllProtectiveCovers) {
    sheetData.push(['OBSERVAÇÕES DA INSPEÇÃO']);
    sheetData.push([]);
    if (service.isPressLevel) {
      sheetData.push([
        'Prensa Nivelada:',
        t.getInspectionEnumTranslation('yesNoNaDnc', service.isPressLevel),
      ]);
    }
    if (service.driveBeltCondition) {
      sheetData.push([
        'Condição da Correia:',
        t.getInspectionEnumTranslation('driveBeltCondition', service.driveBeltCondition),
      ]);
    }
    if (service.areAllProtectiveCovers) {
      sheetData.push([
        'Capas Protetoras:',
        t.getInspectionEnumTranslation('protectiveCoversStatus', service.areAllProtectiveCovers),
      ]);
    }
    if (service.areAllProtectiveCovers === 'NO' && service.whyNotCovered) {
      sheetData.push([
        'Motivo:',
        t.getInspectionEnumTranslation('whyNotCovered', service.whyNotCovered),
      ]);
    }
    if (service.protectiveCoversExplanation) {
      sheetData.push(['Explicação:', service.protectiveCoversExplanation]);
    }
    if (service.areCracksVisible) {
      sheetData.push([
        'Trincas Visíveis:',
        t.getInspectionEnumTranslation('yesNoDnc', service.areCracksVisible),
      ]);
    }
    if (service.areCracksVisible === 'YES' && service.cracksLocation) {
      sheetData.push(['Localização:', service.cracksLocation]);
    }
    if (service.isMainMotorSecure) {
      sheetData.push([
        'Motor Principal Seguro:',
        t.getInspectionEnumTranslation('yesNoDnc', service.isMainMotorSecure),
      ]);
    }
    if (service.isMotorPlateSecure) {
      sheetData.push([
        'Placa do Motor Segura:',
        t.getInspectionEnumTranslation('yesNoDnc', service.isMotorPlateSecure),
      ]);
    }
    sheetData.push([]);
  }

  // ============================================================================
  // Each Section's Data
  // ============================================================================
  completedSections.forEach((sectionKey) => {
    const sectionData = completedSectionData[sectionKey];
    const sectionName = t.getSectionName(sectionKey);

    sheetData.push(['═══════════════════════════════════════════════════════════════']);
    sheetData.push([sectionName.toUpperCase()]);
    sheetData.push(['═══════════════════════════════════════════════════════════════']);
    sheetData.push([]);

    // Bearing Clearance Section
    if (sectionKey === 'BEARING_CLEARANCE') {
      addBearingClearanceData(sheetData, sectionData as unknown as BearingClearanceSectionData);
    }
    // Slide Section
    else if (sectionKey === 'SLIDE') {
      addSlideData(sheetData, sectionData as unknown as SlideSectionData);
    }
    // Gibs Section
    else if (sectionKey === 'GIBS') {
      addGibsData(sheetData, sectionData as unknown as GibsSectionData);
    }
    // Clutch Section
    else if (sectionKey === 'CLUTCH') {
      addClutchData(sheetData, sectionData as unknown as ClutchSectionData);
    }
    // Lubrication Section
    else if (sectionKey === 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER') {
      addLubricationData(sheetData, sectionData as unknown as LubricationSectionData);
    }
    // Counterbalance Section
    else if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG') {
      addCounterbalanceData(sheetData, sectionData as unknown as CounterbalanceSectionData);
    }
    // Tramming Section
    else if (sectionKey === 'TRAMMING') {
      addTrammingData(sheetData, sectionData as unknown as TrammingSectionData);
    }
    // Pistons Section
    else if (sectionKey === 'PISTONS') {
      addPistonsData(sheetData, sectionData as unknown as PistonsSectionData);
    }
    // Generic fallback
    else {
      const otherData = sectionData as unknown as Record<string, unknown>;
      Object.entries(otherData)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .forEach(([key, value]) => {
          if (typeof value !== 'object') {
            sheetData.push([formatFieldName(key), displayValue(value)]);
          }
        });
    }

    sheetData.push([]);
  });

  const sheet = utils.aoa_to_sheet(sheetData);
  setColumnWidths(sheet, [35, 15, 15, 15, 15, 15, 15, 15]);
  utils.book_append_sheet(workbook, sheet, 'Relatório');

  // Generate filename
  const filename = `${t.getServiceTypeName()}_${service.date ? format(new Date(service.date), 'yyyy-MM-dd') : 'report'}.xlsx`;
  writeFile(workbook, filename);
}

// ============================================================================
// BEARING CLEARANCE
// ============================================================================
function addBearingClearanceData(sheetData: unknown[][], data: BearingClearanceSectionData) {
  const hasBeforeData =
    (data?.outerBefore && hasActualData(data.outerBefore)) ||
    (data?.innerBefore && hasActualData(data.innerBefore));
  const hasAfterData =
    (data?.outerData && hasActualData(data.outerData)) ||
    (data?.innerData && hasActualData(data.innerData));

  if (hasBeforeData) {
    sheetData.push(['ANTES DA MANUTENÇÃO']);
    sheetData.push([]);

    if (data?.outerBefore && hasActualData(data.outerBefore)) {
      sheetData.push(['Externo']);
      sheetData.push(['Campo', 'LH', 'RH', 'Diff']);
      extractBearingRows(data.outerBefore).forEach((row) => {
        sheetData.push([
          formatFieldName(row.field),
          displayValue(row.lh),
          displayValue(row.rh),
          row.differential,
        ]);
      });
      sheetData.push([]);
    }

    if (data?.innerBefore && hasActualData(data.innerBefore)) {
      sheetData.push(['Interno']);
      sheetData.push(['Campo', 'LH', 'RH', 'Diff']);
      extractBearingRows(data.innerBefore).forEach((row) => {
        sheetData.push([
          formatFieldName(row.field),
          displayValue(row.lh),
          displayValue(row.rh),
          row.differential,
        ]);
      });
      sheetData.push([]);
    }
  }

  if (hasAfterData) {
    sheetData.push([hasBeforeData ? 'APÓS MANUTENÇÃO' : 'MEDIÇÕES']);
    sheetData.push([]);

    if (data?.outerData && hasActualData(data.outerData)) {
      sheetData.push(['Externo']);
      sheetData.push(['Campo', 'LH', 'RH', 'Diff']);
      extractBearingRows(data.outerData).forEach((row) => {
        sheetData.push([
          formatFieldName(row.field),
          displayValue(row.lh),
          displayValue(row.rh),
          row.differential,
        ]);
      });
      sheetData.push([]);
    }

    if (data?.innerData && hasActualData(data.innerData)) {
      sheetData.push(['Interno']);
      sheetData.push(['Campo', 'LH', 'RH', 'Diff']);
      extractBearingRows(data.innerData).forEach((row) => {
        sheetData.push([
          formatFieldName(row.field),
          displayValue(row.lh),
          displayValue(row.rh),
          row.differential,
        ]);
      });
      sheetData.push([]);
    }

    // Additional info
    const info = data?.outerData || data?.outerBefore;
    if (info) {
      sheetData.push(['Informações Adicionais']);
      sheetData.push(['Combinado Com:', displayValue(info.combinedWith)]);
      sheetData.push(['Peça de Acoplamento:', displayValue(info.matingPart)]);
      sheetData.push(['Foi Ajustado:', displayValue(info.hasBeenAdjusted)]);
      sheetData.push(['Motor/Montagem Slide:', displayValue(info.slideMotorMounts)]);
      sheetData.push(['Cabo/Mangueiras:', displayValue(info.powerCordHoses)]);
      sheetData.push(['Correntes e Engrenagens:', displayValue(info.chainsGearsSprockets)]);
      sheetData.push(['Grampos de Travamento:', displayValue(info.lockingClamps)]);
      if (info.notes) sheetData.push(['Observações:', info.notes]);
    }
  }
}

// ============================================================================
// SLIDE
// ============================================================================
function addSlideData(sheetData: unknown[][], data: SlideSectionData) {
  const renderSlide = (slideData: typeof data.outerData, title: string) => {
    if (!slideData) return;

    sheetData.push([title]);
    sheetData.push(['Paralelismo:', displayValue(slideData.parallelism)]);
    sheetData.push(['Foi Ajustado:', displayValue(slideData.hasParallelismBeenAdjusted)]);
    sheetData.push([
      'Indicadores Verificados:',
      displayValue(slideData.shutheightIndicatorsChecked),
    ]);
    sheetData.push(['Sobrecargas Monitor:', displayValue(slideData.overloadsOnTonnageMonitor)]);
    sheetData.push(['Shutheight Atual:', displayValue(slideData.shutheightActualSh)]);
    sheetData.push(['Leitura Indicador:', displayValue(slideData.indicatorReading)]);
    sheetData.push([]);

    if (slideData.hasParallelismBeenAdjusted === 'YES' && slideData.beforePosition1 !== undefined) {
      sheetData.push(['Antes do Ajuste']);
      sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Desvio Máx']);
      sheetData.push([
        displayValue(slideData.beforePosition1),
        displayValue(slideData.beforePosition2),
        displayValue(slideData.beforePosition3),
        displayValue(slideData.beforePosition4),
        displayValue(slideData.beforePosition5),
        calculateSlideMaxDeviation(slideData, 'before'),
      ]);
      sheetData.push([]);
    }

    sheetData.push([slideData.hasParallelismBeenAdjusted === 'YES' ? 'Após Ajuste' : 'Medições']);
    sheetData.push(['Pos 1', 'Pos 2', 'Pos 3', 'Pos 4', 'Pos 5', 'Desvio Máx']);
    sheetData.push([
      displayValue(slideData.afterPosition1),
      displayValue(slideData.afterPosition2),
      displayValue(slideData.afterPosition3),
      displayValue(slideData.afterPosition4),
      displayValue(slideData.afterPosition5),
      calculateSlideMaxDeviation(slideData, 'after'),
    ]);
    sheetData.push([]);
  };

  renderSlide(data.outerData, 'Externo');
  renderSlide(data.innerData, 'Interno');
  if (data.notes) sheetData.push(['Observações:', data.notes]);
}

// ============================================================================
// GIBS
// ============================================================================
function addGibsData(sheetData: unknown[][], data: GibsSectionData) {
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
    const calc = calculateGibsFields(stageData);

    if (hasFrontToBack) {
      sheetData.push(['Frente-Trás']);
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
      sheetData.push(['', 'Esquerda', 'Direita']);
      sheetData.push(['Topo', calc.frontTop.toFixed(4), calc.backTop.toFixed(4)]);
      sheetData.push(['Base', calc.frontBottom.toFixed(4), calc.backBottom.toFixed(4)]);
      sheetData.push([]);
    }

    if (hasLeftToRight) {
      sheetData.push(['Esquerda-Direita']);
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
      sheetData.push(['', 'Topo', 'Base']);
      sheetData.push(['Frente', calc.leftTop.toFixed(4), calc.leftBottom.toFixed(4)]);
      sheetData.push(['Traseira', calc.rightTop.toFixed(4), calc.rightBottom.toFixed(4)]);
      if (calc.usable !== undefined) sheetData.push(['Usável', calc.usable.toFixed(4)]);
      sheetData.push([]);
    }
  };

  if (data.outerBefore || data.outerData || data.outerFreeHangingData) {
    sheetData.push(['--- EXTERNO ---']);
    renderGibsStage(data.outerBefore, 'Antes do Ajuste');
    renderGibsStage(data.outerData, 'Após Ajuste');
    renderGibsStage(data.outerFreeHangingData, 'Livre Após Instalação');
  }

  if (data.innerBefore || data.innerData || data.innerBeforeTool || data.innerDataTool) {
    sheetData.push(['--- INTERNO ---']);
    renderGibsStage(data.innerBefore, 'Antes do Ajuste');
    renderGibsStage(data.innerData, 'Após Ajuste');
    renderGibsStage(data.innerBeforeTool, 'Antes Instalação Ferramenta');
    renderGibsStage(data.innerDataTool, 'Após Instalação Ferramenta');
  }

  if (data.notes) sheetData.push(['Observações:', data.notes]);
}

// ============================================================================
// CLUTCH
// ============================================================================
function addClutchData(sheetData: unknown[][], data: ClutchSectionData) {
  sheetData.push(['Tipo de Embreagem:', displayValue(data.clutchType)]);
  sheetData.push(['Localização:', displayValue(data.clutchLocation)]);
  sheetData.push([]);

  sheetData.push(['Configurações Mola Freio (inches)']);
  sheetData.push(['Freio:', displayValue(data.brakeSpringBrake)]);
  sheetData.push(['Embreagem:', displayValue(data.brakeSpringClutch)]);
  sheetData.push(['FB:', displayValue(data.brakeSpringFB)]);
  sheetData.push(['FTB:', displayValue(data.brakeSpringFTB)]);
  sheetData.push(['RTB:', displayValue(data.brakeSpringRTB)]);
  sheetData.push(['Parafuso Prisioneiro:', displayValue(data.brakeSpringStudBolt)]);
  sheetData.push([]);

  sheetData.push(['Medições do Freio']);
  sheetData.push(['Tempo de Parada:', displayValue(data.brakeStoppingTime)]);
  sheetData.push(['Revestimento:', displayValue(data.brakeLining)]);
  sheetData.push(['Folga:', displayValue(data.brakeClearing)]);
  sheetData.push(['Folga Total:', displayValue(data.brakeClearanceTotal)]);
  sheetData.push(['Folga Traseira:', displayValue(data.brakeClearanceRear)]);
  sheetData.push([]);

  sheetData.push(['Volante']);
  sheetData.push(['Tempo de Parada:', displayValue(data.flywheelStoppingTime)]);
  sheetData.push(['Rolamentos:', displayValue(data.flywheelBearings)]);
  sheetData.push(['Freio:', displayValue(data.flywheelBrake)]);
  sheetData.push([]);

  sheetData.push(['Outros Componentes']);
  sheetData.push(['União Rotativa:', displayValue(data.rotaryUnion)]);
  sheetData.push(['Engajamentos:', displayValue(data.clutchEngagements)]);
  sheetData.push(['Revestimento Embreagem:', displayValue(data.clutchLining)]);
  sheetData.push(['Vedações Embreagem:', displayValue(data.clutchSeals)]);
  sheetData.push(['Vedações Freio Separado:', displayValue(data.separateBrakeSeals)]);
  sheetData.push(['Disco Flex:', displayValue(data.flexDisc)]);
  sheetData.push(['Estrias Disco:', displayValue(data.splinesDriveRingDisc)]);
  sheetData.push(['Porca Ajuste Segura:', displayValue(data.adjustingNutLockSecure)]);

  if (data.gearBacklashBefore !== undefined || data.gearBacklashAfter !== undefined) {
    sheetData.push([]);
    sheetData.push(['Engrenagem e Manivela']);
    sheetData.push(['Folga Engrenagem Antes:', displayValue(data.gearBacklashBefore)]);
    sheetData.push(['Folga Engrenagem Depois:', displayValue(data.gearBacklashAfter)]);
    sheetData.push(['Folga Axial Manivela Antes:', displayValue(data.crankEndplayBefore)]);
    sheetData.push(['Folga Axial Manivela Depois:', displayValue(data.crankEndplayAfter)]);
  }

  if (data.airRegulatorValue !== undefined) {
    sheetData.push([]);
    sheetData.push(['Sistema de Ar']);
    sheetData.push([
      'Regulador de Ar:',
      `${displayValue(data.airRegulatorValue)} ${data.airRegulatorUnit || ''}`,
    ]);
    sheetData.push(['Curso Embreagem Ar:', displayValue(data.airClutchTravel)]);
    sheetData.push(['Configuração Lubrificador:', displayValue(data.airLineOilerSetting)]);
  }

  if (data.hydClutchClearanceTotal !== undefined || data.hydraulicPressureValue !== undefined) {
    sheetData.push([]);
    sheetData.push(['Sistema Hidráulico']);
    sheetData.push(['Folga Total Hid:', displayValue(data.hydClutchClearanceTotal)]);
    sheetData.push(['Folga Traseira Hid:', displayValue(data.hydClutchClearanceRear)]);
    sheetData.push([
      'Pressão Hidráulica:',
      `${displayValue(data.hydraulicPressureValue)} ${data.hydraulicPressureUnit || ''}`,
    ]);
    sheetData.push([
      'Acumulador:',
      `${displayValue(data.accumulatorValue)} ${data.accumulatorUnit || ''}`,
    ]);
  }

  if (data.notes) sheetData.push(['Observações:', data.notes]);
}

// ============================================================================
// LUBRICATION
// ============================================================================
function addLubricationData(sheetData: unknown[][], data: LubricationSectionData) {
  sheetData.push(['Óleo Trocado:', displayValue(data.changedOil)]);
  sheetData.push(['Temperatura do Óleo:', displayValue(data.oilTemperature)]);
  sheetData.push(['Tipo/Fabricante Óleo:', displayValue(data.oilMfgType)]);
  sheetData.push(['Filtro Trocado:', displayValue(data.changedFilter)]);
  sheetData.push([]);

  const gauges = Array.isArray(data.gauges) ? data.gauges : [];
  if (gauges.length > 0) {
    sheetData.push(['Manômetros']);
    sheetData.push(['Sistema', 'Identificador', 'PSI']);
    gauges.forEach((gauge) => {
      sheetData.push([
        displayValue(gauge.system),
        displayValue(gauge.gaugeSwitchIdentifier),
        displayValue(gauge.psi),
      ]);
    });
  }
}

// ============================================================================
// COUNTERBALANCE
// ============================================================================
function addCounterbalanceData(sheetData: unknown[][], data: CounterbalanceSectionData) {
  const renderCB = (cbData: typeof data.outerData, title: string) => {
    if (!cbData) return;

    sheetData.push([title]);
    sheetData.push(['Tipo:', displayValue(cbData.counterbalanceType)]);
    sheetData.push(['Vedações Pistão/Airbag:', displayValue(cbData.airbagPistonSeals)]);
    if (cbData.airbagPistonSealsLeakLocation) {
      sheetData.push(['Localização Vazamento:', cbData.airbagPistonSealsLeakLocation]);
    }
    sheetData.push(['Regulador:', displayValue(cbData.regulator)]);
    sheetData.push(['Manômetro:', displayValue(cbData.gauge)]);
    sheetData.push(['Pneumática/Tubulação:', displayValue(cbData.pneumaticsPlumbing)]);
    sheetData.push(['Vedações Haste:', displayValue(cbData.rodSeals)]);
    sheetData.push(['Bucha Haste:', displayValue(cbData.rodBushing)]);
    sheetData.push(['Mecha de Óleo:', displayValue(cbData.oilWick)]);
    sheetData.push([]);
  };

  renderCB(data.outerData, 'Externo');
  renderCB(data.innerData, 'Interno');
  if (data.notes) sheetData.push(['Observações:', data.notes]);
}

// ============================================================================
// TRAMMING
// ============================================================================
function addTrammingData(sheetData: unknown[][], data: TrammingSectionData) {
  sheetData.push(['Slide Tram:', displayValue(data.slideTram)]);
  sheetData.push(['Unidade:', displayValue(data.unit)]);
  sheetData.push([]);

  const renderTram = (tramData: typeof data.outerData, title: string) => {
    if (!tramData) return;

    sheetData.push([title]);
    sheetData.push(['', 'Topo', 'Base', 'Esquerda', 'Direita']);
    sheetData.push([
      'Posição Topo',
      displayValue(tramData.topTop),
      displayValue(tramData.topBottom),
      displayValue(tramData.topLeft),
      displayValue(tramData.topRight),
    ]);
    sheetData.push([
      'Posição Base',
      displayValue(tramData.bottomTop),
      displayValue(tramData.bottomBottom),
      displayValue(tramData.bottomLeft),
      displayValue(tramData.bottomRight),
    ]);
    sheetData.push([
      'Posição Esquerda',
      displayValue(tramData.leftTop),
      displayValue(tramData.leftBottom),
      displayValue(tramData.leftLeft),
      displayValue(tramData.leftRight),
    ]);
    sheetData.push([
      'Posição Direita',
      displayValue(tramData.rightTop),
      displayValue(tramData.rightBottom),
      displayValue(tramData.rightLeft),
      displayValue(tramData.rightRight),
    ]);
    sheetData.push([]);
  };

  renderTram(data.outerData, 'Externo');
  renderTram(data.innerData, 'Interno');
  if (data.notes) sheetData.push(['Observações:', data.notes]);
}

// ============================================================================
// PISTONS
// ============================================================================
function addPistonsData(sheetData: unknown[][], data: PistonsSectionData) {
  sheetData.push(['Vedações Guia:', displayValue(data.guideSeals)]);
  sheetData.push(['Vedações Pistão:', displayValue(data.pistonSeals)]);
  sheetData.push(['Sistema Vácuo:', displayValue(data.vacuumSystem)]);
  if (data.vacuumSystemAirPressureSetting !== undefined) {
    sheetData.push([
      'Pressão Ar Vácuo:',
      `${displayValue(data.vacuumSystemAirPressureSetting)} ${data.vacuumSystemAirPressureUnit || ''}`,
    ]);
  }
  sheetData.push(['Unidade:', displayValue(data.unit)]);
  sheetData.push([]);

  const renderPistons = (pistonsData: typeof data.outerData, title: string) => {
    if (!pistonsData) return;

    sheetData.push([title]);
    sheetData.push(['', 'Topo', 'Base', 'Esquerda', 'Direita']);
    sheetData.push([
      'Pistão LH',
      displayValue(pistonsData.lhTop),
      displayValue(pistonsData.lhBottom),
      displayValue(pistonsData.lhLeft),
      displayValue(pistonsData.lhRight),
    ]);
    sheetData.push([
      'Pistão RH',
      displayValue(pistonsData.rhTop),
      displayValue(pistonsData.rhBottom),
      displayValue(pistonsData.rhLeft),
      displayValue(pistonsData.rhRight),
    ]);
    sheetData.push([]);
  };

  renderPistons(data.outerData, 'Externo');
  renderPistons(data.innerData, 'Interno');
  if (data.notes) sheetData.push(['Observações:', data.notes]);
}
