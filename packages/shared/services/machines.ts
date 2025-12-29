import { PrismaClient } from '@titans-tech/db';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export const machinesService = {
  /**
   * Soft delete cascade for machine and all related entities
   */
  async softDeleteCascade(tx: TransactionClient, machineId: string): Promise<void> {
    // 1. Soft delete all MachineServices
    await tx.machineService.deleteMany({
      where: { machineId },
    });

    // 2. Soft delete all MachineFields
    await tx.machineField.deleteMany({
      where: { machineId },
    });

    // 3. Soft delete all ServiceRequests
    await tx.serviceRequest.deleteMany({
      where: { machineId },
    });

    // 4. Soft delete all MachineProductionLines (junction table)
    await tx.machineProductionLine.deleteMany({
      where: { machineId },
    });

    // 5. Finally, soft delete the Machine itself
    await tx.machine.delete({
      where: { id: machineId },
    });
  },
};

export default machinesService;
