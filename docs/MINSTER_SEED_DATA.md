# Minster Press Equipment Inspection Seed Data

This dataset has been extracted from Minster work order Excel files for industrial press equipment inspections.

## Files Overview

### Seed Data Files

- **`seed-data.json`** - Clean, structured JSON seed data
- **`seed-data.ts`** - TypeScript/JavaScript seed data with typed exports
- **`seed-data.sql`** - PostgreSQL seed data with table creation scripts
- **`schema.prisma`** - Prisma ORM schema definition
- **`detailed-seed-data.json`** - Complete detailed extraction including all measurements
- **`complete_extracted_data.json`** - Raw comprehensive extraction from all Excel sheets

## Data Structure

### Entities

#### 1. **Customers**

Customer information for equipment owners.

```json
{
  "id": 1,
  "name": "Aruma Produtora De Embalagens",
  "address": "Rodovia Br 101 S/N Km 133",
  "city": "Distrito De Grotao",
  "state": "Estancia",
  "postal_code": "49200-000",
  "country": "Brazil"
}
```

#### 2. **Technicians**

Service technicians performing inspections.

```json
{
  "id": 1,
  "name": "Julio De Souza",
  "service_center": "USA"
}
```

#### 3. **Equipment**

Industrial press equipment being serviced.

```json
{
  "id": 1,
  "customer_id": 1,
  "manufacturer": "Minster",
  "model": "DAC",
  "serial_number": "30645",
  "size_tonnage": 150,
  "stroke": "2 to 5,75",
  "frame_type": "Straight-Side",
  "clutch_type": "Hyd",
  "pneumatic_system": "Counterbalance",
  "foundation_type": "Plant Floor",
  "press_mounting": "Adjustable"
}
```

#### 4. **Work Orders**

Service inspection work orders.

```json
{
  "id": 1,
  "work_order_number": 22522,
  "customer_id": 1,
  "equipment_id": 1,
  "technician_id": 1,
  "date": "2022-02-24",
  "work_type": "Inspection",
  "metric_us": "US",
  "status": "completed"
}
```

#### 5. **Inspection Questions**

Standardized inspection checklist questions.

```json
{
  "id": 1,
  "category": "foundation",
  "question": "Is Press Level?",
  "type": "yes_no"
}
```

#### 6. **Inspection Responses**

Answers to inspection questions for each work order.

```json
{
  "id": 1,
  "work_order_id": 1,
  "question_id": 1,
  "answer": "Yes",
  "notes": null
}
```

#### 7. **Bearing Measurements**

Precision measurements of bearing clearances.

```json
{
  "id": 1,
  "work_order_id": 1,
  "bearing_type": "Total Clearance",
  "left_hand": 0.021,
  "right_hand": 0.019,
  "differential": 0.002,
  "unit": "inches",
  "notes": null
}
```

## Usage Examples

### Using JSON Seed Data

```javascript
import seedData from './seed-data.json';

// Access customers
const customers = seedData.customers;

// Access work orders
const workOrders = seedData.work_orders;

// Find work order by number
const wo = workOrders.find((w) => w.work_order_number === 22522);
```

### Using TypeScript Seed Data

```typescript
import {
  customers,
  technicians,
  equipment,
  workOrders,
  inspectionQuestions,
  inspectionResponses,
  bearingMeasurements,
} from './seed-data';

// Use with type safety
const customer = customers[0];
console.log(customer.name);
```

### Using SQL Seed Data

```bash
# PostgreSQL
psql -U username -d database_name -f seed-data.sql

# Or programmatically
const fs = require('fs');
const sql = fs.readFileSync('seed-data.sql', 'utf8');
await db.query(sql);
```

### Using Prisma Schema

```bash
# 1. Copy schema.prisma to your project
cp schema.prisma ./prisma/schema.prisma

# 2. Generate Prisma Client
npx prisma generate

# 3. Push schema to database
npx prisma db push

# 4. Use in your code
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const workOrders = await prisma.workOrder.findMany({
  include: {
    customer: true,
    equipment: true,
    technician: true,
    inspectionResponses: {
      include: {
        question: true
      }
    }
  }
});
```

## Database Relationships

```
Customer (1) ----< (N) Equipment
Customer (1) ----< (N) WorkOrder
Technician (1) ----< (N) WorkOrder
Equipment (1) ----< (N) WorkOrder
WorkOrder (1) ----< (N) InspectionResponse
WorkOrder (1) ----< (N) BearingMeasurement
InspectionQuestion (1) ----< (N) InspectionResponse
```

## Work Order Details

### Work Order #22522 (2022-02-24)

- Customer: Aruma Produtora De Embalagens
- Equipment: Minster DAC 150-ton press (Serial #30645)
- Technician: Julio De Souza
- Type: Inspection
- Status: Completed

### Work Order #9062024 (2024-09-06)

- Customer: Aruma Produtora De Embalagens
- Equipment: Minster DAC 150-ton press (Serial #30645)
- Technician: Julio De Souza
- Type: Inspection
- Status: Completed

## Equipment Specifications

### Minster DAC Press (Serial #30645)

- **Type**: Straight-Side Press
- **Capacity**: 150 tons
- **Model**: DAC
- **Stroke**: 2 to 5.75 inches
- **Clutch**: Hydraulic
- **Pneumatic System**: Counterbalance
- **Foundation**: Plant Floor
- **Mounting**: Adjustable

## Inspection Categories

1. **Foundation** - Press level, mounting, foundation type
2. **Motor** - Motor security, belt condition, motor plate
3. **Safety** - Protective covers, guards, safety systems
4. **Structural** - Cracks, wear, structural integrity
5. **Bearing Clearances** - Precision measurements of all bearings
6. **Lubrication** - Lubrication points and conditions

## File Descriptions

### `seed-data.json`

Clean, normalized seed data ready for import into any system. Best for:

- Quick prototyping
- Frontend mock data
- Testing
- Documentation

### `seed-data.ts`

TypeScript exports with proper typing. Best for:

- TypeScript/JavaScript projects
- Next.js applications
- React applications
- Node.js backends

### `seed-data.sql`

Complete SQL script with table creation and data insertion. Best for:

- PostgreSQL databases
- Quick database setup
- Migration scripts
- Database initialization

### `schema.prisma`

Prisma ORM schema definition. Best for:

- Modern TypeScript backends
- Full-stack applications
- Type-safe database access
- Rapid development

### `detailed-seed-data.json`

Comprehensive extraction including:

- All bearing measurements
- Lubrication points
- Complete equipment specifications
- All inspection responses

### `complete_extracted_data.json`

Raw extraction from Excel files including:

- All sheets (WO Info, Press, MHE, Non-Minster, Data Options)
- Original formatting
- Complete data preservation

## Use Cases

1. **Equipment Maintenance System** - Track service history and inspections
2. **Predictive Maintenance** - Analyze bearing trends over time
3. **Service Reporting** - Generate service reports and documentation
4. **Customer Portal** - Show customers their equipment service history
5. **Technician Dashboard** - Track work orders and inspections
6. **Analytics** - Analyze equipment performance and maintenance patterns

## Sample Queries

### Find all work orders for a customer

```typescript
const customerWorkOrders = workOrders.filter((wo) => wo.customer_id === 1);
```

### Get inspection results for a work order

```typescript
const wo22522Inspections = inspectionResponses.filter((resp) => resp.work_order_id === 1);
```

### Analyze bearing trends

```typescript
const bearingTrends = bearingMeasurements
  .filter((m) => m.bearing_type === 'Total Clearance')
  .sort((a, b) => a.work_order_id - b.work_order_id);
```

## License

This data was extracted from work order files for seeding purposes. Use according to your project's requirements.

## Contributing

Feel free to extend this schema with additional fields or relationships as needed for your specific use case.

---

Generated from Minster press equipment inspection Excel files.
