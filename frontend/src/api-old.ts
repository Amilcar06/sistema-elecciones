export const API_URL = "http://localhost:3001/api";

// Tipos para autenticación
export interface Usuario {
  id_usuario: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  estado: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: Usuario;
}

export interface AuthError {
  error: string;
}

// Función para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para hacer requests autenticados
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

// API de Autenticación
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.error || 'Error en el login');
    }

    return response.json();
  },

  // Logout
  logout: async (): Promise<void> => {
    const response = await authenticatedFetch(`${API_URL}/auth/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      console.error('Error en logout');
    }
  },

  // Obtener información del usuario actual
  getMe: async (): Promise<{ usuario: Usuario }> => {
    const response = await authenticatedFetch(`${API_URL}/auth/me`);

    if (!response.ok) {
      throw new Error('Error obteniendo información del usuario');
    }

    return response.json();
  },

  // Cambiar contraseña
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await authenticatedFetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.error || 'Error cambiando contraseña');
    }

    return response.json();
  },
};

// API del Dashboard
export const dashboardAPI = {
  // Estadísticas
  getStats: async () => {
    const response = await authenticatedFetch(`${API_URL}/dashboard/stats`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo estadísticas');
    }
    
    return response.json();
  },

  // Usuarios
  getUsuarios: async (page = 1, limit = 10, search = '', rol = '', estado = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(rol && { rol }),
      ...(estado && { estado }),
    });

    const response = await authenticatedFetch(`${API_URL}/dashboard/usuarios?${params}`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo usuarios');
    }
    
    return response.json();
  },

  // Actualizar usuario
  updateUsuario: async (id: number, data: Partial<Usuario>) => {
    const response = await authenticatedFetch(`${API_URL}/dashboard/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.error || 'Error actualizando usuario');
    }
    
    return response.json();
  },

  // Eliminar usuario
  deleteUsuario: async (id: number) => {
    const response = await authenticatedFetch(`${API_URL}/dashboard/usuarios/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.error || 'Error eliminando usuario');
    }
    
    return response.json();
  },

  // Auditoría
  getAuditoria: async (page = 1, limit = 20, tabla = '', accion = '', fechaDesde = '', fechaHasta = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(tabla && { tabla }),
      ...(accion && { accion }),
      ...(fechaDesde && { fechaDesde }),
      ...(fechaHasta && { fechaHasta }),
    });

    const response = await authenticatedFetch(`${API_URL}/dashboard/auditoria?${params}`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo auditoría');
    }
    
    return response.json();
  },

  // Elecciones
  getElecciones: async (page = 1, limit = 10, search = '', estado = '', usuario = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(estado && { estado }),
      ...(usuario && { usuario }),
    });

    const response = await authenticatedFetch(`${API_URL}/dashboard/elecciones?${params}`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo elecciones');
    }
    
    return response.json();
  },

  // Eliminar elección
  deleteEleccion: async (id: number) => {
    const response = await authenticatedFetch(`${API_URL}/dashboard/elecciones/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error: AuthError = await response.json();
      throw new Error(error.error || 'Error eliminando elección');
    }
    
    return response.json();
  },
};