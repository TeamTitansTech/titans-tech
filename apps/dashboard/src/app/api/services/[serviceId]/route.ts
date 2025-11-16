import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@titans-tech/db';

type RouteContext = {
  params: Promise<{
    serviceId: string;
  }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { serviceId } = await context.params;

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Check if service exists
    const service = await prisma.machineService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Delete the service (cascade delete will handle related records)
    await prisma.machineService.delete({
      where: { id: serviceId },
    });

    return NextResponse.json(
      {
        data: { id: serviceId },
        message: 'Service deleted successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete service',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
