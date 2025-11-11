import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInspectionDto: CreateServiceDto) {
    // Verify machine exists and get its blueprint
    const machine = await this.prisma.machine.findUnique({
      where: { id: createInspectionDto.machineId },
      include: { blueprint: true },
    });

    if (!machine) {
      throw new NotFoundException(
        `Machine with ID ${createInspectionDto.machineId} not found`,
      );
    }

    // Create the inspection
    const inspection = await this.prisma.machineService.create({
      data: {
        machineId: createInspectionDto.machineId,
        date: new Date(createInspectionDto.date),
        type: createInspectionDto.type,
        ...(createInspectionDto.status && {
          status: createInspectionDto.status,
        }),
        performedBy: createInspectionDto.performedBy,
        bearingClearance: createInspectionDto.bearingClearance
          ? {
              create: {
                outerBefore: createInspectionDto.bearingClearance.outerBefore
                  ? {
                      create: createInspectionDto.bearingClearance.outerBefore,
                    }
                  : undefined,
                outerAfter: createInspectionDto.bearingClearance.outerAfter
                  ? {
                      create: createInspectionDto.bearingClearance.outerAfter,
                    }
                  : undefined,
                innerBefore: createInspectionDto.bearingClearance.innerBefore
                  ? {
                      create: createInspectionDto.bearingClearance.innerBefore,
                    }
                  : undefined,
                innerAfter: createInspectionDto.bearingClearance.innerAfter
                  ? {
                      create: createInspectionDto.bearingClearance.innerAfter,
                    }
                  : undefined,
              },
            }
          : undefined,
        slide: createInspectionDto.slide
          ? {
              create: {
                outerBefore: createInspectionDto.slide.outerBefore
                  ? {
                      create: createInspectionDto.slide.outerBefore,
                    }
                  : undefined,
                outerAfter: createInspectionDto.slide.outerAfter
                  ? {
                      create: createInspectionDto.slide.outerAfter,
                    }
                  : undefined,
                innerBefore: createInspectionDto.slide.innerBefore
                  ? {
                      create: createInspectionDto.slide.innerBefore,
                    }
                  : undefined,
                innerAfter: createInspectionDto.slide.innerAfter
                  ? {
                      create: createInspectionDto.slide.innerAfter,
                    }
                  : undefined,
              },
            }
          : undefined,
        gibs: createInspectionDto.gibs
          ? {
              create: {
                outerBefore: createInspectionDto.gibs.outerBefore
                  ? {
                      create: createInspectionDto.gibs.outerBefore,
                    }
                  : undefined,
                outerAfter: createInspectionDto.gibs.outerAfter
                  ? {
                      create: createInspectionDto.gibs.outerAfter,
                    }
                  : undefined,
                innerBefore: createInspectionDto.gibs.innerBefore
                  ? {
                      create: createInspectionDto.gibs.innerBefore,
                    }
                  : undefined,
                innerAfter: createInspectionDto.gibs.innerAfter
                  ? {
                      create: createInspectionDto.gibs.innerAfter,
                    }
                  : undefined,
              },
            }
          : undefined,
        lubricationHydraulics: createInspectionDto.lubricationHydraulics
          ? {
              create: {
                data: {
                  create: createInspectionDto.lubricationHydraulics,
                },
              },
            }
          : undefined,
        clutch: createInspectionDto.clutch
          ? {
              create: {
                data: {
                  create: createInspectionDto.clutch,
                },
              },
            }
          : undefined,
        counterbalanceCylinderAirbag: createInspectionDto.counterbalanceCylinder
          ? {
              create: {
                outerData: {
                  create: createInspectionDto.counterbalanceCylinder,
                },
              },
            }
          : undefined,
      },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        slide: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        gibs: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        lubricationHydraulics: {
          include: {
            data: true,
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

    return inspection;
  }

  async findAll() {
    return this.prisma.machineService.findMany({
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        slide: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        gibs: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        lubricationHydraulics: {
          include: {
            data: true,
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
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const inspection = await this.prisma.machineService.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        slide: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        gibs: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        lubricationHydraulics: {
          include: {
            data: true,
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

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async findByMachine(machineId: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    return this.prisma.machineService.findMany({
      where: { machineId },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        slide: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        gibs: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        lubricationHydraulics: {
          include: {
            data: true,
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
      orderBy: {
        date: 'desc',
      },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    // Verify service exists
    const existingService = await this.prisma.machineService.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Update the service with all provided data
    const updatedService = await this.prisma.machineService.update({
      where: { id },
      data: {
        ...(updateServiceDto.date && { date: new Date(updateServiceDto.date) }),
        ...(updateServiceDto.type && { type: updateServiceDto.type }),
        ...(updateServiceDto.status && { status: updateServiceDto.status }),
        ...(updateServiceDto.performedBy !== undefined && {
          performedBy: updateServiceDto.performedBy,
        }),
        // Handle nested relations - create if data is provided
        bearingClearance: updateServiceDto.bearingClearance
          ? {
              create: {
                outerBefore: updateServiceDto.bearingClearance.outerBefore
                  ? {
                      create: updateServiceDto.bearingClearance
                        .outerBefore as any,
                    }
                  : undefined,
                outerAfter: updateServiceDto.bearingClearance.outerAfter
                  ? {
                      create: updateServiceDto.bearingClearance
                        .outerAfter as any,
                    }
                  : undefined,
                innerBefore: updateServiceDto.bearingClearance.innerBefore
                  ? {
                      create: updateServiceDto.bearingClearance
                        .innerBefore as any,
                    }
                  : undefined,
                innerAfter: updateServiceDto.bearingClearance.innerAfter
                  ? {
                      create: updateServiceDto.bearingClearance
                        .innerAfter as any,
                    }
                  : undefined,
              },
            }
          : undefined,
        slide: updateServiceDto.slide
          ? {
              create: {
                outerBefore: updateServiceDto.slide.outerBefore
                  ? {
                      create: updateServiceDto.slide.outerBefore as any,
                    }
                  : undefined,
                outerAfter: updateServiceDto.slide.outerAfter
                  ? {
                      create: updateServiceDto.slide.outerAfter as any,
                    }
                  : undefined,
                innerBefore: updateServiceDto.slide.innerBefore
                  ? {
                      create: updateServiceDto.slide.innerBefore as any,
                    }
                  : undefined,
                innerAfter: updateServiceDto.slide.innerAfter
                  ? {
                      create: updateServiceDto.slide.innerAfter as any,
                    }
                  : undefined,
              },
            }
          : undefined,
        gibs: updateServiceDto.gibs
          ? {
              create: {
                outerBefore: updateServiceDto.gibs.outerBefore
                  ? {
                      create: updateServiceDto.gibs.outerBefore as any,
                    }
                  : undefined,
                outerAfter: updateServiceDto.gibs.outerAfter
                  ? {
                      create: updateServiceDto.gibs.outerAfter as any,
                    }
                  : undefined,
                innerBefore: updateServiceDto.gibs.innerBefore
                  ? {
                      create: updateServiceDto.gibs.innerBefore as any,
                    }
                  : undefined,
                innerAfter: updateServiceDto.gibs.innerAfter
                  ? {
                      create: updateServiceDto.gibs.innerAfter as any,
                    }
                  : undefined,
              },
            }
          : undefined,
        lubricationHydraulics: updateServiceDto.lubricationHydraulics
          ? {
              create: {
                data: {
                  create: updateServiceDto.lubricationHydraulics as any,
                },
              },
            }
          : undefined,
        clutch: updateServiceDto.clutch
          ? {
              create: {
                data: {
                  create: updateServiceDto.clutch as any,
                },
              },
            }
          : undefined,
        counterbalanceCylinderAirbag: updateServiceDto.counterbalanceCylinder
          ? {
              create: {
                outerData: {
                  create: updateServiceDto.counterbalanceCylinder as any,
                },
              },
            }
          : undefined,
      },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        slide: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        gibs: {
          include: {
            outerBefore: true,
            outerAfter: true,
            innerBefore: true,
            innerAfter: true,
          },
        },
        lubricationHydraulics: {
          include: {
            data: true,
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

    return updatedService;
  }
}
