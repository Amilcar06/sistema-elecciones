// Tipos comunes para la API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  details?: any;
}

// Tipos para filtros comunes
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateFilters {
  fechaDesde?: string;
  fechaHasta?: string;
}

// Tipos para estados comunes
export type EstadoGeneral = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type EstadoEleccion = 'DRAFT' | 'EN_CURSO' | 'FINALIZADA';
