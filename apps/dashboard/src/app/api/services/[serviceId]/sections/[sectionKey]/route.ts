import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@titans-tech/db';
import type { Prisma } from '@titans-tech/db';

// Section key to Prisma relation mapping
const SECTION_TO_RELATION_KEY: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  SLIDE: 'slide',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalanceCylinderAirbag',
};

interface RouteContext {
  params: Promise<{
    serviceId: string;
    sectionKey: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { serviceId, sectionKey } = await context.params;
    const sectionData = await request.json();

    // Validate section key
    if (!SECTION_TO_RELATION_KEY[sectionKey]) {
      return NextResponse.json(
        { error: 'Invalid section key', errors: [`Unknown section: ${sectionKey}`] },
        { status: 400 },
      );
    }

    // Check if service exists
    const existingService = await prisma.machineService.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        completedSections: true,
        bearingClearance: {
          select: {
            id: true,
            outerBeforeId: true,
            outerDataId: true,
            innerBeforeId: true,
            innerDataId: true,
          },
        },
        slide: {
          select: {
            id: true,
            outerBeforeId: true,
            outerDataId: true,
            innerBeforeId: true,
            innerDataId: true,
          },
        },
        gibs: {
          select: {
            id: true,
            outerBeforeId: true,
            outerDataId: true,
            innerBeforeId: true,
            innerDataId: true,
          },
        },
        lubricationHydraulics: { select: { id: true } },
        clutch: { select: { id: true, dataId: true } },
        counterbalanceCylinderAirbag: { select: { id: true } },
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found', errors: ['Service not found'] },
        { status: 404 },
      );
    }

    // Get existing completed sections
    const completedSections = Array.isArray(existingService.completedSections)
      ? existingService.completedSections
      : [];

    // Add current section to completed if not already there
    const updatedCompletedSections = completedSections.includes(sectionKey)
      ? completedSections
      : [...completedSections, sectionKey];

    // Build update data based on section type
    const updateData: Prisma.MachineServiceUpdateInput = {
      completedSections: updatedCompletedSections,
      lastSectionSavedAt: new Date(),
    };

    // Handle each section type
    switch (sectionKey) {
      case 'BEARING_CLEARANCE': {
        const existingRecord = existingService.bearingClearance?.[0];

        if (existingRecord) {
          // Update existing bearing clearance record
          // We need to handle nested updates manually
          const updatePayload: any = {};

          // For each nested field, check if we need to create, update, or connect
          if (sectionData.outerBefore) {
            if (existingRecord.outerBeforeId) {
              // Update existing
              await prisma.bearingClearanceData.update({
                where: { id: existingRecord.outerBeforeId },
                data: sectionData.outerBefore,
              });
            } else {
              // Create new and connect
              updatePayload.outerBefore = { create: sectionData.outerBefore };
            }
          }

          if (sectionData.outerData) {
            if (existingRecord.outerDataId) {
              await prisma.bearingClearanceData.update({
                where: { id: existingRecord.outerDataId },
                data: sectionData.outerData,
              });
            } else {
              updatePayload.outerData = { create: sectionData.outerData };
            }
          }

          if (sectionData.innerBefore) {
            if (existingRecord.innerBeforeId) {
              await prisma.bearingClearanceData.update({
                where: { id: existingRecord.innerBeforeId },
                data: sectionData.innerBefore,
              });
            } else {
              updatePayload.innerBefore = { create: sectionData.innerBefore };
            }
          }

          if (sectionData.innerData) {
            if (existingRecord.innerDataId) {
              await prisma.bearingClearanceData.update({
                where: { id: existingRecord.innerDataId },
                data: sectionData.innerData,
              });
            } else {
              updatePayload.innerData = { create: sectionData.innerData };
            }
          }

          // Only update the bearing clearance record if we have new nested records to create
          if (Object.keys(updatePayload).length > 0) {
            await prisma.machineServiceBearingClearance.update({
              where: { id: existingRecord.id },
              data: updatePayload,
            });
          }
        } else {
          // Create new bearing clearance record
          updateData.bearingClearance = {
            create: await buildBearingClearanceCreateData(sectionData),
          };
        }
        break;
      }

      case 'SLIDE': {
        const existingRecord = existingService.slide?.[0];

        if (existingRecord) {
          const updatePayload: any = {};

          // Handle nested slide data
          if (sectionData.outerBefore) {
            if (existingRecord.outerBeforeId) {
              await prisma.slideData.update({
                where: { id: existingRecord.outerBeforeId },
                data: sectionData.outerBefore,
              });
            } else {
              updatePayload.outerBefore = { create: sectionData.outerBefore };
            }
          }

          if (sectionData.outerData) {
            if (existingRecord.outerDataId) {
              await prisma.slideData.update({
                where: { id: existingRecord.outerDataId },
                data: sectionData.outerData,
              });
            } else {
              updatePayload.outerData = { create: sectionData.outerData };
            }
          }

          if (sectionData.innerBefore) {
            if (existingRecord.innerBeforeId) {
              await prisma.slideData.update({
                where: { id: existingRecord.innerBeforeId },
                data: sectionData.innerBefore,
              });
            } else {
              updatePayload.innerBefore = { create: sectionData.innerBefore };
            }
          }

          if (sectionData.innerData) {
            if (existingRecord.innerDataId) {
              await prisma.slideData.update({
                where: { id: existingRecord.innerDataId },
                data: sectionData.innerData,
              });
            } else {
              updatePayload.innerData = { create: sectionData.innerData };
            }
          }

          // Handle metadata fields
          const metadataFields = [
            'outerParallelism',
            'outerHasParallelismBeenAdjusted',
            'innerParallelism',
            'innerHasParallelismBeenAdjusted',
            'outerShutheightIndicatorsChecked',
            'outerOverloadsOnTonnageMonitor',
            'outerShutheightActualSh',
            'outerIndicatorReading',
            'innerShutheightIndicatorsChecked',
            'innerOverloadsOnTonnageMonitor',
            'innerShutheightActualSh',
            'innerIndicatorReading',
            'notes',
          ];

          metadataFields.forEach((field) => {
            if (sectionData[field] !== undefined) {
              updatePayload[field] = sectionData[field];
            }
          });

          // Update the slide record
          await prisma.machineServiceSlide.update({
            where: { id: existingRecord.id },
            data: updatePayload,
          });
        } else {
          updateData.slide = {
            create: await buildSlideCreateData(sectionData),
          };
        }
        break;
      }

      case 'GIBS': {
        const existingRecord = existingService.gibs?.[0];

        if (existingRecord) {
          const updatePayload: any = {};

          // Handle nested gibs data
          if (sectionData.outerBefore) {
            if (existingRecord.outerBeforeId) {
              await prisma.gibsData.update({
                where: { id: existingRecord.outerBeforeId },
                data: sectionData.outerBefore,
              });
            } else {
              updatePayload.outerBefore = { create: sectionData.outerBefore };
            }
          }

          if (sectionData.outerData) {
            if (existingRecord.outerDataId) {
              await prisma.gibsData.update({
                where: { id: existingRecord.outerDataId },
                data: sectionData.outerData,
              });
            } else {
              updatePayload.outerData = { create: sectionData.outerData };
            }
          }

          if (sectionData.innerBefore) {
            if (existingRecord.innerBeforeId) {
              await prisma.gibsData.update({
                where: { id: existingRecord.innerBeforeId },
                data: sectionData.innerBefore,
              });
            } else {
              updatePayload.innerBefore = { create: sectionData.innerBefore };
            }
          }

          if (sectionData.innerData) {
            if (existingRecord.innerDataId) {
              await prisma.gibsData.update({
                where: { id: existingRecord.innerDataId },
                data: sectionData.innerData,
              });
            } else {
              updatePayload.innerData = { create: sectionData.innerData };
            }
          }

          // Handle notes if present
          if (sectionData.notes !== undefined) {
            updatePayload.notes = sectionData.notes;
          }

          // Update the gibs record
          await prisma.machineServiceGibs.update({
            where: { id: existingRecord.id },
            data: updatePayload,
          });
        } else {
          updateData.gibs = {
            create: await buildGibsCreateData(sectionData),
          };
        }
        break;
      }

      case 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER': {
        const existingRecord = existingService.lubricationHydraulics?.[0];

        if (existingRecord) {
          await prisma.machineServiceLubricationHydraulics.update({
            where: { id: existingRecord.id },
            data: buildLubricationHydraulicsUpdateData(sectionData),
          });
        } else {
          updateData.lubricationHydraulics = {
            create: buildLubricationHydraulicsCreateData(sectionData),
          };
        }
        break;
      }

      case 'CLUTCH': {
        const existingRecord = existingService.clutch?.[0];

        if (existingRecord) {
          // Update the nested ClutchData
          if (existingRecord.dataId) {
            await prisma.clutchData.update({
              where: { id: existingRecord.dataId },
              data: sectionData,
            });
          } else {
            // Create new ClutchData if it doesn't exist
            await prisma.machineServiceClutch.update({
              where: { id: existingRecord.id },
              data: {
                data: {
                  create: sectionData,
                },
              },
            });
          }
        } else {
          updateData.clutch = {
            create: buildClutchCreateData(sectionData),
          };
        }
        break;
      }

      case 'COUNTERBALANCE_CYLINDER_AIRBAG': {
        const existingRecord = existingService.counterbalanceCylinderAirbag?.[0];

        if (existingRecord) {
          await prisma.machineServiceCounterbalanceCylinderAirbag.update({
            where: { id: existingRecord.id },
            data: buildCounterbalanceUpdateData(sectionData),
          });
        } else {
          updateData.counterbalanceCylinderAirbag = {
            create: buildCounterbalanceCreateData(sectionData),
          };
        }
        break;
      }
    }

    // Update service with new completed sections and timestamp
    const updatedService = await prisma.machineService.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        gibs: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        lubricationHydraulics: {
          include: {
            data: {
              include: {
                gauges: true,
              },
            },
          },
        },
        clutch: {
          include: {
            data: true,
          },
        },
        counterbalanceCylinderAirbag: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedService,
      message: 'Section saved successfully',
    });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 },
    );
  }
}

// Helper functions to build update/create data for each section type

// async function buildBearingClearanceCreateData(data: any) {
//   const result: any = {};

//   // Handle outerBefore
//   if (data.outerBefore) {
//     result.outerBefore = { create: data.outerBefore };
//   }

//   // Handle outerData
//   if (data.outerData) {
//     result.outerData = { create: data.outerData };
//   }

//   // Handle innerBefore
//   if (data.innerBefore) {
//     result.innerBefore = { create: data.innerBefore };
//   }

//   // Handle innerData
//   if (data.innerData) {
//     result.innerData = { create: data.innerData };
//   }

//   return result;
// }

async function buildBearingClearanceCreateData(data: any) {
  const result: any = {};

  // Handle outerBefore - create if data exists
  if (data.outerBefore) {
    result.outerBefore = { create: data.outerBefore };
  }

  // Handle outerData
  if (data.outerData) {
    result.outerData = { create: data.outerData };
  }

  // Handle innerBefore
  if (data.innerBefore) {
    result.innerBefore = { create: data.innerBefore };
  }

  // Handle innerData
  if (data.innerData) {
    result.innerData = { create: data.innerData };
  }

  return result;
}

async function buildSlideCreateData(data: any) {
  const result: any = {};

  if (data.outerBefore) {
    result.outerBefore = { create: data.outerBefore };
  }

  if (data.outerData) {
    result.outerData = { create: data.outerData };
  }

  if (data.innerBefore) {
    result.innerBefore = { create: data.innerBefore };
  }

  if (data.innerData) {
    result.innerData = { create: data.innerData };
  }

  // Copy over metadata fields
  if (data.outerParallelism) result.outerParallelism = data.outerParallelism;
  if (data.outerHasParallelismBeenAdjusted)
    result.outerHasParallelismBeenAdjusted = data.outerHasParallelismBeenAdjusted;
  if (data.innerParallelism) result.innerParallelism = data.innerParallelism;
  if (data.innerHasParallelismBeenAdjusted)
    result.innerHasParallelismBeenAdjusted = data.innerHasParallelismBeenAdjusted;
  if (data.outerShutheightIndicatorsChecked)
    result.outerShutheightIndicatorsChecked = data.outerShutheightIndicatorsChecked;
  if (data.outerOverloadsOnTonnageMonitor)
    result.outerOverloadsOnTonnageMonitor = data.outerOverloadsOnTonnageMonitor;
  if (data.outerShutheightActualSh) result.outerShutheightActualSh = data.outerShutheightActualSh;
  if (data.outerIndicatorReading) result.outerIndicatorReading = data.outerIndicatorReading;
  if (data.innerShutheightIndicatorsChecked)
    result.innerShutheightIndicatorsChecked = data.innerShutheightIndicatorsChecked;
  if (data.innerOverloadsOnTonnageMonitor)
    result.innerOverloadsOnTonnageMonitor = data.innerOverloadsOnTonnageMonitor;
  if (data.innerShutheightActualSh) result.innerShutheightActualSh = data.innerShutheightActualSh;
  if (data.innerIndicatorReading) result.innerIndicatorReading = data.innerIndicatorReading;
  if (data.notes) result.notes = data.notes;

  return result;
}

// async function buildSlideUpdateData(data: any) {
//   return buildSlideCreateData(data); // Same structure for update
// }

async function buildGibsCreateData(data: any) {
  const result: any = {};

  if (data.outerBefore) {
    result.outerBefore = { create: data.outerBefore };
  }

  if (data.outerData) {
    result.outerData = { create: data.outerData };
  }

  if (data.innerBefore) {
    result.innerBefore = { create: data.innerBefore };
  }

  if (data.innerData) {
    result.innerData = { create: data.innerData };
  }

  if (data.notes) result.notes = data.notes;

  return result;
}

// async function buildGibsUpdateData(data: any) {
//   return buildGibsCreateData(data); // Same structure for update
// }

function buildLubricationHydraulicsCreateData(data: any) {
  return { ...data };
}

function buildLubricationHydraulicsUpdateData(data: any) {
  return { ...data };
}

function buildClutchCreateData(data: any) {
  return {
    data: {
      create: { ...data },
    },
  };
}

// function buildClutchUpdateData(data: any) {
//   return { ...data };
// }

function buildCounterbalanceCreateData(data: any) {
  return { ...data };
}

function buildCounterbalanceUpdateData(data: any) {
  return { ...data };
}
