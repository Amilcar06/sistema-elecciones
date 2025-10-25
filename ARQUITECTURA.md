# Plan de Migración: Node.js/React → Laravel/Livewire

## 📊 ANÁLISIS DE LA ARQUITECTURA ACTUAL

### Backend Actual (Node.js + Express + Prisma)
- **Framework**: Express.js con TypeScript
- **ORM**: Prisma con PostgreSQL
- **Autenticación**: JWT con refresh tokens
- **Seguridad**: Helmet, CORS, Rate limiting
- **Base de datos**: PostgreSQL

### Frontend Actual (React + Vite)
- **Framework**: React 18 con TypeScript
- **Routing**: React Router v6
- **UI**: Tailwind CSS + Radix UI
- **Estado**: Context API + Custom hooks
- **Autenticación**: JWT tokens

---

## 🎯 OBJETIVOS DE LA MIGRACIÓN

### Ventajas de Laravel + Livewire:
1. **Un solo lenguaje**: PHP para backend y frontend
2. **Menos complejidad**: No necesitas API REST
3. **Mejor SEO**: Server-side rendering
4. **Desarrollo más rápido**: Livewire maneja el estado automáticamente
5. **Ecosistema maduro**: Laravel tiene excelente documentación
6. **Seguridad integrada**: CSRF, validación, autenticación built-in

---

## 📋 PLAN DE MIGRACIÓN

### FASE 1: BACKEND MIGRATION (Laravel)

#### 1.1 Configuración Inicial
```bash
# Crear nuevo proyecto Laravel
composer create-project laravel/laravel sistema-elecciones-laravel
cd sistema-elecciones-laravel

# Instalar dependencias adicionales
composer require livewire/livewire
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require barryvdh/laravel-dompdf
```

#### 1.2 Migración de Base de Datos
- **De Prisma a Laravel Migrations**
- **Modelos Eloquent** (reemplazar Prisma Client)
- **Seeders** para datos iniciales

#### 1.3 Autenticación
- **Laravel Sanctum** (reemplazar JWT manual)
- **Sessions** para Livewire
- **Middleware de autenticación**

#### 1.4 API Endpoints
- **Convertir rutas Express a Laravel Routes**
- **Controllers** para lógica de negocio
- **Form Requests** para validación

### FASE 2: FRONTEND MIGRATION (Livewire)

#### 2.1 Componentes Livewire
- **Dashboard** → `DashboardComponent`
- **Gestión de Candidatos** → `CandidatesComponent`
- **Resultados** → `ResultsComponent`
- **Autenticación** → `LoginComponent`

#### 2.2 Layouts y Vistas
- **Blade templates** (reemplazar JSX)
- **Tailwind CSS** (mantener)
- **Alpine.js** para interactividad

#### 2.3 Estado y Datos
- **Livewire Properties** (reemplazar useState)
- **Livewire Methods** (reemplazar funciones)
- **Real-time updates** con Livewire

---

## 🛠️ IMPLEMENTACIÓN DETALLADA

### 1. ESTRUCTURA DE ARCHIVOS LARAVEL

```
sistema-elecciones-laravel/
├── app/
│   ├── Http/Controllers/
│   │   ├── AuthController.php
│   │   ├── DashboardController.php
│   │   ├── ElectionController.php
│   │   └── ResultsController.php
│   ├── Livewire/
│   │   ├── Dashboard.php
│   │   ├── Candidates.php
│   │   ├── Results.php
│   │   └── Login.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Election.php
│   │   ├── Position.php
│   │   ├── Candidate.php
│   │   └── Vote.php
│   └── Services/
│       ├── ElectionService.php
│       └── ResultsService.php
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   └── livewire/
│   └── css/
└── routes/
    ├── web.php
    └── api.php
```

### 2. MIGRACIÓN DE MODELOS

#### De Prisma Schema a Laravel Models:

**Usuario (Prisma) → User (Laravel)**
```php
// app/Models/User.php
class User extends Authenticatable
{
    protected $fillable = [
        'email', 'nombre', 'apellido', 'password', 'rol', 'estado'
    ];
    
    protected $hidden = ['password', 'remember_token'];
    
    public function elecciones()
    {
        return $this->hasMany(Election::class, 'id_usuario_creador');
    }
}
```

**Eleccion (Prisma) → Election (Laravel)**
```php
// app/Models/Election.php
class Election extends Model
{
    protected $fillable = [
        'nombre', 'descripcion', 'fecha', 'estado', 'id_usuario_creador'
    ];
    
    public function posiciones()
    {
        return $this->hasMany(Position::class, 'id_eleccion');
    }
    
    public function creador()
    {
        return $this->belongsTo(User::class, 'id_usuario_creador');
    }
}
```

### 3. COMPONENTES LIVEWIRE

#### Dashboard Component:
```php
// app/Livewire/Dashboard.php
class Dashboard extends Component
{
    public $stats;
    public $usuarios;
    public $elecciones;
    
    public function mount()
    {
        $this->loadDashboardData();
    }
    
    public function loadDashboardData()
    {
        $this->stats = [
            'total_usuarios' => User::count(),
            'total_elecciones' => Election::count(),
            'elecciones_activas' => Election::where('estado', 'activa')->count(),
        ];
        
        $this->usuarios = User::latest()->take(10)->get();
        $this->elecciones = Election::with('creador')->latest()->take(5)->get();
    }
    
    public function render()
    {
        return view('livewire.dashboard');
    }
}
```

#### Results Component:
```php
// app/Livewire/Results.php
class Results extends Component
{
    public $election;
    public $positions;
    public $results;
    public $autoRefresh = false;
    
    public function mount($electionId)
    {
        $this->election = Election::findOrFail($electionId);
        $this->loadResults();
    }
    
    public function loadResults()
    {
        $this->positions = $this->election->posiciones()
            ->with(['candidatos.votos'])
            ->get();
            
        $this->results = $this->calculateResults();
    }
    
    public function toggleAutoRefresh()
    {
        $this->autoRefresh = !$this->autoRefresh;
    }
    
    public function render()
    {
        return view('livewire.results');
    }
}
```

### 4. VISTAS BLADE

#### Layout Principal:
```blade
{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Sistema de Elecciones')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        @include('layouts.navigation')
        
        <main class="container mx-auto px-4 py-8">
            @yield('content')
        </main>
    </div>
    
    @livewireScripts
</body>
</html>
```

#### Dashboard View:
```blade
{{-- resources/views/livewire/dashboard.blade.php --}}
<div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-700">Total Usuarios</h3>
            <p class="text-3xl font-bold text-blue-600">{{ $stats['total_usuarios'] }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-700">Elecciones</h3>
            <p class="text-3xl font-bold text-green-600">{{ $stats['total_elecciones'] }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-700">Activas</h3>
            <p class="text-3xl font-bold text-yellow-600">{{ $stats['elecciones_activas'] }}</p>
        </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow">
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Usuarios Recientes</h3>
                <div class="space-y-3">
                    @foreach($usuarios as $usuario)
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            {{ substr($usuario->nombre, 0, 1) }}
                        </div>
                        <div>
                            <p class="font-medium">{{ $usuario->nombre }} {{ $usuario->apellido }}</p>
                            <p class="text-sm text-gray-500">{{ $usuario->email }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow">
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Elecciones Recientes</h3>
                <div class="space-y-3">
                    @foreach($elecciones as $eleccion)
                    <div class="border-l-4 border-blue-500 pl-4">
                        <h4 class="font-medium">{{ $eleccion->nombre }}</h4>
                        <p class="text-sm text-gray-500">{{ $eleccion->creador->nombre }}</p>
                        <p class="text-xs text-gray-400">{{ $eleccion->created_at->format('d/m/Y') }}</p>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## ⚡ VENTAJAS DE LA MIGRACIÓN

### 1. **Desarrollo más rápido**
- No necesitas API REST
- Livewire maneja el estado automáticamente
- Menos código JavaScript

### 2. **Mejor rendimiento**
- Server-side rendering
- Menos requests HTTP
- Caché automático de Laravel

### 3. **Mantenimiento simplificado**
- Un solo lenguaje (PHP)
- Estructura más organizada
- Testing integrado

### 4. **Seguridad mejorada**
- CSRF protection automático
- Validación integrada
- Autenticación robusta

---

## 🚀 PRÓXIMOS PASOS

1. **Crear proyecto Laravel base**
2. **Migrar base de datos**
3. **Implementar autenticación**
4. **Crear componentes Livewire principales**
5. **Migrar vistas y estilos**
6. **Testing y optimización**

¿Te gustaría que empecemos con algún paso específico?
