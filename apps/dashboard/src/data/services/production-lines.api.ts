'use server';
import type {
  ProductionLine,
  CreateProductionLineDto,
  UpdateProductionLineDto,
} from '../types/production-lines.types';



// Por enquanto, usando mocks para desenvolvimento frontend 

export const getProductionLines = async () => {
  // return await responseHandler<ProductionLine[]>('/production-lines', {
  //   method: 'GET',
  // });

  // Mock temporário
  return {
    data: [] as ProductionLine[],
    errors: null,
  };
};

export const getProductionLineById = async (id: string) => {
  // return await responseHandler<ProductionLine>(`/production-lines/${id}`, {
  //   method: 'GET',
  // });

  // Mock temporário
  return {
    data: {
      id,
      name: 'Mock Production Line',
      companyId: '',
      userId: '',
      machineIds: [],
      machines: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProductionLine,
    errors: null,
  };
};

export const createProductionLine = async (data: CreateProductionLineDto) => {
  // return await responseHandler<ProductionLine>('/production-lines', {
  //   method: 'POST',
  //   body: data,
  // });

  // Mock temporário
  const mockId = `pl_${Date.now()}`;
  return {
    data: {
      id: mockId,
      ...data,
      companyId: '',
      userId: '',
      machineIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProductionLine,
    errors: null,
  };
};

export const updateProductionLine = async (id: string, data: UpdateProductionLineDto) => {
  // return await responseHandler<ProductionLine>(`/production-lines/${id}`, {
  //   method: 'PATCH',
  //   body: data,
  // });

  // Mock temporário
  return {
    data: {
      id,
      name: data.name || 'Updated Line',
      companyId: data.companyId || '',
      userId: '',
      machineIds: data.machineIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProductionLine,
    errors: null,
  };
};

export const deleteProductionLine = async (_id: string) => {
  // return await responseHandler<void>(`/production-lines/${id}`, {
  //   method: 'DELETE',
  // });

  // Mock temporário
  return {
    data: null,
    errors: null,
  };
};
