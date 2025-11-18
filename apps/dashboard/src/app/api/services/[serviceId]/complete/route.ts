import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@titans-tech/db';
import { ServiceStatus } from '@titans-tech/shared/types';

interface RouteContext {
  params: Promise<{
    serviceId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { serviceId } = await context.params;
    const body = await request.json();
    const { performedBy } = body;

    // Get existing service with all section data
    const service = await prisma.machineService.findUnique({
      where: { id: serviceId },
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
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found', errors: ['Service not found'] },
        { status: 404 },
      );
    }

    // Get completed sections
    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    // Validate that at least one section is completed
    if (completedSections.length === 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: ['At least one section must be completed before finishing the service'],
        },
        { status: 400 },
      );
    }

    // Update service to COMPLETED status
    const updatedService = await prisma.machineService.update({
      where: { id: serviceId },
      data: {
        status: ServiceStatus.COMPLETED,
        performedBy: performedBy || null,
      },
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
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedService,
      message: 'Service completed successfully',
    });
  } catch (error) {
    console.error('Error completing service:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 },
    );
  }
}
