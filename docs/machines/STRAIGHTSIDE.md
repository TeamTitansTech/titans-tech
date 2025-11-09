# STRAIGHTSIDE

Prensa mecânica com estrutura reta.

---

## INFORMAÇÕES BÁSICAS DA MÁQUINA

### Customer Info

- **Tipo:** text
- **Descrição:** Informações do cliente

### Manufacturer

- **Tipo:** dropdown
- **Opções:** ["BeltCondtion","BrakeSpring","China","Germany","Mexico","USA","China","Germany","Mexico","USA"]

### Model

- **Tipo:** text
- **Descrição:** Modelo da máquina

### Size/Tonnage

- **Tipo:** text
- **Descrição:** Tamanho/Tonelagem (ex: "500 ton")

### Serial

- **Tipo:** text
- **Descrição:** Número de série

### Stroke

- **Tipo:** text
- **Descrição:** Curso da máquina (ex: "12 inches")

### Foundation Type

- **Tipo:** dropdown
- **Opções:** ["Pneu System","SClampCondition","Seals"]

### Is Press Level?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Drive Belt Condition

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Loosened","Tightened","Worn"]

### Are all protective covers in place?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### If "NO" above, explain

- **Tipo:** text
- **Descrição:** Explicação se as coberturas não estiverem no lugar

### Are cracks visible in crown, bed or slide?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### If "YES" above, where?

- **Tipo:** text
- **Descrição:** Localização das rachaduras

### Notes

- **Tipo:** textarea
- **Descrição:** Notas gerais

---

## BEARING CLEARANCE

Medições de folga dos rolamentos antes e depois do ajuste.

### Have Clearances been adjusted?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Unidade de Medida

- **Tipo:** dropdown
- **Opções:** ["inches", "mm"]

### Tabela: Before Adjustment

| Campo                         | LH (number) | RH (number) | Differential (auto) |
| ----------------------------- | ----------- | ----------- | ------------------- |
| Total Clearance               | ✓           | ✓           | calculado           |
| Main Bearings                 | ✓           | ✓           | calculado           |
| Upper Connection Bearing(s)   | ✓           | ✓           | calculado           |
| Wrist Pin to Mating Part      | ✓           | ✓           | calculado           |
| Wrist Pin to Bushing          | ✓           | ✓           | calculado           |
| Slide Adj Nut to Screw/Sleeve | ✓           | ✓           | calculado           |
| Extra w/Double Lock Open      | ✓           | ✓           | calculado           |
| Ball Box Area                 | ✓           | ✓           | calculado           |

### Combined w/

- **Tipo:** dropdown
- **Opções:** []

### Mating Part

- **Tipo:** dropdown
- **Opções:** []

### Tabela: After Adjustment

| Campo                         | LH (number) | RH (number) | Differential (auto) |
| ----------------------------- | ----------- | ----------- | ------------------- |
| Total Clearance               | ✓           | ✓           | calculado           |
| Main Bearings                 | ✓           | ✓           | calculado           |
| Upper Connection Bearing(s)   | ✓           | ✓           | calculado           |
| Wrist Pin to Mating Part      | ✓           | ✓           | calculado           |
| Wrist Pin to Bushing          | ✓           | ✓           | calculado           |
| Slide Adj Nut to Screw/Sleeve | ✓           | ✓           | calculado           |
| Extra w/Double Lock Open      | ✓           | ✓           | calculado           |
| Ball Box Area                 | ✓           | ✓           | calculado           |

### Shutheight Adjustment Mechanism

#### Slide Motor/Mounts

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Broken","Worn"]

#### Chains & Gears/Sprockets

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Broken","Loose"]

#### Locking Clamps

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Damaged"]

### Notes

- **Tipo:** textarea

---

## SLIDE

### Parallelism

- **Tipo:** dropdown
- **Opções:** ["DNC","To Bed","To Bolster"]

### Has Parallelism been adjusted?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Before Adjustment

| Posição 1 (number) | Posição 2 (number) | Posição 3 (number) | Max Deviation (auto) |
| ------------------ | ------------------ | ------------------ | -------------------- |
| ✓                  | ✓                  | ✓                  | calculado            |

### After Adjustment

| Posição 1 (number) | Posição 2 (number) | Posição 3 (number) | Max Deviation (auto) |
| ------------------ | ------------------ | ------------------ | -------------------- |
| ✓                  | ✓                  | ✓                  | calculado            |

### Unidade

- **Tipo:** dropdown
- **Opções:** ["inches", "mm"]

### Shutheight Indicators Checked

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Actual SH

- **Tipo:** number/text

### Overloads on Tonnage Monitor

- **Tipo:** text

### Indicator Reading

- **Tipo:** text

### Notes

- **Tipo:** textarea

---

## GIBS

### Have gibs been adjusted?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Before Adjustment

**Direction:** Front to Back

| Ponto 1 (number) | Ponto 2 (number) | Ponto 3 (number) | Ponto 4 (number) |
| ---------------- | ---------------- | ---------------- | ---------------- |
| ✓                | ✓                | ✓                | ✓                |

### After Adjustment

**Direction:** Front to Back

| Ponto 1 (number) | Ponto 2 (number) | Ponto 3 (number) | Ponto 4 (number) |
| ---------------- | ---------------- | ---------------- | ---------------- |
| ✓                | ✓                | ✓                | ✓                |

### Notes

- **Tipo:** textarea

---

## LUBRICATION / HYDRAULICS / PRESSURE SWITCHES / OIL & FILTER

### OIL

#### Changed Oil

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

#### Oil Mfg/Type

- **Tipo:** text
- **Descrição:** Fabricante e tipo do óleo

#### Oil Condition

- **Tipo:** dropdown
- **Opções:** ["OK","Dark Oil"]

### Pressure Hoses Condition

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Damaged"]

### Gauges

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Not Operational","Leaking"]

### Notes

- **Tipo:** textarea

---

## CLUTCH

### Clutch Type

- **Tipo:** dropdown
- **Opções:** ["Splines","Oiler","ClutchType"]

### Clutch Location

- **Tipo:** dropdown
- **Opções:** ["Driveshaft","Crankshaft"]

### Brake Spring Settings

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Broken","Bent/Worn"]

### Brake Anchor Clearance

- **Tipo:** number
- **Unidade:** inches/mm

### Brake Stopping Time

- **Tipo:** number
- **Unidade:** segundos

### Flywheel Stopping Time

- **Tipo:** number
- **Unidade:** segundos

### Clutch Engagements

- **Tipo:** number

### \*Gear Backlash

- **Tipo:** number

### Air Regulator

- **Tipo:** number
- **Unidade:** PSI/Bar

### Air Clutch Travel/Clearance

- **Tipo:** number

### Air Line Oiler Setting

- **Tipo:** text
- **Padrão:** "1 drop every 25-50 Clutch Engagements"

### Hyd Clutch Clearance

- **Tipo:** number

### Brake Clearance

- **Tipo:** number

### Brake Linings

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Glazed","Oil Soaked","Missing Segments"]

### Flywheel Bearings

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Noise","Wobble"]

### Flywheel Brake

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Lining Worn"]

### Rotary Union

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Air Leak","Oil Leak","Concentricity"]

### Seals

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Leaking","Slow Response"]

### Splines

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Broken","Not Visible","Wear Visible"]

### Flex Disc

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Buckled","Cracked"]

### Notes

- **Tipo:** textarea

---

## COUNTERBALANCE CYLINDER / AIRBAG

### Counterbalance Type

- **Tipo:** text
- **Descrição:** Tipo de contrapeso

### Airbag / Piston Seals

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC","Leaking","Worn"]

### Regulator

- **Tipo:** number
- **Unidade:** PSI/Bar

### Gauge

- **Tipo:** number
- **Unidade:** PSI/Bar

### Pneumatics Plumbing

- **Tipo:** text

### Pneumatic System Type

- **Tipo:** dropdown
- **Opções:** ["N/A","Counterbalance","CBAL W/Die Cushion","Die Cushion only"]

### Notes

- **Tipo:** textarea

---

## SUMMARY OF AUDIT

- **Tipo:** textarea
- **Descrição:** Resumo geral da auditoria
