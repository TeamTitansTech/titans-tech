import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AlertsService } from '../modules/alerts/alerts.service';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

  async create(createInspectionDto: CreateServiceDto): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearance: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        slide: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        gibs: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        lubricationHydraulics: {
          include: { data: { include: { gauges: true } } };
        };
        clutch: { include: { data: true } };
        counterbalanceCylinderAirbag: {
          include: { outerData: true; innerData: true };
        };
      };
    }>
  > {
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
    const dataPayload: Prisma.MachineServiceCreateInput = {
      machine: {
        connect: { id: createInspectionDto.machineId },
      },
      date: new Date(createInspectionDto.date),
      type: createInspectionDto.type,
      ...(createInspectionDto.status && {
        status: createInspectionDto.status,
      }),
      ...(createInspectionDto.performedBy && {
        performedBy: createInspectionDto.performedBy,
      }),
      ...(createInspectionDto.bearingClearance && {
        bearingClearance: {
          create: {
            outerBefore: createInspectionDto.bearingClearance.outerBefore
              ? {
                  create: createInspectionDto.bearingClearance.outerBefore,
                }
              : undefined,
            outerData: createInspectionDto.bearingClearance.outerAfter
              ? {
                  create: createInspectionDto.bearingClearance.outerAfter,
                }
              : undefined,
            innerBefore: createInspectionDto.bearingClearance.innerBefore
              ? {
                  create: createInspectionDto.bearingClearance.innerBefore,
                }
              : undefined,
            innerData: createInspectionDto.bearingClearance.innerAfter
              ? {
                  create: createInspectionDto.bearingClearance.innerAfter,
                }
              : undefined,
          },
        },
      }),
      ...(createInspectionDto.slide && {
        slide: {
          create: {
            ...(createInspectionDto.slide.outerBefore && {
              outerBefore: {
                create: createInspectionDto.slide.outerBefore,
              },
            }),
            ...(createInspectionDto.slide.outerData && {
              outerData: {
                create: createInspectionDto.slide.outerData,
              },
            }),
            ...(createInspectionDto.slide.innerBefore && {
              innerBefore: {
                create: createInspectionDto.slide.innerBefore,
              },
            }),
            ...(createInspectionDto.slide.innerData && {
              innerData: {
                create: createInspectionDto.slide.innerData,
              },
            }),
            ...(createInspectionDto.slide.parallelism && {
              parallelism: createInspectionDto.slide.parallelism,
            }),
            ...(createInspectionDto.slide.hasParallelismBeenAdjusted && {
              hasParallelismBeenAdjusted:
                createInspectionDto.slide.hasParallelismBeenAdjusted,
            }),
            ...(createInspectionDto.slide.outerShutheightIndicatorsChecked && {
              outerShutheightIndicatorsChecked:
                createInspectionDto.slide.outerShutheightIndicatorsChecked,
            }),
            ...(createInspectionDto.slide.outerOverloadsOnTonnageMonitor && {
              outerOverloadsOnTonnageMonitor:
                createInspectionDto.slide.outerOverloadsOnTonnageMonitor,
            }),
            ...(createInspectionDto.slide.outerShutheightActualSh && {
              outerShutheightActualSh:
                createInspectionDto.slide.outerShutheightActualSh,
            }),
            ...(createInspectionDto.slide.outerIndicatorReading && {
              outerIndicatorReading:
                createInspectionDto.slide.outerIndicatorReading,
            }),
            ...(createInspectionDto.slide.innerShutheightIndicatorsChecked && {
              innerShutheightIndicatorsChecked:
                createInspectionDto.slide.innerShutheightIndicatorsChecked,
            }),
            ...(createInspectionDto.slide.innerOverloadsOnTonnageMonitor && {
              innerOverloadsOnTonnageMonitor:
                createInspectionDto.slide.innerOverloadsOnTonnageMonitor,
            }),
            ...(createInspectionDto.slide.innerShutheightActualSh && {
              innerShutheightActualSh:
                createInspectionDto.slide.innerShutheightActualSh,
            }),
            ...(createInspectionDto.slide.innerIndicatorReading && {
              innerIndicatorReading:
                createInspectionDto.slide.innerIndicatorReading,
            }),
            ...(createInspectionDto.slide.notes && {
              notes: createInspectionDto.slide.notes,
            }),
          },
        },
      }),
      ...(createInspectionDto.gibs && {
        gibs: {
          create: {
            outerBefore: createInspectionDto.gibs.outerBefore
              ? {
                  create: createInspectionDto.gibs.outerBefore,
                }
              : undefined,
            outerData: createInspectionDto.gibs.outerAfter
              ? {
                  create: createInspectionDto.gibs.outerAfter,
                }
              : undefined,
            innerBefore: createInspectionDto.gibs.innerBefore
              ? {
                  create: createInspectionDto.gibs.innerBefore,
                }
              : undefined,
            innerData: createInspectionDto.gibs.innerAfter
              ? {
                  create: createInspectionDto.gibs.innerAfter,
                }
              : undefined,
          },
        },
      }),
      ...(createInspectionDto.lubricationHydraulics && {
        lubricationHydraulics: {
          create: {
            data: {
              create: {
                changedOil:
                  createInspectionDto.lubricationHydraulics.changedOil,
                oilTemperatureF:
                  createInspectionDto.lubricationHydraulics.oilTemperatureF,
                oilMfgType:
                  createInspectionDto.lubricationHydraulics.oilMfgType,
                changedFilter:
                  createInspectionDto.lubricationHydraulics.changedFilter,
                notes: createInspectionDto.lubricationHydraulics.notes,
                gauges: {
                  create:
                    createInspectionDto.lubricationHydraulics.gauges?.map(
                      (gauge) => ({
                        system: gauge.system,
                        gauge: gauge.gauge,
                        psi: gauge.psi,
                      }),
                    ) || [],
                },
              },
            },
          },
        },
      }),
      ...(createInspectionDto.clutch && {
        clutch: {
          create: {
            data: {
              create: createInspectionDto.clutch,
            },
          },
        },
      }),
      ...((createInspectionDto.counterbalanceCylinder?.outerData ||
        createInspectionDto.counterbalanceCylinder?.innerData) && {
        counterbalanceCylinderAirbag: {
          create: {
            ...(createInspectionDto.counterbalanceCylinder.outerData && {
              outerData: {
                create: createInspectionDto.counterbalanceCylinder
                  .outerData as Prisma.CounterbalanceCylinderAirbagDataCreateWithoutOuterServicesInput,
              },
            }),
            ...(createInspectionDto.counterbalanceCylinder.innerData && {
              innerData: {
                create: createInspectionDto.counterbalanceCylinder
                  .innerData as Prisma.CounterbalanceCylinderAirbagDataCreateWithoutInnerServicesInput,
              },
            }),
          },
        },
      }),
    };

    const inspection = await this.prisma.machineService.create({
      data: dataPayload,
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

    return inspection;
  }

  async findAll(): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearance: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        slide: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        gibs: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        lubricationHydraulics: {
          include: { data: { include: { gauges: true } } };
        };
        clutch: { include: { data: true } };
        counterbalanceCylinderAirbag: {
          include: { outerData: true; innerData: true };
        };
      };
    }>[]
  > {
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
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearance: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        slide: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        gibs: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        lubricationHydraulics: {
          include: { data: { include: { gauges: true } } };
        };
        clutch: { include: { data: true } };
        counterbalanceCylinderAirbag: {
          include: { outerData: true; innerData: true };
        };
      };
    }>
  > {
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

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async findByMachine(machineId: string): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearance: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        slide: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        gibs: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        lubricationHydraulics: {
          include: { data: { include: { gauges: true } } };
        };
        clutch: { include: { data: true } };
        counterbalanceCylinderAirbag: {
          include: { outerData: true; innerData: true };
        };
      };
    }>[]
  > {
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
      orderBy: {
        date: 'desc',
      },
    });
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearance: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        slide: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        gibs: {
          include: {
            outerBefore: true;
            outerData: true;
            innerBefore: true;
            innerData: true;
          };
        };
        lubricationHydraulics: {
          include: { data: { include: { gauges: true } } };
        };
        clutch: { include: { data: true } };
        counterbalanceCylinderAirbag: {
          include: { outerData: true; innerData: true };
        };
      };
    }>
  > {
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
                        .outerBefore as Prisma.BearingClearanceDataCreateWithoutOuterBeforeServicesInput,
                    }
                  : undefined,
                outerData: updateServiceDto.bearingClearance.outerAfter
                  ? {
                      create: updateServiceDto.bearingClearance
                        .outerAfter as Prisma.BearingClearanceDataCreateWithoutOuterDataServicesInput,
                    }
                  : undefined,
                innerBefore: updateServiceDto.bearingClearance.innerBefore
                  ? {
                      create: updateServiceDto.bearingClearance
                        .innerBefore as Prisma.BearingClearanceDataCreateWithoutInnerBeforeServicesInput,
                    }
                  : undefined,
                innerData: updateServiceDto.bearingClearance.innerAfter
                  ? {
                      create: updateServiceDto.bearingClearance
                        .innerAfter as Prisma.BearingClearanceDataCreateWithoutInnerDataServicesInput,
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
                      create: updateServiceDto.slide
                        .outerBefore as Prisma.SlideDataCreateWithoutOuterBeforeServicesInput,
                    }
                  : undefined,
                outerData: updateServiceDto.slide.outerAfter
                  ? {
                      create: updateServiceDto.slide
                        .outerAfter as Prisma.SlideDataCreateWithoutOuterDataServicesInput,
                    }
                  : undefined,
                innerBefore: updateServiceDto.slide.innerBefore
                  ? {
                      create: updateServiceDto.slide
                        .innerBefore as Prisma.SlideDataCreateWithoutInnerBeforeServicesInput,
                    }
                  : undefined,
                innerData: updateServiceDto.slide.innerAfter
                  ? {
                      create: updateServiceDto.slide
                        .innerAfter as Prisma.SlideDataCreateWithoutInnerDataServicesInput,
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
                      create: updateServiceDto.gibs
                        .outerBefore as Prisma.GibsDataCreateWithoutOuterBeforeServicesInput,
                    }
                  : undefined,
                outerData: updateServiceDto.gibs.outerAfter
                  ? {
                      create: updateServiceDto.gibs
                        .outerAfter as Prisma.GibsDataCreateWithoutOuterDataServicesInput,
                    }
                  : undefined,
                innerBefore: updateServiceDto.gibs.innerBefore
                  ? {
                      create: updateServiceDto.gibs
                        .innerBefore as Prisma.GibsDataCreateWithoutInnerBeforeServicesInput,
                    }
                  : undefined,
                innerData: updateServiceDto.gibs.innerAfter
                  ? {
                      create: updateServiceDto.gibs
                        .innerAfter as Prisma.GibsDataCreateWithoutInnerDataServicesInput,
                    }
                  : undefined,
              },
            }
          : undefined,
        lubricationHydraulics: updateServiceDto.lubricationHydraulics
          ? {
              create: {
                data: {
                  create: {
                    changedOil:
                      updateServiceDto.lubricationHydraulics.changedOil,
                    oilTemperatureF:
                      updateServiceDto.lubricationHydraulics.oilTemperatureF,
                    oilMfgType:
                      updateServiceDto.lubricationHydraulics.oilMfgType,
                    changedFilter:
                      updateServiceDto.lubricationHydraulics.changedFilter,
                    notes: updateServiceDto.lubricationHydraulics.notes,
                    gauges: {
                      create:
                        updateServiceDto.lubricationHydraulics.gauges?.map(
                          (gauge) => ({
                            system: gauge.system,
                            gauge: gauge.gauge,
                            psi: gauge.psi,
                          }),
                        ) || [],
                    },
                  },
                },
              },
            }
          : undefined,
        clutch: updateServiceDto.clutch
          ? {
              create: {
                data: {
                  create:
                    updateServiceDto.clutch as Prisma.ClutchDataCreateWithoutServicesInput,
                },
              },
            }
          : undefined,
        counterbalanceCylinderAirbag:
          updateServiceDto.counterbalanceCylinder?.outerData ||
          updateServiceDto.counterbalanceCylinder?.innerData
            ? {
                create: {
                  ...(updateServiceDto.counterbalanceCylinder.outerData && {
                    outerData: {
                      create: updateServiceDto.counterbalanceCylinder
                        .outerData as Prisma.CounterbalanceCylinderAirbagDataCreateWithoutOuterServicesInput,
                    },
                  }),
                  ...(updateServiceDto.counterbalanceCylinder.innerData && {
                    innerData: {
                      create: updateServiceDto.counterbalanceCylinder
                        .innerData as Prisma.CounterbalanceCylinderAirbagDataCreateWithoutInnerServicesInput,
                    },
                  }),
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

    if (updateServiceDto.bearingClearance) {
      console.log(
        '🚀 [SERVICES] Bearing clearance data updated, generating alerts...',
      );
      try {
        await this.alertsService.generateAlertsForService(id);
        console.log('✅ [SERVICES] Alert generation completed successfully');
      } catch (error) {
        console.error('❌ [SERVICES] Error generating alerts:', error);
        console.error('Stack:', error.stack);
      }
    }

    return updatedService;
  }
}
