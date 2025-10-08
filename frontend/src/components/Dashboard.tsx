import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Users, 
  Vote, 
  Settings, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle
} from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useDebounce } from './ui/PerformanceOptimized';
import { dashboardService } from '../services/dashboardService';
import { Usuario } from '../api/types';
import { AdvancedFilters, UsuarioFilters, EleccionFilters } from './AdvancedFilters';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ui/Toast';

// Componente para editar usuario
interface EditUsuarioFormProps {
  usuario: Usuario;
  onSave: (data: Partial<Usuario>) => void;
  onCancel: () => void;
}

const EditUsuarioForm: React.FC<EditUsuarioFormProps> = ({ usuario, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
    estado: usuario.estado
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apellido">Apellido</Label>
        <Input
          id="apellido"
          value={formData.apellido}
          onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="rol">Rol</Label>
        <Select value={formData.rol} onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
            <SelectItem value="OBSERVADOR">Observador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVO">Activo</SelectItem>
            <SelectItem value="INACTIVO">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};

interface DashboardStats {
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

// Usuario ya está importado desde api/types

interface Eleccion {
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

interface Auditoria {
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

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [auditoria, setAuditoria] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modal de edición
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  // Estados para filtros
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [usuarioRol, setUsuarioRol] = useState('ALL');
  const [usuarioEstado, setUsuarioEstado] = useState('ALL');

  // Hook de toast
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsData, usuariosData, eleccionesData, auditoriaData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getUsuarios(),
        dashboardService.getElecciones(),
        dashboardService.getAuditoria()
      ]);

      setStats(statsData);
      setUsuarios(usuariosData.usuarios);
      setElecciones(eleccionesData.elecciones);
      setAuditoria(auditoriaData.auditorias);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteUsuario = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      await dashboardService.deleteUsuario(id);
      setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
      success('Usuario eliminado exitosamente', 'El usuario ha sido eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      error('Error eliminando usuario', 'No se pudo eliminar el usuario. Inténtalo de nuevo.');
    }
  }, []);

  const handleDeleteEleccion = useCallback(async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta elección? Esta acción eliminará todos los datos relacionados.')) return;

    try {
      await dashboardService.deleteEleccion(id);
      setElecciones(prev => prev.filter(e => e.id_eleccion !== id));
      success('Elección eliminada exitosamente', 'La elección y todos sus datos relacionados han sido eliminados');
      loadDashboardData(); // Recargar stats
    } catch (error) {
      console.error('Error eliminando elección:', error);
      error('Error eliminando elección', 'No se pudo eliminar la elección. Inténtalo de nuevo.');
    }
  }, [loadDashboardData]);

  const handleEditUsuario = useCallback((usuario: Usuario) => {
    setEditingUsuario(usuario);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateUsuario = useCallback(async (updatedData: Partial<Usuario>) => {
    if (!editingUsuario) return;

    try {
      const updatedUsuario = await dashboardService.updateUsuario(editingUsuario.id_usuario, updatedData);
      setUsuarios(prev => prev.map(u => 
        u.id_usuario === editingUsuario.id_usuario ? updatedUsuario : u
      ));
      setIsEditModalOpen(false);
      setEditingUsuario(null);
      success('Usuario actualizado exitosamente', 'Los datos del usuario han sido actualizados correctamente');
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      error('Error actualizando usuario', 'No se pudo actualizar el usuario. Inténtalo de nuevo.');
    }
  }, [editingUsuario]);

  const getRolBadgeVariant = useCallback((rol: string) => {
    switch (rol) {
      case 'ADMIN': return 'destructive';
      case 'ORGANIZADOR': return 'default';
      case 'OBSERVADOR': return 'secondary';
      default: return 'outline';
    }
  }, []);

  const getEstadoBadgeVariant = useCallback((estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'secondary';
      case 'INACTIVO': return 'outline';
      case 'SUSPENDIDO': return 'destructive';
      default: return 'outline';
    }
  }, []);

  // Memoized filtered usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = !usuarioSearch || 
        usuario.nombre.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
        usuario.email.toLowerCase().includes(usuarioSearch.toLowerCase());
      
      const matchesRol = !usuarioRol || usuarioRol === 'ALL' || usuario.rol === usuarioRol;
      const matchesEstado = !usuarioEstado || usuarioEstado === 'ALL' || usuario.estado === usuarioEstado;
      
      return matchesSearch && matchesRol && matchesEstado;
    });
  }, [usuarios, usuarioSearch, usuarioRol, usuarioEstado]);

  if (loading) {
    return (
      <LoadingSpinner 
        variant="page" 
        size="xl" 
        text="Cargando dashboard..." 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Dashboard Administrativo
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gestión completa del sistema electoral
            </p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="stats" className="text-xs sm:text-sm py-2 sm:py-3">
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="text-xs sm:text-sm py-2 sm:py-3">
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="elecciones" className="text-xs sm:text-sm py-2 sm:py-3">
              Elecciones
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs sm:text-sm py-2 sm:py-3">
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4 sm:space-y-6">
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.usuarios.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.usuarios.activos} activos, {stats.usuarios.inactivos} inactivos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Elecciones</CardTitle>
                  <Vote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.elecciones.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.elecciones.activas} en curso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cargos</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.contenido.cargos}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de cargos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Candidatos</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.contenido.candidatos}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de candidatos
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

          <TabsContent value="usuarios" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={usuarioSearch}
                  onChange={(e) => setUsuarioSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Select value={usuarioRol} onValueChange={setUsuarioRol}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
                    <SelectItem value="OBSERVADOR">Observador</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={usuarioEstado} onValueChange={setUsuarioEstado}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    <SelectItem value="ACTIVO">Activo</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                    <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Usuarios del Sistema</CardTitle>
                <CardDescription className="text-sm">
                  Gestiona los usuarios y sus permisos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Usuario</TableHead>
                        <TableHead className="min-w-[150px]">Email</TableHead>
                        <TableHead className="min-w-[100px]">Rol</TableHead>
                        <TableHead className="min-w-[100px]">Estado</TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">Último Acceso</TableHead>
                        <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsuarios.map((usuario) => (
                        <TableRow key={usuario.id_usuario}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="font-semibold">{usuario.nombre} {usuario.apellido}</span>
                              <span className="text-xs text-muted-foreground sm:hidden">{usuario.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRolBadgeVariant(usuario.rol) as any} className="text-xs">
                              {usuario.rol}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEstadoBadgeVariant(usuario.estado) as any} className="text-xs">
                              {usuario.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">
                            {usuario.ultimo_acceso 
                              ? new Date(usuario.ultimo_acceso).toLocaleDateString()
                              : 'Nunca'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditUsuario(usuario)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteUsuario(usuario.id_usuario)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="elecciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Elecciones del Sistema</CardTitle>
              <CardDescription>
                Gestiona las elecciones y sus datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creador</TableHead>
                    <TableHead>Cargos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elecciones.map((eleccion) => (
                    <TableRow key={eleccion.id_eleccion}>
                      <TableCell className="font-medium">
                        {eleccion.nombre}
                      </TableCell>
                      <TableCell>
                        {new Date(eleccion.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {eleccion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {eleccion.usuario_creador 
                          ? `${eleccion.usuario_creador.nombre} ${eleccion.usuario_creador.apellido}`
                          : 'Sistema'
                        }
                      </TableCell>
                      <TableCell>{eleccion._count.cargos}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" aria-label={`Ver detalles de elección ${eleccion.nombre}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteEleccion(eleccion.id_eleccion)}
                            aria-label={`Eliminar elección ${eleccion.nombre}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Auditoría</CardTitle>
              <CardDescription>
                Registro de todas las acciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Tabla</TableHead>
                    <TableHead>ID Registro</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditoria.map((log) => (
                    <TableRow key={log.id_auditoria}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.usuario 
                          ? `${log.usuario.nombre} ${log.usuario.apellido}`
                          : 'Sistema'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.accion}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.tabla}</TableCell>
                      <TableCell>{log.id_registro}</TableCell>
                      <TableCell>{log.ip_address || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>

      {/* Modal de edición de usuario */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          {editingUsuario && (
            <EditUsuarioForm 
              usuario={editingUsuario}
              onSave={handleUpdateUsuario}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingUsuario(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
