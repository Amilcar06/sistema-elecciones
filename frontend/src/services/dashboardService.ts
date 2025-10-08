import { apiClient } from '../api/client';
import { Usuario, BaseFilters, DateFilters } from '../api/types';

// Tipos específicos para dashboard
export interface DashboardStats {
  usuarios: {
    total: number;
    activos: number;
    inactivos: number;
  };
  elecciones: {
    total: number;
    activas: number;
    porEstado: Record<string, number>;
  };
  contenido: {
    cargos: number;
    candidatos: number;
    resultados: number;
  };
}

export interface UsuarioFilters extends BaseFilters {
  rol?: string;
  estado?: string;
}

export interface UsuarioResponse {
  usuarios: Usuario[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EleccionFilters extends BaseFilters {
  estado?: string;
  usuario?: string;
}

export interface Eleccion {
  id_eleccion: number;
  nombre: string;
  fecha: string;
  estado: string;
  descripcion: string | null;
  usuario_creador: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
  _count: {
    cargos: number;
    publicaciones: number;
  };
}

export interface EleccionResponse {
  elecciones: Eleccion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditoriaFilters extends BaseFilters, DateFilters {
  tabla?: string;
  accion?: string;
}

export interface Auditoria {
  id_auditoria: number;
  tabla: string;
  accion: string;
  id_registro: number;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_address: string | null;
  created_at: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

export interface AuditoriaResponse {
  auditorias: Auditoria[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Servicio de dashboard
export const dashboardService = {
  /**
   * Obtener estadísticas del dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      return await apiClient.get<DashboardStats>('/dashboard/stats');
    } catch (error) {
      throw new Error('Error obteniendo estadísticas');
    }
  },

  /**
   * Obtener usuarios con filtros
   */
  getUsuarios: async (filters: UsuarioFilters = {}): Promise<UsuarioResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.rol) params.append('rol', filters.rol);
      if (filters.estado) params.append('estado', filters.estado);

      const queryString = params.toString();
      const endpoint = queryString ? `/dashboard/usuarios?${queryString}` : '/dashboard/usuarios';
      
      return await apiClient.get<UsuarioResponse>(endpoint);
    } catch (error) {
      throw new Error('Error obteniendo usuarios');
    }
  },

  /**
   * Actualizar usuario
   */
  updateUsuario: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
    try {
      return await apiClient.put<Usuario>(`/dashboard/usuarios/${id}`, data);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error actualizando usuario');
    }
  },

  /**
   * Eliminar usuario
   */
  deleteUsuario: async (id: number): Promise<{ message: string }> => {
    try {
      return await apiClient.delete<{ message: string }>(`/dashboard/usuarios/${id}`);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error eliminando usuario');
    }
  },

  /**
   * Obtener auditoría con filtros
   */
  getAuditoria: async (filters: AuditoriaFilters = {}): Promise<AuditoriaResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.tabla) params.append('tabla', filters.tabla);
      if (filters.accion) params.append('accion', filters.accion);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);

      const queryString = params.toString();
      const endpoint = queryString ? `/dashboard/auditoria?${queryString}` : '/dashboard/auditoria';
      
      return await apiClient.get<AuditoriaResponse>(endpoint);
    } catch (error) {
      throw new Error('Error obteniendo auditoría');
    }
  },

  /**
   * Obtener elecciones con filtros
   */
  getElecciones: async (filters: EleccionFilters = {}): Promise<EleccionResponse> => {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.usuario) params.append('usuario', filters.usuario);

      const queryString = params.toString();
      const endpoint = queryString ? `/dashboard/elecciones?${queryString}` : '/dashboard/elecciones';
      
      return await apiClient.get<EleccionResponse>(endpoint);
    } catch (error) {
      throw new Error('Error obteniendo elecciones');
    }
  },

  /**
   * Eliminar elección
   */
  deleteEleccion: async (id: number): Promise<{ message: string }> => {
    try {
      return await apiClient.delete<{ message: string }>(`/dashboard/elecciones/${id}`);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error eliminando elección');
    }
  }
};
