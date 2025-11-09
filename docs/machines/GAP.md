# GAP

Prensa tipo C (estrutura aberta - Gap Frame).

---

## INFORMAÇÕES BÁSICAS DA MÁQUINA

### Customer Info

- **Tipo:** text

### Manufacturer

- **Tipo:** dropdown
- **Opções:** ["BeltCondtion","BrakeSpring","China","Germany","Mexico","USA","China","Germany","Mexico","USA"]

### Model

- **Tipo:** text

### Size/Tonnage

- **Tipo:** text

### Serial

- **Tipo:** text

### Stroke

- **Tipo:** text

### Foundation Type

- **Tipo:** dropdown
- **Opções:** ["Pneu System","SClampCondition","Seals"]

### Is Press Level?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Drive Belt Condition

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC"]

### Are all protective covers in place?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### If "NO" above, explain

- **Tipo:** text

### Are cracks visible in crown, bed or slide?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### If "YES" above, where?

- **Tipo:** text

### Notes

- **Tipo:** textarea

---

## BEARING CLEARANCE

### Have Clearances been adjusted?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Tabela: Before Adjustment

| Campo                         | LH     | RH     | Differential |
| ----------------------------- | ------ | ------ | ------------ |
| Total Clearance               | number | number | auto         |
| Main Bearings                 | number | number | auto         |
| Upper Connection Bearing(s)   | number | number | auto         |
| Wrist Pin to Mating Part      | number | number | auto         |
| Wrist Pin to Bushing          | number | number | auto         |
| Slide Adj Nut to Screw/Sleeve | number | number | auto         |
| Extra w/Double Lock Open      | number | number | auto         |
| Ball Box Area                 | number | number | auto         |

### Tabela: After Adjustment

| Campo                         | LH     | RH     | Differential |
| ----------------------------- | ------ | ------ | ------------ |
| Total Clearance               | number | number | auto         |
| Main Bearings                 | number | number | auto         |
| Upper Connection Bearing(s)   | number | number | auto         |
| Wrist Pin to Mating Part      | number | number | auto         |
| Wrist Pin to Bushing          | number | number | auto         |
| Slide Adj Nut to Screw/Sleeve | number | number | auto         |
| Extra w/Double Lock Open      | number | number | auto         |
| Ball Box Area                 | number | number | auto         |

---

## SLIDE

### Parallelism

- **Tipo:** dropdown
- **Opções:** ["DNC","To Bed","To Bolster"]

### Has Parallelism been adjusted?

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Before Adjustment

| Posição 1 | Posição 2 | Posição 3 | Max Deviation |
| --------- | --------- | --------- | ------------- |
| number    | number    | number    | auto          |

### After Adjustment

| Posição 1 | Posição 2 | Posição 3 | Max Deviation |
| --------- | --------- | --------- | ------------- |
| number    | number    | number    | auto          |

### Shutheight Indicators Checked

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Overloads on Tonnage Monitor

- **Tipo:** text

### Notes

- **Tipo:** textarea

---

## GIBS

### Before Adjustment

Layout com 9 pontos de medição:

| Posição | Valor  |
| ------- | ------ |
| Top     | text   |
| Ponto 1 | number |
| Ponto 3 | number |
| Front   | text   |
| Bottom  | text   |
| Ponto 7 | number |
| Ponto 9 | number |
| Front   | text   |

### After Adjustment

| Posição | Valor  |
| ------- | ------ |
| Up      | text   |
| Ponto 1 | number |
| Ponto 3 | number |
| Front   | text   |
| Down    | text   |
| Ponto 7 | number |
| Ponto 9 | number |
| Front   | text   |

### Notes

- **Tipo:** textarea

---

## LUBRICATION / HYDRAULICS

### Changed Oil

- **Tipo:** dropdown
- **Opções:** ["PHoseCondition","FWBearing"]

### Oil Mfg/Type

- **Tipo:** text

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
- **Opções:** ["OK","N/A","DNC"]

### Brake Anchor Clearance

- **Tipo:** number

### Brake Stopping Time

- **Tipo:** number

### Flywheel Stopping Time

- **Tipo:** number

### Clutch Engagements

- **Tipo:** number

### \*Gear Backlash

- **Tipo:** number

### Air Regulator

- **Tipo:** number

### Air Clutch Travel/Clearance

- **Tipo:** number

### Air Line Oiler Setting

- **Tipo:** text
- **Padrão:** "1 drop every 25-50 Clutch Engagements"

### Hyd Clutch Clearance

- **Tipo:** number

### Brake Clearance

- **Tipo:** number

### Notes

- **Tipo:** textarea

---

## COUNTERBALANCE CYLINDER / AIRBAG

### Counterbalance Type

- **Tipo:** text

### Airbag / Piston Seals

- **Tipo:** dropdown
- **Opções:** ["OK","N/A","DNC"]

### Regulator

- **Tipo:** number

### Gauge

- **Tipo:** number

### Pneumatics Plumbing

- **Tipo:** text

### Notes

- **Tipo:** textarea

---

## SUMMARY OF AUDIT

- **Tipo:** textarea
