# 📊 ANÁLISIS DE PANTALLAS Y ROLES

## 🎯 NUEVO SISTEMA DE ROLES

### Roles Definidos:
1. **ADMIN** (Administrador)
2. **USUARIO** (Usuario estándar)

---

## 📋 ANÁLISIS DE PANTALLAS ACTUALES

### ✅ Pantallas Existentes y su Compatibilidad

| Pantalla | Archivo | Admin | Usuario | Estado | Notas |
|----------|---------|-------|---------|---------|-------|
| **Login** | `LoginForm.tsx` | ✅ | ✅ | ✅ OK | Público - Ambos roles |
| **Home/Inicio** | `PantallaInicioElecciones.tsx` | ✅ | ✅ | ✅ OK | Crear elecciones - Ambos roles |
| **Historial** | `PantallaHistorialElecciones.tsx` | ✅ | ✅ | ⚠️ MODIFICAR | Debe filtrar por usuario |
| **Gestión Cargos** | `PantallaGestionCargos.tsx` | ✅ | ✅ | ✅ OK | Ambos pueden crear/editar cargos |
| **Registro Candidatos** | `PantallaRegistroCandidatos.tsx` | ✅ | ✅ | ✅ OK | Ambos pueden registrar candidatos |
| **Ingreso Resultados** | `PantallaIngresoResultados.tsx` | ✅ | ✅ | ✅ OK | Ambos pueden ingresar resultados |
| **Visualización Resultados** | `PantallaVisualizacionResultados.tsx` | ✅ | ✅ | ✅ OK | Ambos pueden ver resultados |
| **Resumen Final** | `PantallaResumenFinal.tsx` | ✅ | ✅ | ✅ OK | Ambos pueden ver resumen |
| **Resultados Públicos** | `PantallaPublicaResultados.tsx` | ✅ | ✅ | ✅ OK | Público - Proyector |
| **Dashboard Admin** | `Dashboard.tsx` | ✅ | ❌ | ✅ OK | Solo ADMIN - Gestión usuarios |
| **Búsqueda Global** | `GlobalSearch.tsx` | ✅ | ✅ | ⚠️ MODIFICAR | Filtrar por permisos |
| **Unauthorized** | `UnauthorizedPage.tsx` | ✅ | ✅ | ✅ OK | Error de permisos |

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **PantallaHistorialElecciones.tsx**
- **Problema**: Actualmente muestra TODAS las elecciones
- **Solución**: Debe filtrar por `created_by` para usuarios normales
- **Admin**: Ve todas las elecciones
- **Usuario**: Solo ve sus propias elecciones

### 2. **GlobalSearch.tsx**
- **Problema**: Busca en todas las elecciones y datos
- **Solución**: Filtrar resultados según permisos del usuario
- **Admin**: Busca en todo
- **Usuario**: Solo en sus elecciones

### 3. **Navigation.tsx**
- **Problema**: Navegación no diferencia claramente entre roles
- **Solución**: Mostrar opciones según rol
- **Admin**: Dashboard + Todas las opciones
- **Usuario**: Sin Dashboard + Opciones limitadas

### 4. **ProtectedRoute.tsx**
- **Problema**: Verifica `organizadorOnly` pero no hay rol USUARIO
- **Solución**: Actualizar lógica para ADMIN vs USUARIO

---

## ✨ PANTALLAS QUE FUNCIONAN SIN CAMBIOS

1. ✅ **PantallaInicioElecciones.tsx** - Crear elecciones (ambos roles)
2. ✅ **PantallaGestionCargos.tsx** - Gestionar cargos (ambos roles)
3. ✅ **PantallaRegistroCandidatos.tsx** - Registrar candidatos (ambos roles)
4. ✅ **PantallaIngresoResultados.tsx** - Ingresar resultados (ambos roles)
5. ✅ **PantallaVisualizacionResultados.tsx** - Ver resultados (ambos roles)
6. ✅ **PantallaResumenFinal.tsx** - Ver resumen (ambos roles)
7. ✅ **PantallaPublicaResultados.tsx** - Proyector público (todos)
8. ✅ **Dashboard.tsx** - Solo ADMIN (ya funciona así)

---

## 🔧 MODIFICACIONES NECESARIAS

### 📝 CAMBIOS CRÍTICOS (Obligatorios)

#### 1. **AuthContext.tsx**
```typescript
// Actualizar roles
const isAdmin = usuario?.rol === 'ADMIN';
const isUsuario = usuario?.rol === 'USUARIO'; // Nuevo
const isOrganizador = isAdmin; // Deprecated, mantener compatibilidad
```

#### 2. **PantallaHistorialElecciones.tsx**
```typescript
// Agregar filtro por usuario
const filteredElections = useMemo(() => {
  if (isAdmin) {
    return elections; // Admin ve todo
  } else {
    return elections.filter(e => e.created_by === usuario?.id_usuario);
  }
}, [elections, isAdmin, usuario]);
```

#### 3. **GlobalSearch.tsx**
```typescript
// Filtrar resultados según rol
const performSearch = async (searchQuery: string) => {
  // ... código existente
  
  if (!isAdmin) {
    // Filtrar solo elecciones del usuario
    eleccionesFiltradas = eleccionesFiltradas.filter(
      e => e.created_by === usuario?.id_usuario
    );
  }
};
```

#### 4. **ProtectedRoute.tsx**
```typescript
// Actualizar validación de roles
if (adminOnly && usuario?.rol !== 'ADMIN') {
  return <Navigate to="/unauthorized" replace />;
}
```

#### 5. **Navigation.tsx**
```typescript
// Simplificar navegación
{isAdmin && (
  <Button onClick={() => navigate('/dashboard')}>
    Dashboard
  </Button>
)}
```

---

## 📱 PANTALLAS FALTANTES

### ❌ NO SE NECESITAN PANTALLAS ADICIONALES

Todas las funcionalidades requeridas ya están implementadas:

- ✅ Crear elecciones (Home)
- ✅ Ver historial de elecciones (History)
- ✅ Gestionar cargos (Positions)
- ✅ Registrar candidatos (Candidates)
- ✅ Ingresar resultados (Results)
- ✅ Ver resumen (Summary)
- ✅ Dashboard admin (Dashboard)

---

## 🎯 COMPARACIÓN: ADMIN VS USUARIO

| Funcionalidad | Admin | Usuario |
|---------------|-------|---------|
| **Crear Elecciones** | ✅ | ✅ |
| **Ver TODAS las Elecciones** | ✅ | ❌ |
| **Ver MIS Elecciones** | ✅ | ✅ |
| **Eliminar Elecciones** | ✅ Todas | ✅ Solo suyas |
| **Crear/Editar Cargos** | ✅ | ✅ |
| **Eliminar Cargos** | ✅ Todos | ✅ Solo suyos |
| **Registrar Candidatos** | ✅ | ✅ |
| **Ingresar Resultados** | ✅ | ✅ |
| **Ver Resultados** | ✅ | ✅ |
| **Dashboard Usuarios** | ✅ | ❌ |
| **Gestionar Usuarios** | ✅ | ❌ |
| **Búsqueda Global** | ✅ Todo | ✅ Solo suyo |

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Actualizar Sistema de Roles (1 hora)
1. ✅ Actualizar `AuthContext.tsx`
2. ✅ Actualizar `ProtectedRoute.tsx`
3. ✅ Actualizar `Navigation.tsx`

### Fase 2: Filtrar Datos por Usuario (2 horas)
1. ⚠️ Modificar `PantallaHistorialElecciones.tsx`
2. ⚠️ Modificar `GlobalSearch.tsx`
3. ⚠️ Actualizar servicios para incluir filtros

### Fase 3: Validación Backend (1 hora)
1. ⚠️ Verificar que backend filtre por `created_by`
2. ⚠️ Agregar validación de permisos en endpoints
3. ⚠️ Actualizar middleware de autorización

### Fase 4: Testing (1 hora)
1. ⚠️ Probar flujo completo como ADMIN
2. ⚠️ Probar flujo completo como USUARIO
3. ⚠️ Verificar filtros y permisos

---

## ✅ CONCLUSIÓN

### TODAS LAS PANTALLAS NECESARIAS YA EXISTEN ✨

El sistema actual tiene **todas las pantallas requeridas**. Solo se necesitan **4 modificaciones**:

1. **AuthContext**: Agregar rol USUARIO
2. **PantallaHistorialElecciones**: Filtrar por usuario
3. **GlobalSearch**: Filtrar resultados
4. **ProtectedRoute**: Validación de roles

**NO se requieren pantallas nuevas** porque:
- ✅ Ya hay pantalla de creación de elecciones
- ✅ Ya hay pantalla de historial (solo falta filtrar)
- ✅ Ya hay pantallas de gestión de cargos
- ✅ Ya hay pantalla de candidatos
- ✅ Ya hay pantallas de resultados
- ✅ Ya hay dashboard admin

**Tiempo estimado de implementación**: 4-5 horas

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend (Verificar)
- [ ] Endpoint `/elecciones` filtra por `created_by` si no es admin
- [ ] Endpoint `/cargos` filtra por `created_by` de la elección
- [ ] Endpoint `/candidatos` filtra por `created_by` de la elección
- [ ] Middleware verifica rol ADMIN vs USUARIO
- [ ] Base de datos tiene campo `created_by` en elecciones

### Frontend (Implementar)
- [ ] `AuthContext.tsx` - Agregar `isUsuario`
- [ ] `ProtectedRoute.tsx` - Validar ADMIN/USUARIO
- [ ] `Navigation.tsx` - Mostrar opciones según rol
- [ ] `PantallaHistorialElecciones.tsx` - Filtrar elecciones
- [ ] `GlobalSearch.tsx` - Filtrar búsquedas
- [ ] Actualizar tipos en `api/types.ts` si es necesario

---

## 🎨 INTERFAZ SEGÚN ROL

### Vista ADMIN
```
┌─────────────────────────────────────┐
│ [Logo] Sistema Electoral            │
│ [Buscar] [Home] [History]           │
│ [Dashboard] [@Admin] [Logout]       │
└─────────────────────────────────────┘

Dashboard Admin:
- Gestión de Usuarios ✅
- Ver todas las Elecciones ✅
- Auditoría del Sistema ✅
```

### Vista USUARIO
```
┌─────────────────────────────────────┐
│ [Logo] Sistema Electoral            │
│ [Buscar] [Home] [History]           │
│ [@Usuario] [Logout]                 │
└─────────────────────────────────────┘

Sin Dashboard:
- Crear Elecciones ✅
- Ver MIS Elecciones ✅
- Gestionar MIS Cargos ✅
```

---

## 💡 RECOMENDACIONES

1. **Simplicidad**: La estructura actual es perfecta, solo necesita ajustes de filtrado
2. **Seguridad**: Implementar validación en backend también
3. **UX**: Agregar indicador visual del rol actual en Navigation
4. **Performance**: Los filtros por usuario mejorarán el rendimiento
5. **Escalabilidad**: El sistema está preparado para más roles si se necesitan

---

**Conclusión Final**: ✅ **NO FALTAN PANTALLAS** - Solo se requieren ajustes de permisos y filtros
