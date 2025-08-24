import { useEffect, useRef } from "react";
import { initializeTabulator } from "@/lib/tabulator";

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'status' | 'date';
  width?: number;
}

interface DataTableProps {
  data: any[];
  columns?: Column[];
  height?: string;
  editable?: boolean;
}

export default function DataTable({ 
  data = [], 
  columns = [], 
  height = "400px",
  editable = false 
}: DataTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<any>(null);

  useEffect(() => {
    if (tableRef.current && data.length > 0) {
      // Auto-generate columns if not provided
      const autoColumns = columns.length > 0 ? columns : Object.keys(data[0] || {}).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: 'text' as const
      }));

      // Initialize Tabulator
      tabulatorRef.current = initializeTabulator(tableRef.current, {
        data,
        columns: autoColumns,
        height,
        editable
      });
    }

    // Cleanup
    return () => {
      if (tabulatorRef.current) {
        try {
          tabulatorRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying Tabulator:', error);
        }
      }
    };
  }, [data, columns, height, editable]);

  // Update data when it changes
  useEffect(() => {
    if (tabulatorRef.current && data.length > 0) {
      try {
        tabulatorRef.current.setData(data);
      } catch (error) {
        console.warn('Error updating Tabulator data:', error);
      }
    }
  }, [data]);

  return (
    <div className="w-full">
      <div 
        ref={tableRef} 
        className="tabulator-table"
        data-testid="data-table"
        style={{ minHeight: height }}
      />
      {data.length === 0 && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium">Veri bulunamadı</p>
            <p className="text-sm">Görüntülenecek kayıt bulunmamaktadır.</p>
          </div>
        </div>
      )}
    </div>
  );
}
