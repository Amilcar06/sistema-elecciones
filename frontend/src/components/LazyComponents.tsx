import { lazy } from 'react';

// Lazy loading de componentes UI que pueden ser pesados
export const LazyChart = lazy(() => 
  import('./ui/chart').then(module => ({
    default: module.Chart
  }))
);

export const LazyCalendar = lazy(() => 
  import('./ui/calendar').then(module => ({
    default: module.Calendar
  }))
);

export const LazyCarousel = lazy(() => 
  import('./ui/carousel').then(module => ({
    default: module.Carousel
  }))
);

export const LazyDataTable = lazy(() => 
  import('./ui/table').then(module => ({
    default: module.Table
  }))
);

// Lazy loading de servicios que pueden ser pesados
export const LazyRecharts = lazy(() => 
  import('recharts').then(module => ({
    default: module
  }))
);
