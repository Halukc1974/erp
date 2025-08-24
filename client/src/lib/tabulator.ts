interface TabulatorColumn {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'status' | 'date';
  width?: number;
}

interface TabulatorOptions {
  data: any[];
  columns: TabulatorColumn[];
  height?: string;
  editable?: boolean;
}

// Load Tabulator CSS and JS if not already loaded
let tabulatorLoaded = false;

export function loadTabulator(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (tabulatorLoaded && window.Tabulator) {
      resolve();
      return;
    }

    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator.min.js';
    script.onload = () => {
      tabulatorLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function initializeTabulator(element: HTMLElement, options: TabulatorOptions) {
  await loadTabulator();

  if (!window.Tabulator) {
    throw new Error('Tabulator failed to load');
  }

  const { data, columns, height = "400px", editable = false } = options;

  // Convert columns to Tabulator format
  const tabulatorColumns = columns.map(col => {
    const column: any = {
      title: col.label,
      field: col.key,
      width: col.width || undefined,
      resizable: true,
      headerSort: true,
    };

    // Add formatters based on column type
    switch (col.type) {
      case 'currency':
        column.formatter = function(cell: any) {
          const value = cell.getValue();
          if (value === null || value === undefined) return '';
          const color = value < 0 ? 'text-red-600' : 'text-green-600';
          const currency = '₺';
          return `<span class="font-mono ${color}">${currency}${Math.abs(value).toLocaleString('tr-TR')}</span>`;
        };
        column.sorter = "number";
        break;

      case 'status':
        column.formatter = function(cell: any) {
          const value = cell.getValue();
          if (!value) return '';
          
          const statusColors: { [key: string]: string } = {
            'Onaylandı': 'bg-green-100 text-green-800',
            'Ödendi': 'bg-blue-100 text-blue-800',
            'İşlemde': 'bg-yellow-100 text-yellow-800',
            'Bekliyor': 'bg-orange-100 text-orange-800',
            'Taslak': 'bg-gray-100 text-gray-800',
            'Kaydedildi': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'active': 'bg-green-100 text-green-800',
            'true': 'bg-green-100 text-green-800',
            'false': 'bg-red-100 text-red-800',
            'low': 'bg-green-100 text-green-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-red-100 text-red-800',
          };

          const colorClass = statusColors[value] || 'bg-gray-100 text-gray-800';
          const displayValue = typeof value === 'boolean' ? (value ? 'Aktif' : 'Pasif') : value;
          
          return `<span class="px-2 py-1 rounded-full text-xs ${colorClass}">${displayValue}</span>`;
        };
        break;

      case 'date':
        column.formatter = function(cell: any) {
          const value = cell.getValue();
          if (!value) return '';
          try {
            return new Date(value).toLocaleDateString('tr-TR');
          } catch {
            return value;
          }
        };
        column.sorter = "date";
        break;

      default:
        column.formatter = function(cell: any) {
          const value = cell.getValue();
          return value || '';
        };
    }

    if (editable) {
      column.editor = col.type === 'currency' ? "number" : "input";
    }

    return column;
  });

  // Create Tabulator instance
  const table = new window.Tabulator(element, {
    data: data,
    columns: tabulatorColumns,
    layout: "fitColumns",
    height: height,
    placeholder: "Veri bulunamadı",
    tooltips: true,
    movableColumns: true,
    resizableRows: true,
    pagination: "local",
    paginationSize: 25,
    paginationSizeSelector: [10, 25, 50, 100],
    paginationCounter: "rows",
    langs: {
      "tr": {
        "pagination": {
          "page_size": "Sayfa başına",
          "first": "İlk",
          "first_title": "İlk Sayfa",
          "last": "Son",
          "last_title": "Son Sayfa", 
          "prev": "Önceki",
          "prev_title": "Önceki Sayfa",
          "next": "Sonraki",
          "next_title": "Sonraki Sayfa"
        }
      }
    },
    locale: "tr",
    headerFilterPlaceholder: "Filtrele...",
    selectable: true,
    responsiveLayout: "hide",
    rowClick: function(e: any, row: any) {
      // Handle row click if needed
    }
  });

  return table;
}

// Type definitions for window.Tabulator
declare global {
  interface Window {
    Tabulator: any;
  }
}
