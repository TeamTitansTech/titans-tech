# Sistema de Alertas - Titans Tech

Documentação completa do sistema de alertas automáticos para folga de mancais (Bearing Clearance).

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Modelo de Dados](#modelo-de-dados)
- [Thresholds (Limites)](#thresholds-limites)
- [Cálculo de Severidade](#cálculo-de-severidade)
- [Fluxo de Geração](#fluxo-de-geração)
- [API](#api)
- [Frontend](#frontend)
- [Casos de Uso](#casos-de-uso)
- [Manutenção](#manutenção)

## Visão Geral

O sistema de alertas monitora **folga de mancais** (bearing clearance) e gera alertas automáticos baseados em:

1. **Medições RH/LH**: Dados coletados durante inspeção/manutenção
2. **Diferenciais**: Cálculo de `|RH - LH|` para cada campo
3. **Thresholds**: Limites configurados por blueprint
4. **Severidade**: Classificação em 4 níveis (NONE, GREEN, YELLOW, RED)

### Campos Monitorados

6 campos de folga de mancais:

1. **Total Clearance** - Folga total
2. **Main Bearings** - Mancais principais
3. **Upper Connection Bearings** - Mancais de conexão superior
4. **Wrist Pin to Mating Part** - Pino do punho até peça de acoplamento
5. **Wrist Pin to Bushing** - Pino do punho até bucha
6. **Slide Adjustment Nut to Screw Sleeve** - Porca de ajuste da corrediça até manga do parafuso

Cada campo possui:

- Medição **RH** (Right Hand - Lado Direito)
- Medição **LH** (Left Hand - Lado Esquerdo)
- **Differential** calculado: `|RH - LH|`
- **Severity** determinada: NONE / GREEN / YELLOW / RED

## Arquitetura

### Design Normalizado

```text
┌─────────────────────────────────────────────────────────┐
│               MachineService                            │
│  • id                                                   │
│  • machineId                                            │
│  • date, type, status                                   │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴─────────────┐
    │                          │
    ▼                          ▼
┌───────────────────┐   ┌──────────────────────────┐
│ BearingClearance  │   │ AlertBearingClearance    │
│ Data              │   │                          │
│ ─────────────     │   │ • differential (calc)    │
│ • RH values       │   │ • severity (calc)        │
│ • LH values       │   │ • thresholdSnapshot      │
│ (Source of Truth) │   │ (Calculated Results)     │
└───────────────────┘   └──────────────────────────┘
         ▲                          │
         │                          │
         │         ┌────────────────┘
         │         │
         │         ▼
         │  ┌──────────────────────────┐
         │  │ ThresholdBearing         │
         │  │ Clearance                │
         │  │ ─────────────────        │
         │  │ • greenMin, yellowMin,   │
         │  │   redMin (per field)     │
         │  │ (Configuration)          │
         │  └──────────────────────────┘
         │                ▲
         │                │
         └────────────────┴──────────────
                  Blueprint
```

### Benefícios da Normalização

1. **Single Source of Truth**: RH/LH sempre vêm de `BearingClearanceData`
2. **Sem Duplicação**: Alertas armazenam apenas valores calculados
3. **Consistência**: Impossível ter discrepância entre tabelas
4. **Redução de Tamanho**: 66% menos colunas em AlertBearingClearance

## Modelo de Dados

### Schema Prisma

```prisma
// Dados de Medição (Fonte da Verdade)
model BearingClearanceData {
  id                              String   @id @default(cuid())

  // 6 campos × 2 lados = 12 medições
  totalClearance_RH               Decimal? @db.Decimal(10, 4)
  totalClearance_LH               Decimal? @db.Decimal(10, 4)
  mainBearings_RH                 Decimal? @db.Decimal(10, 4)
  mainBearings_LH                 Decimal? @db.Decimal(10, 4)
  upperConnectionBearings_RH      Decimal? @db.Decimal(10, 4)
  upperConnectionBearings_LH      Decimal? @db.Decimal(10, 4)
  wristPinToMatingPart_RH         Decimal? @db.Decimal(10, 4)
  wristPinToMatingPart_LH         Decimal? @db.Decimal(10, 4)
  wristPinToBushing_RH            Decimal? @db.Decimal(10, 4)
  wristPinToBushing_LH            Decimal? @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_RH     Decimal? @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_LH     Decimal? @db.Decimal(10, 4)

  services MachineServiceBearingClearance[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Junction Table: Serviço <-> Dados
model MachineServiceBearingClearance {
  id            String                  @id @default(cuid())
  serviceId     String                  @unique
  service       MachineService          @relation(fields: [serviceId], references: [id])

  // Before/After Data
  outerBeforeId String?
  outerBefore   BearingClearanceData?   @relation("outerBefore", fields: [outerBeforeId], references: [id])
  outerDataId   String?
  outerData     BearingClearanceData?   @relation("outerData", fields: [outerDataId], references: [id])
  innerBeforeId String?
  innerBefore   BearingClearanceData?   @relation("innerBefore", fields: [innerBeforeId], references: [id])
  innerDataId   String?
  innerData     BearingClearanceData?   @relation("innerData", fields: [innerDataId], references: [id])
}

// Alertas Calculados (Normalizado)
model AlertBearingClearance {
  id                                          String         @id @default(cuid())
  serviceId                                   String         @unique
  service                                     MachineService @relation(fields: [serviceId], references: [id])

  // 6 diferenciais calculados
  totalClearance_differential                 Decimal?       @db.Decimal(10, 4)
  mainBearings_differential                   Decimal?       @db.Decimal(10, 4)
  upperConnectionBearings_differential        Decimal?       @db.Decimal(10, 4)
  wristPinToMatingPart_differential           Decimal?       @db.Decimal(10, 4)
  wristPinToBushing_differential              Decimal?       @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_differential       Decimal?       @db.Decimal(10, 4)

  // 6 severidades determinadas
  totalClearance_severity                     AlertSeverity?
  mainBearings_severity                       AlertSeverity?
  upperConnectionBearings_severity            AlertSeverity?
  wristPinToMatingPart_severity               AlertSeverity?
  wristPinToBushing_severity                  AlertSeverity?
  slideAdjNutToScrewSleeve_severity           AlertSeverity?

  // Snapshot de thresholds (audit trail)
  thresholdSnapshot Json

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Thresholds por Blueprint
model ThresholdBearingClearance {
  id          String    @id @default(cuid())
  blueprintId String    @unique
  blueprint   Blueprint @relation(fields: [blueprintId], references: [id])

  // 6 campos × 3 níveis = 18 thresholds
  totalClearance_greenMin         Decimal @db.Decimal(10, 4)
  totalClearance_yellowMin        Decimal @db.Decimal(10, 4)
  totalClearance_redMin           Decimal @db.Decimal(10, 4)

  mainBearings_greenMin           Decimal @db.Decimal(10, 4)
  mainBearings_yellowMin          Decimal @db.Decimal(10, 4)
  mainBearings_redMin             Decimal @db.Decimal(10, 4)

  upperConnectionBearings_greenMin    Decimal @db.Decimal(10, 4)
  upperConnectionBearings_yellowMin   Decimal @db.Decimal(10, 4)
  upperConnectionBearings_redMin      Decimal @db.Decimal(10, 4)

  wristPinToMatingPart_greenMin       Decimal @db.Decimal(10, 4)
  wristPinToMatingPart_yellowMin      Decimal @db.Decimal(10, 4)
  wristPinToMatingPart_redMin         Decimal @db.Decimal(10, 4)

  wristPinToBushing_greenMin          Decimal @db.Decimal(10, 4)
  wristPinToBushing_yellowMin         Decimal @db.Decimal(10, 4)
  wristPinToBushing_redMin            Decimal @db.Decimal(10, 4)

  slideAdjNutToScrewSleeve_greenMin   Decimal @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_yellowMin  Decimal @db.Decimal(10, 4)
  slideAdjNutToScrewSleeve_redMin     Decimal @db.Decimal(10, 4)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AlertSeverity {
  NONE
  GREEN
  YELLOW
  RED
}
```

## Thresholds (Limites)

### Estrutura

Para cada campo, 3 thresholds definem as zonas:

```text
┌────────────────┬────────────────┬────────────────┐
│     NONE       │     GREEN      │    YELLOW      │     RED
│  < greenMin    │ greenMin-      │ yellowMin-     │  redMin+
│                │ yellowMin      │ redMin         │
└────────────────┴────────────────┴────────────────┴────────
0               0.010           0.020            0.030
```

**Validação**: Sempre `greenMin < yellowMin < redMin`

### Exemplo de Configuração

```json
{
  "blueprintId": "cm123...",
  "totalClearance_greenMin": "0.010",
  "totalClearance_yellowMin": "0.020",
  "totalClearance_redMin": "0.030",
  "mainBearings_greenMin": "0.015",
  "mainBearings_yellowMin": "0.025",
  "mainBearings_redMin": "0.035",
  ...
}
```

### Criação de Thresholds

```typescript
// Backend: AlertsService
async createThreshold(dto: CreateThresholdDto) {
  // Validação via Zod schema
  const validatedDto = CreateThresholdSchema.parse(dto);

  // Converte strings para Decimal
  const data = {
    blueprintId: dto.blueprintId,
    totalClearance_greenMin: new Decimal(dto.totalClearance_greenMin),
    totalClearance_yellowMin: new Decimal(dto.totalClearance_yellowMin),
    totalClearance_redMin: new Decimal(dto.totalClearance_redMin),
    // ... outros campos
  };

  return this.prisma.thresholdBearingClearance.create({ data });
}
```

### Validação de Ordenação

```typescript
// Zod Schema
export const CreateThresholdSchema = z.object({
  blueprintId: z.string().cuid(),
  totalClearance_greenMin: z.string(),
  totalClearance_yellowMin: z.string(),
  totalClearance_redMin: z.string(),
  // ... outros campos
}).refine(
  (data) => {
    const green = parseFloat(data.totalClearance_greenMin);
    const yellow = parseFloat(data.totalClearance_yellowMin);
    const red = parseFloat(data.totalClearance_redMin);
    return green < yellow && yellow < red;
  },
  {
    message: 'Invalid threshold order: greenMin < yellowMin < redMin',
  }
);
```

## Cálculo de Severidade

### Algoritmo

Para cada campo:

```typescript
function calculateSeverity(
  differential: number,
  thresholds: { greenMin: number; yellowMin: number; redMin: number }
): AlertSeverity {
  if (differential < thresholds.greenMin) {
    return 'NONE';  // Normal
  } else if (differential < thresholds.yellowMin) {
    return 'GREEN';  // Atenção
  } else if (differential < thresholds.redMin) {
    return 'YELLOW';  // Alerta
  } else {
    return 'RED';  // Crítico
  }
}
```

### Exemplo Prático

**Dados**:

- RH: 0.035
- LH: 0.015
- Differential: `|0.035 - 0.015| = 0.020`

**Thresholds**:

- greenMin: 0.010
- yellowMin: 0.020
- redMin: 0.030

**Cálculo**:

```text
0.020 >= 0.030? NO
0.020 >= 0.020? YES → YELLOW
```

**Resultado**: Severidade = **YELLOW** (Alerta)

## Fluxo de Geração

### 1. Registro de Serviço

```typescript
// Backend: ServicesController
@Post()
@BranchPermission('createServices')
async create(@Body() dto: CreateServiceDto) {
  return this.servicesService.create(dto);
}
```

### 2. Criação de Dados

```typescript
// Backend: ServicesService
async create(dto: CreateServiceDto) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Criar MachineService
    const service = await tx.machineService.create({
      data: {
        machineId: dto.machineId,
        date: dto.date,
        type: dto.type,
        status: dto.status,
      },
    });

    // 2. Criar BearingClearanceData (se fornecido)
    if (dto.sections?.bearingClearance) {
      const outerData = await tx.bearingClearanceData.create({
        data: dto.sections.bearingClearance.outerData,
      });

      // 3. Criar junction table
      await tx.machineServiceBearingClearance.create({
        data: {
          serviceId: service.id,
          outerDataId: outerData.id,
        },
      });

      // 4. Gerar alertas automaticamente
      await this.alertsService.generateAlertsForService(service.id);
    }

    return service;
  });
}
```

### 3. Geração de Alertas

```typescript
// Backend: AlertsService
async generateAlertsForService(serviceId: string) {
  // 1. Buscar dados do serviço
  const service = await this.prisma.machineService.findUnique({
    where: { id: serviceId },
    include: {
      machine: {
        include: {
          blueprint: {
            include: { threshold: true },
          },
        },
      },
      bearingClearance: {
        include: {
          outerData: true,
          innerData: true,
        },
      },
    },
  });

  // 2. Validar threshold existe
  const threshold = service.machine.blueprint.threshold;
  if (!threshold) {
    throw new NotFoundException('Threshold not configured for this blueprint');
  }

  // 3. Extrair dados
  const outerData = service.bearingClearance[0]?.outerData;
  if (!outerData) {
    throw new NotFoundException('No bearing clearance data found');
  }

  // 4. Calcular diferenciais e severidades
  const fields = [
    'totalClearance',
    'mainBearings',
    'upperConnectionBearings',
    'wristPinToMatingPart',
    'wristPinToBushing',
    'slideAdjNutToScrewSleeve',
  ];

  const alertData: any = {
    serviceId,
    thresholdSnapshot: threshold,  // Audit trail
  };

  for (const field of fields) {
    const rh = outerData[`${field}_RH`];
    const lh = outerData[`${field}_LH`];

    if (rh !== null && lh !== null) {
      // Calcular differential
      const differential = new Decimal(rh).minus(lh).abs();
      alertData[`${field}_differential`] = differential;

      // Determinar severidade
      const greenMin = threshold[`${field}_greenMin`];
      const yellowMin = threshold[`${field}_yellowMin`];
      const redMin = threshold[`${field}_redMin`];

      let severity: AlertSeverity;
      if (differential.lessThan(greenMin)) {
        severity = 'NONE';
      } else if (differential.lessThan(yellowMin)) {
        severity = 'GREEN';
      } else if (differential.lessThan(redMin)) {
        severity = 'YELLOW';
      } else {
        severity = 'RED';
      }

      alertData[`${field}_severity`] = severity;
    }
  }

  // 5. Criar AlertBearingClearance
  return this.prisma.alertBearingClearance.upsert({
    where: { serviceId },
    create: alertData,
    update: alertData,
  });
}
```

### 4. Consulta de Alertas

```typescript
// Backend: AlertsService
async getAlertsForService(serviceId: string) {
  const alert = await this.prisma.alertBearingClearance.findUnique({
    where: { serviceId },
    include: {
      service: {
        include: {
          machine: true,
          bearingClearance: {
            include: {
              outerData: true,  // Para obter RH/LH
            },
          },
        },
      },
    },
  });

  if (!alert) {
    throw new NotFoundException('No alerts found for this service');
  }

  // Combinar dados normalizados
  const outerData = alert.service.bearingClearance[0]?.outerData;
  const fields = ['totalClearance', 'mainBearings', ...];

  const alerts = fields.map((field) => ({
    field,
    rh: outerData?.[`${field}_RH`],
    lh: outerData?.[`${field}_LH`],
    differential: alert[`${field}_differential`],
    severity: alert[`${field}_severity`],
    thresholds: {
      greenMin: alert.thresholdSnapshot[`${field}_greenMin`],
      yellowMin: alert.thresholdSnapshot[`${field}_yellowMin`],
      redMin: alert.thresholdSnapshot[`${field}_redMin`],
    },
  }));

  return { id: alert.id, serviceId, alerts };
}
```

## API

### Endpoints de Thresholds

```http
POST /alerts/bearing-clearance/thresholds
GET /alerts/bearing-clearance/thresholds/blueprint/:blueprintId
PUT /alerts/bearing-clearance/thresholds/blueprint/:blueprintId
DELETE /alerts/bearing-clearance/thresholds/blueprint/:blueprintId
```

**Permissão**: `@Admin()` (apenas SysAdmin)

### Endpoints de Alertas

```http
GET /alerts/bearing-clearance/service/:serviceId
POST /alerts/bearing-clearance/service/:serviceId/generate
```

**Permissão**: `@Authenticated()` (consulta) / `@Admin()` (geração manual)

## Frontend

### Componente de Threshold

```tsx
// components/alerts/ThresholdRangeInput.tsx
export function ThresholdRangeInput({
  field,
  greenMin,
  yellowMin,
  redMin,
  onChange,
}: ThresholdRangeInputProps) {
  return (
    <div className="space-y-2">
      <label>{field}</label>

      {/* Visualização de Zonas */}
      <div className="flex h-12 rounded overflow-hidden">
        <div className="bg-green-200 flex-1 flex items-center justify-center">
          <span className="text-xs">
            VERDE &lt; {yellowMin.toFixed(3)}
          </span>
        </div>
        <div className="bg-yellow-200 flex-1 flex items-center justify-center">
          <span className="text-xs">
            AMARELO {yellowMin.toFixed(3)} - {(redMin - 0.001).toFixed(3)}
          </span>
        </div>
        <div className="bg-red-200 flex-1 flex items-center justify-center">
          <span className="text-xs">
            VERMELHO {redMin.toFixed(3)}+
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs">Verde Mínimo</label>
          <Input
            type="number"
            step="0.001"
            value={greenMin}
            onChange={(e) => onChange({ greenMin: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs">Amarelo Mínimo</label>
          <Input
            type="number"
            step="0.001"
            min={greenMin}
            value={yellowMin}
            onChange={(e) => onChange({ yellowMin: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-xs">Vermelho Mínimo</label>
          <Input
            type="number"
            step="0.001"
            min={yellowMin}
            value={redMin}
            onChange={(e) => onChange({ redMin: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
```

### Visualização de Alertas

```tsx
// components/alerts/AlertBadge.tsx
export function AlertBadge({ severity }: { severity: AlertSeverity }) {
  const config = {
    NONE: { label: 'Normal', color: 'gray', icon: <CheckIcon /> },
    GREEN: { label: 'Atenção', color: 'green', icon: <InfoIcon /> },
    YELLOW: { label: 'Alerta', color: 'yellow', icon: <AlertTriangleIcon /> },
    RED: { label: 'Crítico', color: 'red', icon: <AlertCircleIcon /> },
  };

  const { label, color, icon } = config[severity];

  return (
    <Badge variant={color}>
      {icon}
      <span className="ml-1">{label}</span>
    </Badge>
  );
}
```

## Casos de Uso

### 1. Configurar Thresholds para Novo Blueprint

```bash
# 1. SysAdmin cria blueprint
POST /blueprints
{
  "name": "Nova Prensa XYZ",
  "fields": [...],
  "sections": ["bearing-clearance"]
}

# 2. SysAdmin configura thresholds
POST /alerts/bearing-clearance/thresholds
{
  "blueprintId": "cm123...",
  "totalClearance_greenMin": "0.010",
  "totalClearance_yellowMin": "0.020",
  "totalClearance_redMin": "0.030",
  ...
}
```

### 2. Registrar Inspeção com Alertas

```bash
# Técnico registra inspeção
POST /services
{
  "machineId": "cm456...",
  "type": "INSPECTION",
  "sections": {
    "bearingClearance": {
      "outerData": {
        "totalClearance_RH": "0.035",
        "totalClearance_LH": "0.015"
      }
    }
  }
}

# Sistema automaticamente:
# 1. Cria BearingClearanceData
# 2. Calcula differential: |0.035 - 0.015| = 0.020
# 3. Determina severity: YELLOW (0.020 >= 0.020 e < 0.030)
# 4. Cria AlertBearingClearance
```

### 3. Consultar Alertas Críticos

```typescript
// Backend: Custom query
async getCriticalAlerts(companyId: string) {
  return this.prisma.alertBearingClearance.findMany({
    where: {
      OR: [
        { totalClearance_severity: 'RED' },
        { mainBearings_severity: 'RED' },
        { upperConnectionBearings_severity: 'RED' },
        { wristPinToMatingPart_severity: 'RED' },
        { wristPinToBushing_severity: 'RED' },
        { slideAdjNutToScrewSleeve_severity: 'RED' },
      ],
      service: {
        machine: {
          branch: {
            companyId,
          },
        },
      },
    },
    include: {
      service: {
        include: {
          machine: {
            include: {
              branch: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

### 4. Atualizar Thresholds e Recalcular

```bash
# 1. SysAdmin atualiza thresholds
PUT /alerts/bearing-clearance/thresholds/blueprint/cm123
{
  "totalClearance_yellowMin": "0.025",
  "totalClearance_redMin": "0.040"
}

# 2. Recalcular alertas de serviços existentes
POST /alerts/bearing-clearance/service/cm789/generate

# Sistema recalcula com novos thresholds
```

## Manutenção

### Regenerar Alertas em Lote

```typescript
// Script de manutenção
async function regenerateAllAlerts() {
  const services = await prisma.machineService.findMany({
    where: {
      bearingClearance: {
        isNot: null,
      },
    },
  });

  for (const service of services) {
    try {
      await alertsService.generateAlertsForService(service.id);
      console.log(`✅ Regenerated alerts for service ${service.id}`);
    } catch (error) {
      console.error(`❌ Failed for service ${service.id}:`, error.message);
    }
  }
}
```

### Auditoria de Thresholds

```typescript
// Consultar histórico via thresholdSnapshot
const alerts = await prisma.alertBearingClearance.findMany({
  where: { serviceId: 'cm123...' },
  orderBy: { createdAt: 'asc' },
});

alerts.forEach((alert) => {
  console.log(`Snapshot em ${alert.createdAt}:`);
  console.log(alert.thresholdSnapshot);
});
```

### Performance Monitoring

```typescript
// Adicionar índices se necessário
@@index([totalClearance_severity])
@@index([createdAt])

// Query otimizada
const criticalAlerts = await prisma.alertBearingClearance.findMany({
  where: {
    totalClearance_severity: 'RED',
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),  // Últimos 7 dias
    },
  },
  take: 50,
});
```

---

## Recursos Adicionais

- [Documentação da API](API.md)
- [Arquitetura do Sistema](ARCHITECTURE.md)
- [Guia de Desenvolvimento](DEVELOPMENT.md)
