import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings, X, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadTabulator } from "@/lib/tabulator";
import { apiRequest } from "@/lib/queryClient";
import CellLinkModal from "@/components/ui/cell-link-modal";
import { HyperFormula } from "hyperformula";

interface DynamicColumn {
  id: string;
  name: string;
  displayName: string;
  dataType: string;
  isRequired: boolean;
  isEditable: boolean;
  defaultValue?: string;
  options?: any;
  width?: number;
  sortOrder: number;
}

interface DynamicTable {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

interface DynamicTabulatorProps {
  tableId: string;
  onCellEdit?: (id: string, field: string, value: any) => void;
}

const DATA_TYPES = [
  { value: "text", label: "Metin" },
  { value: "number", label: "Sayı" },
  { value: "decimal", label: "Ondalık Sayı" },
  { value: "currency", label: "Para Birimi" },
  { value: "date", label: "Tarih" },
  { value: "boolean", label: "Evet/Hayır" },
  { value: "checkbox", label: "Onay Kutusu" },
  { value: "select", label: "Seçim Listesi" },
];

const CURRENCIES = [
  { code: "TRY", symbol: "₺", name: "Türk Lirası" },
  { code: "USD", symbol: "$", name: "Amerikan Doları" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "İngiliz Sterlini" },
  { code: "IQD", symbol: "ع.د", name: "Irak Dinarı" },
  { code: "LYD", symbol: "ل.د", name: "Libya Dinarı" }
];

export default function DynamicTabulator({ tableId, onCellEdit }: DynamicTabulatorProps) {
  const tabulatorRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // HyperFormula ile tablo içinde formül hesaplama - columns parametresi ile
  const calculateFormulaInTable = (formula: string, data: any[], columnsData?: DynamicColumn[]): string | null => {
    if (!formula.startsWith('=')) return null;
    
    // Boş formül kontrolü
    if (formula.trim() === '=') return '0';
    
    try {
      console.log('📊 Dynamic Tabulator - Formül hesaplanıyor:', formula);
      
      // Önce basit matematik formüllerini kontrol et (örn: =3*5, =7+8)
      const cleanFormula = formula.slice(1); // = işaretini çıkar
      
      // Sadece sayı ve matematik operatörleri varsa (hücre referansı YOK)
      if (/^[\d+\-*/().\s]+$/.test(cleanFormula)) {
        try {
          console.log('🔢 Basit matematik formülü tespit edildi:', cleanFormula);
          // Güvenlik için eval yerine Function constructor kullan
          const result = new Function('return ' + cleanFormula)();
          console.log('✅ Basit hesaplama sonucu:', result);
          return String(result);
        } catch (e) {
          console.error('❌ Basit formül hesaplama hatası:', e);
          return '#ERROR';
        }
      }
      
      // Hücre referanslı formüller için HyperFormula kullan
      console.log('📋 Hücre referanslı formül, HyperFormula kullanılıyor...');
      
      const hfOptions = {
        licenseKey: 'gpl-v3',
        useColumnIndex: false,
      };
      
      const hf = HyperFormula.buildEmpty(hfOptions);
      const sheetId = hf.addSheet('Sheet1');
      
      // SheetId'yi sayıya çevir
      const numericSheetId = typeof sheetId === 'number' ? sheetId : 0;
      
      // Columns parametresini kullan
      const activeColumns = columnsData || columns || [];
      
      // Veri kontrolü - columns yoksa basit hesaplama yap
      if (!data.length || !activeColumns.length) {
        console.log('⚠️ Veri veya sütun yok, HyperFormula ile hesaplanmıyor');
        hf.destroy();
        return '0';
      }
      
      // Tablo verilerini HyperFormula formatına çevir - sadece gerçek veri
      const dataMatrix: (string | number | null)[][] = [];
      
      // Sadece mevcut satırları işle
      for (let row = 0; row < data.length; row++) {
        const rowData: (string | number | null)[] = [];
        const tableRow = data[row];
        
        for (let col = 0; col < activeColumns.length; col++) {
          const column = activeColumns[col];
          
          // TABULATOR FRESH DATA formatını destekle
          // Normal data: tableRow.rowData?.[column.name] 
          // Fresh data: tableRow[column.name]
          let value = tableRow.rowData?.[column?.name || ''];
          if (value === undefined && tableRow[column?.name || '']) {
            value = tableRow[column?.name || ''];
            console.log(`🔧 Fresh data'dan alındı: ${column?.name} = ${value}`);
          }
          
          // ÖNEMLİ: Eğer bu hücrede bir formül varsa, calculated değerini kullan
          const currentRowId = tableRow.id;
          const currentColumnName = column?.name || '';
          const formulaInThisCell = (cellFormulas || []).find((f: any) => 
            f.rowId === currentRowId && f.columnName === currentColumnName
          );
          
          if (formulaInThisCell && formulaInThisCell.calculatedValue !== null && formulaInThisCell.calculatedValue !== undefined) {
            value = formulaInThisCell.calculatedValue;
            console.log(`🧮 Formül hücresi için calculated değer kullanıldı: ${currentColumnName}[${currentRowId}] = ${value} (formül: ${formulaInThisCell.formula})`);
          }
          
          let finalValue: string | number | null = null;
          
          if (value === null || value === undefined || value === '') {
            finalValue = null;
          } else if (typeof value === 'string') {
            // Para birimi formatı kontrolü (örn: "100|USD")
            if (value.includes('|')) {
              const [amount] = value.split('|');
              const numAmount = parseFloat(amount);
              finalValue = isNaN(numAmount) ? 0 : numAmount;
            } else {
              const numValue = parseFloat(value);
              finalValue = isNaN(numValue) ? value : numValue;
            }
          } else if (typeof value === 'number') {
            finalValue = value;
          } else {
            finalValue = String(value);
          }
          
          rowData.push(finalValue);
          
          // Debug log - sütun mapping
          const cellRef = String.fromCharCode(65 + col) + (row + 1);
          console.log(`🔍 ${cellRef} = ${finalValue} [${column?.name}]`);
        }
        dataMatrix.push(rowData);
      }
      
      // En az 10x10 matrix için boş satır/sütun ekle
      while (dataMatrix.length < 10) {
        const emptyRow = new Array(Math.max(activeColumns.length, 10)).fill(null);
        dataMatrix.push(emptyRow);
      }
      
      dataMatrix.forEach(row => {
        while (row.length < 10) {
          row.push(null);
        }
      });
      
      // SheetId numerik olarak kullan
      hf.setSheetContent(numericSheetId, dataMatrix);
      
      // Formülü hesapla - boş alanda
      const tempRow = Math.max(data.length + 2, 10);
      const tempCol = Math.max(activeColumns.length + 2, 10);
      hf.setCellContents({ sheet: numericSheetId, row: tempRow, col: tempCol }, [[formula]]);
      
      const result = hf.getCellValue({ sheet: numericSheetId, row: tempRow, col: tempCol });
      hf.destroy();
      
      console.log('📊 Dynamic Tabulator - Sonuç:', result);
      
      // Sonuç kontrolü
      if (result === null || result === undefined) {
        return '0';
      }
      
      // HyperFormula error kontrolü
      if (typeof result === 'object' && ((result as any).error || (result as any).message)) {
        console.error('HyperFormula error:', result);
        return '#ERROR';
      }
      
      // Sayı formatlaması
      if (typeof result === 'number') {
        if (Math.abs(result) > 1e15) {
          return result.toExponential(2);
        }
        if (result % 1 !== 0) {
          return parseFloat(result.toFixed(6)).toString();
        }
        return result.toString();
      }
      
      return String(result);
      
    } catch (error) {
      console.error('Formül hesaplama hatası:', error);
      return '#ERROR';
    }
  };
  
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [showCellLinkModal, setShowCellLinkModal] = useState(false);
  const [cellLinkData, setCellLinkData] = useState<{
    sourceRowId: string;
    sourceColumnName: string;
  } | null>(null);
  const [editingColumn, setEditingColumn] = useState<DynamicColumn | null>(null);
  const [columnForm, setColumnForm] = useState({
    name: "",
    displayName: "",
    dataType: "text",
    isRequired: false,
    isEditable: true,
    defaultValue: "",
    width: 150,
    currency: "TRY", // Default para birimi
  });

  // Fetch table columns
  const { data: columns = [], isLoading: columnsLoading } = useQuery<DynamicColumn[]>({
    queryKey: [`/api/dynamic-tables/${tableId}/columns`],
    enabled: !!tableId,
  });

  // Fetch table data
  const { data: tableData = [], isLoading: dataLoading } = useQuery<any[]>({
    queryKey: [`/api/dynamic-tables/${tableId}/data`],
    enabled: !!tableId,
  });

  // Fetch cell links for this table
  const { data: cellLinks = [] } = useQuery<any[]>({
    queryKey: [`/api/cell-links/${tableId}`],
    enabled: !!tableId,
  });

  // Fetch linked values for all cell links
  const { data: linkedValues = {} } = useQuery({
    queryKey: [`/api/cell-links/${tableId}/values`],
    queryFn: async () => {
      if (cellLinks.length === 0) return {};
      
      const values: { [key: string]: any } = {};
      
      for (const link of cellLinks) {
        try {
          const response = await fetch(`/api/table-data/${link.targetTableName}`);
          const tableData = await response.json();
          const targetRow = tableData.find((row: any) => row.id === link.targetRowId);
          
          if (targetRow && targetRow[link.targetFieldName]) {
            const linkKey = `${link.sourceRowId}_${link.sourceColumnName}`;
            values[linkKey] = targetRow[link.targetFieldName];
          }
        } catch (error) {
          console.error('Error fetching linked value:', error);
        }
      }
      
      return values;
    },
    enabled: cellLinks.length > 0,
  });

  // Fetch cell formulas for this table
  const { data: cellFormulas = [] } = useQuery<any[]>({
    queryKey: [`/api/cell-formulas/${tableId}`],
    enabled: !!tableId,
  });

  // 🧮 AUTO-RECALCULATION: Tüm formülleri yeniden hesaplama fonksiyonu
  const recalculateAllFormulas = async () => {
    if (!cellFormulas || cellFormulas.length === 0) {
      console.log('📋 Hesaplanacak formül yok');
      return;
    }

    console.log(`🔄 ${cellFormulas.length} formül yeniden hesaplanıyor...`);

    for (const formula of cellFormulas) {
      try {
        console.log(`🧪 İşlenen formül:`, formula);
        
        // calculateFormulaInTable fonksiyonunu kullan (local)
        const newValue = calculateFormulaInTable(
          formula.formula,
          tableData || [],
          columns
        );
        
        console.log(`🧮 Formül sonucu: "${formula.formula}" = ${newValue} (eski: ${formula.calculatedValue})`);
        
        if (newValue !== null && String(newValue) !== String(formula.calculatedValue)) {
          console.log(`📊 Formül güncellendi: ${formula.rowId}-${formula.columnName} = ${newValue}`);
          
          // Database'deki formül değerini güncelle
          await apiRequest(`/api/cell-formulas/${formula.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              calculatedValue: String(newValue)
            })
          });

          // Global updateCellAfterFormula fonksiyonunu kullan
          if (typeof (window as any).updateCellAfterFormula === 'function') {
            (window as any).updateCellAfterFormula(formula.rowId, formula.columnName, String(newValue));
          }
        } else {
          console.log(`⚪ Formül değişmedi: ${formula.rowId}-${formula.columnName} = ${newValue}`);
        }
      } catch (error) {
        console.error(`❌ Formül hesaplama hatası:`, formula, error);
      }
    }

    // Query'leri invalidate et
    queryClient.invalidateQueries({ queryKey: [`/api/cell-formulas/${tableId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
    
    console.log('✅ Tüm formüller yeniden hesaplandı');
  };

  // 🎯 SMART RECALCULATION: Sadece bağımlı formülleri hesapla
  const recalculateDependentFormulas = async (changedField: string, newValue: any) => {
    if (!cellFormulas || cellFormulas.length === 0) {
      console.log('📋 Hesaplanacak formül yok');
      return;
    }

    // Mevcut tablodaki satır ID'lerini al
    const currentRowIds = (tableData || []).map((row: any) => row.id);
    console.log(`🔍 Mevcut tablo satır ID'leri:`, currentRowIds);

    // ✨ DÜZELTME: changedField'ı Excel tarzı hücre referansına çevir
    const columnIndex = columns.findIndex((col: any) => col.name === changedField);
    const columnLetter = columnIndex >= 0 ? String.fromCharCode(65 + columnIndex) : changedField; // A, B, C...
    console.log(`🔄 Sütun mapping: "${changedField}" -> "${columnLetter}" (index: ${columnIndex})`);

    // Değişen field için tüm olası hücre referansları oluştur (A1, A2, A3... vs B1, B2, B3...)
    const possibleCellRefs = [];
    for (let row = 1; row <= Math.max(currentRowIds.length, 10); row++) {
      possibleCellRefs.push(`${columnLetter}${row}`.toLowerCase());
    }
    console.log(`📋 Olası hücre referansları: ${possibleCellRefs.join(', ')}`);

    // Değişen field bağımlılığında olan formülleri filtrele
    const dependentFormulas = cellFormulas.filter((formula: any) => {
      const formulaText = formula.formula.toLowerCase();
      
      // 1. Önce formül bu tablodaki satırlardan biri mi kontrol et
      const isInCurrentTable = currentRowIds.includes(formula.rowId);
      
      // 2. Formülde bu sütunun herhangi bir hücre referansı var mı kontrol et
      const hasDependency = possibleCellRefs.some(cellRef => formulaText.includes(cellRef)) || 
                           formulaText.includes(changedField.toLowerCase()) ||
                           formulaText.includes(columnLetter.toLowerCase());
      
      const shouldInclude = isInCurrentTable && hasDependency;
      
      console.log(`🔍 Formül "${formula.formula}" (rowId: ${formula.rowId}) -> ${columnLetter} bağımlı: ${hasDependency}, mevcut tabloda: ${isInCurrentTable}, dahil: ${shouldInclude}`);
      return shouldInclude;
    });

    if (dependentFormulas.length === 0) {
      console.log(`📋 ${changedField} değişikliği için bağımlı formül yok`);
      return;
    }

    console.log(`🎯 ${changedField} için ${dependentFormulas.length} bağımlı formül yeniden hesaplanıyor...`);

    for (const formula of dependentFormulas) {
      try {
        console.log(`🧪 Bağımlı formül:`, {
          formula: formula.formula,
          rowId: formula.rowId,
          columnName: formula.columnName,
          oldValue: formula.calculatedValue
        });
        
        // GÜNCEL VERİ ÇEK: Tabulator'dan fresh data al (state değil!)
        const freshTableData = tabulatorInstance.current ? tabulatorInstance.current.getData() : (tableData || []);
        console.log('🔍 Fresh table data alındı:', freshTableData.length, 'satır');
        
        // calculateFormulaInTable fonksiyonunu kullan (fresh data ile)
        const newCalculatedValue = calculateFormulaInTable(
          formula.formula,
          freshTableData,
          columns
        );
        
        console.log(`🧮 Yeniden hesaplanan değer: "${formula.formula}" = ${newCalculatedValue} (eski: ${formula.calculatedValue})`);
        
        if (newCalculatedValue !== null && String(newCalculatedValue) !== String(formula.calculatedValue)) {
          console.log(`📊 Bağımlı formül güncellendi: ${formula.rowId}-${formula.columnName} = ${newCalculatedValue}`);
          
          // Database'deki formül değerini güncelle
          await apiRequest(`/api/cell-formulas/${formula.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              calculatedValue: String(newCalculatedValue)
            })
          });

          // Tabulator'daki hücreyi güncelle
          if (typeof (window as any).updateCellAfterFormula === 'function') {
            (window as any).updateCellAfterFormula(formula.rowId, formula.columnName, String(newCalculatedValue));
          }
        } else {
          console.log(`⚪ Bağımlı formül değişmedi: ${formula.rowId}-${formula.columnName} = ${newCalculatedValue}`);
        }
      } catch (error) {
        console.error(`❌ Bağımlı formül hesaplama hatası:`, formula, error);
      }
    }

    // Query'leri invalidate et
    queryClient.invalidateQueries({ queryKey: [`/api/cell-formulas/${tableId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
    
    console.log(`✅ ${changedField} için bağımlı formüller yeniden hesaplandı`);
  };

  // Create column mutation
  const createColumnMutation = useMutation({
    mutationFn: (columnData: any) => apiRequest(`/api/dynamic-tables/${tableId}/columns`, {
      method: "POST",
      body: JSON.stringify(columnData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/columns`] });
      setShowColumnDialog(false);
      setColumnForm({
        name: "",
        displayName: "",
        dataType: "text",
        isRequired: false,
        isEditable: true,
        defaultValue: "",
        width: 150,
        currency: "TRY",
      });
      toast({
        title: "Başarılı",
        description: "Sütun başarıyla eklendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sütun eklenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Update column mutation
  const updateColumnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest(`/api/dynamic-columns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/columns`] });
      setEditingColumn(null);
      toast({
        title: "Başarılı",
        description: "Sütun başarıyla güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sütun güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Delete column mutation
  const deleteColumnMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/dynamic-columns/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/columns`] });
      toast({
        title: "Başarılı",
        description: "Sütun başarıyla silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Sütun silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Create row mutation
  const createRowMutation = useMutation({
    mutationFn: (rowData: any) => apiRequest(`/api/dynamic-tables/${tableId}/data`, {
      method: "POST",
      body: JSON.stringify({ rowData }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
      toast({
        title: "Başarılı",
        description: "Satır başarıyla eklendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Satır eklenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Update row mutation
  const updateRowMutation = useMutation({
    mutationFn: ({ id, rowData }: { id: string; rowData: any }) => apiRequest(`/api/dynamic-table-data/${id}`, {
      method: "PUT",
      body: JSON.stringify({ rowData }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Veri güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Convert columns to Tabulator format
  const getTabulatorColumns = () => {
    if (!columns.length) return [];

    const tabulatorColumns = columns
      .sort((a: DynamicColumn, b: DynamicColumn) => a.sortOrder - b.sortOrder)
      .map((col: DynamicColumn) => {
        const column: any = {
          title: col.displayName,
          field: col.name,
          width: col.width || 150,
          resizable: true,
          headerSort: true,
          editor: col.isEditable ? getEditorForType(col.dataType) : false,
          // 🔍 DEBUG: Column editable durumu
          cellDblClick: function() {
            console.log(`🔍 Column "${col.name}" editable: ${col.isEditable}, editor type: ${col.isEditable ? getEditorForType(col.dataType) : 'false'}`);
          },
          formatter: function(cell: any) {
            const rowId = cell.getRow().getData().id;
            const columnName = col.name;
            
            // Check if this cell has a formula
            const cellFormula = (cellFormulas || []).find((formula: any) => 
              formula.rowId === rowId && formula.columnName === columnName
            );
            
            // Check if this cell has a link
            const cellLink = cellLinks.find((link: any) => 
              link.sourceRowId === rowId && link.sourceColumnName === columnName
            );
            
            let displayValue = '';
            let cellIcon = '';
            
            if (cellFormula) {
              // This cell has a formula - show the calculated value from database
              displayValue = cellFormula.calculatedValue || '0'; // Use calculated value from database
              cellIcon = '🧮'; // Formula icon
            } else if (cellLink) {
              // This cell has a linked value - show actual linked data
              const linkKey = `${rowId}_${columnName}`;
              const linkedValue = linkedValues[linkKey];
              if (linkedValue) {
                displayValue = `${linkedValue}`;
                cellIcon = '🔗'; // Link icon
              } else {
                displayValue = '[Bağlantı Yükleniyor...]';
                cellIcon = '🔗';
              }
            } else {
              // Normal cell value
              const formatterFunc = getFormatterForType(col.dataType, col);
              displayValue = typeof formatterFunc === 'function' ? formatterFunc(cell) : cell.getValue();
            }
            
            // Her hücreye veri bağlama ikonu ekle
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <span style="${cellFormula ? 'color: #16a34a; font-weight: 500;' : cellLink ? 'color: #2563eb; font-weight: 500;' : ''}">${cellIcon ? cellIcon + ' ' : ''}${displayValue || ''}</span>
                <button 
                  class="cell-link-btn" 
                  style="
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    opacity: 0.5;
                    padding: 2px;
                    border-radius: 2px;
                  "
                  title="${cellFormula ? 'Formül: ' + cellFormula.formula : 'Veri Bağla'}"
                  onclick="window.handleCellLinkClick('${rowId}', '${columnName}')"
                >
                  🔗
                </button>
              </div>
            `;
          },
          cellEdited: function(cell: any) {
            console.log(`🔥🔥🔥 CELL EDITED EVENT TRIGGERED! 🔥🔥🔥`);
            const row = cell.getRow().getData();
            const field = cell.getField();
            const value = cell.getValue();
            console.log(`🎯 Row ID: ${row.id}, Field: ${field}, Value: "${value}"`);
            
            // Get all current row data (excluding id) and update the specific field
            const { id, ...currentRowData } = row;
            let updatedRowData = { ...currentRowData, [field]: value };
            
            // Formül kontrolü - eğer = ile başlıyorsa HyperFormula ile hesapla
            if (typeof value === 'string' && value.startsWith('=')) {
              const calculatedValue = calculateFormulaInTable(value, tableData || [], columns);
              
              // Formülü kaydet
              const formulaData = {
                tableId: tableId,
                rowId: id,
                columnName: field,
                formula: value,
                calculatedValue: calculatedValue,
                dependencies: null // PostgreSQL jsonb için null kulan
              };
              
              // Hesaplanan değeri hücreye anında set et
              cell.setValue(calculatedValue || '0');
              
              // Formülü database'e kaydet
              apiRequest('/api/cell-formulas', {
                method: 'POST',
                body: JSON.stringify(formulaData)
              }).then(() => {
                // Formül kaydedildikten sonra query'leri invalidate et
                queryClient.invalidateQueries({ queryKey: [`/api/cell-formulas/${tableId}`] });
                queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
              }).catch(error => {
                console.error('Formül kaydedilemedi:', error);
              });
              
              // Hesaplanan değeri göster
              updatedRowData[field] = calculatedValue || value;
            }
            
            // Update the database
            updateRowMutation.mutate({
              id: id,
              rowData: updatedRowData
            });

            // 🔄 SMART RECALCULATION: Sadece bağımlı formülleri hesapla
            setTimeout(() => {
              console.log(`🚀 SMART RECALCULATION tetikleniyor: ${field} değişti`);
              recalculateDependentFormulas(field, value);
            }, 100);

            if (onCellEdit) {
              onCellEdit(id, field, value);
            }
          },
          headerMenu: [
            {
              label: "Sütunu Düzenle",
              action: function(e: any, column: any) {
                startEditColumn(col);
              }
            },
            {
              label: "Sütunu Sil",
              action: function(e: any, column: any) {
                if (confirm("Bu sütunu silmek istediğinizden emin misiniz?")) {
                  deleteColumnMutation.mutate(col.id);
                }
              }
            }
          ],
          // Sağ tık yerine sol tık ile veri bağlama - daha güvenli
        };

        return column;
      });

    return tabulatorColumns;
  };

  // Para birimi için özel editör
  const currencyEditor = function(cell: any, onRendered: any, success: any, cancel: any, editorParams: any) {
    // Mevcut hücre değerini parse et
    const currentValue = cell.getValue();
    const parsedValue = parseCurrencyValue(currentValue);
    const amount = parsedValue ? parsedValue.amount : 0;
    const currency = parsedValue ? parsedValue.currency : 'TRY';

    // Container div oluştur
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '4px';
    container.style.padding = '2px';
    container.style.background = 'white';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '4px';

    // Sayı input'u oluştur
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.value = amount.toString();
    amountInput.style.flex = '1';
    amountInput.style.border = 'none';
    amountInput.style.outline = 'none';
    amountInput.style.padding = '2px';
    amountInput.style.fontSize = '12px';

    // Para birimi select'i oluştur
    const currencySelect = document.createElement('select');
    currencySelect.style.border = 'none';
    currencySelect.style.outline = 'none';
    currencySelect.style.fontSize = '12px';
    currencySelect.style.background = 'transparent';
    
    // Para birimi seçeneklerini ekle
    CURRENCIES.forEach(curr => {
      const option = document.createElement('option');
      option.value = curr.code;
      option.textContent = curr.code;
      option.selected = curr.code === currency;
      currencySelect.appendChild(option);
    });

    container.appendChild(amountInput);
    container.appendChild(currencySelect);

    // Fonksiyonlar
    const getValue = () => {
      const newAmount = parseFloat(amountInput.value) || 0;
      const newCurrency = currencySelect.value;
      return `${newAmount}|${newCurrency}`;
    };

    const setValue = () => {
      success(getValue());
    };

    // Event listeners
    amountInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        setValue();
      } else if (e.key === 'Escape') {
        cancel();
      }
    });

    // Para birimi değiştiğinde otomatik kaydet YAPMA - kullanıcı seçsin
    currencySelect.addEventListener('change', (e) => {
      e.stopPropagation();
      // Sadece seçimi güncellet, kaydetme
    });
    
    // Blur olduğunda kaydet
    amountInput.addEventListener('blur', setValue);
    
    // Enter tuşuyla da kaydet
    currencySelect.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        setValue();
      } else if (e.key === 'Escape') {
        cancel();
      }
    });

    // Render callback
    onRendered(() => {
      amountInput.focus();
      amountInput.select();
    });

    return container;
  };

  const getEditorForType = (dataType: string) => {
    switch (dataType) {
      case "number":
      case "decimal":
      case "currency":
        return "number";
      case "date":
        return "date";
      case "boolean":
      case "checkbox":
        return "tickCross";
      case "select":
        return "select";
      default:
        return "input";
    }
  };

  // Para birimi değerini parse etme fonksiyonu
  const parseCurrencyValue = (value: any) => {
    if (!value) return null;
    if (typeof value === 'object' && value.amount !== undefined) {
      return value; // Zaten format edilmiş
    }
    if (typeof value === 'string' && value.includes('|')) {
      const [amount, currency] = value.split('|');
      return { amount: parseFloat(amount) || 0, currency: currency || 'TRY' };
    }
    return { amount: parseFloat(value) || 0, currency: 'TRY' };
  };

  // Para birimini formatla
  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
    return `${currency.symbol}${amount.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getFormatterForType = (dataType: string, column?: DynamicColumn) => {
    switch (dataType) {
      case "decimal":
        return function(cell: any) {
          const value = cell.getValue();
          if (value === null || value === undefined) return '';
          return parseFloat(value).toFixed(2);
        };
      case "currency":
        return function(cell: any) {
          const value = cell.getValue();
          if (!value) return '';
          
          const parsedValue = parseCurrencyValue(value);
          if (!parsedValue) return '';
          
          return formatCurrency(parsedValue.amount, parsedValue.currency);
        };
      case "date":
        return function(cell: any) {
          const value = cell.getValue();
          if (!value) return '';
          try {
            return new Date(value).toLocaleDateString('tr-TR');
          } catch {
            return value;
          }
        };
      case "boolean":
      case "checkbox":
        return "tickCross";
      default:
        return function(cell: any) {
          const value = cell.getValue();
          return value || '';
        };
    }
  };

  // Global function for cell link click
  useEffect(() => {
    (window as any).handleCellLinkClick = (rowId: string, columnName: string) => {
      console.log("Cell link clicked:", { rowId, columnName });
      setCellLinkData({
        sourceRowId: rowId,
        sourceColumnName: columnName
      });
      setShowCellLinkModal(true);
    };

    return () => {
      delete (window as any).handleCellLinkClick;
    };
  }, []);

  // Initialize Tabulator
  useEffect(() => {
    if (!tabulatorRef.current || columnsLoading || dataLoading) return;

    const initTabulator = async () => {
      try {
        await loadTabulator();

        if (!window.Tabulator) {
          throw new Error('Tabulator failed to load');
        }

        // Destroy existing instance
        if (tabulatorInstance.current) {
          tabulatorInstance.current.destroy();
        }

        // Transform data for tabulator
        const transformedData = (tableData as any[]).map((row: any) => ({
          id: row.id,
          ...row.rowData,
        }));

        const tabulatorColumns = getTabulatorColumns();

        // Create new instance
        tabulatorInstance.current = new window.Tabulator(tabulatorRef.current, {
          data: transformedData,
          columns: tabulatorColumns,
          layout: "fitColumns",
          height: "400px",
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
          cellContextMenu: [
            {
              label: "🔗 Data Link", 
              action: function(e: any, cell: any) {
                const rowId = cell.getRow().getData().id;
                const columnName = cell.getField();
                (window as any).handleCellLinkClick(rowId, columnName);
              }
            },
            {
              label: "💱 Currency Change", 
              action: function(e: any, cell: any) {
                const rowId = cell.getRow().getData().id;
                const columnName = cell.getField();
                setCellLinkData({
                  sourceRowId: rowId,
                  sourceColumnName: columnName
                });
                setShowCellLinkModal(true);
                // Set modal to currency mode - we'll implement this
                setTimeout(() => {
                  (document.querySelector('[data-mode="currency"]') as HTMLElement)?.click();
                }, 100);
              }
            },
            {
              label: "🧮 Formül Ekle", 
              action: function(e: any, cell: any) {
                const rowId = cell.getRow().getData().id;
                const columnName = cell.getField();
                setCellLinkData({
                  sourceRowId: rowId,
                  sourceColumnName: columnName
                });
                setShowCellLinkModal(true);
                // Set modal to formula mode - we'll implement this
                setTimeout(() => {
                  (document.querySelector('[data-mode="formula"]') as HTMLElement)?.click();
                }, 100);
              }
            },
            {
              label: "🗑️ Delete Row", 
              action: function(e: any, cell: any) {
                const rowId = cell.getRow().getData().id;
                if (confirm("Bu satırı silmek istediğinizden emin misiniz?")) {
                  // We'll add row deletion API call
                  apiRequest(`/api/dynamic-table-data/${rowId}`, {
                    method: 'DELETE'
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
                    toast({
                      title: "Başarılı",
                      description: "Satır başarıyla silindi",
                    });
                  }).catch(() => {
                    toast({
                      title: "Hata", 
                      description: "Satır silinirken hata oluştu",
                      variant: "destructive",
                    });
                  });
                }
              }
            }
          ],
        });

        // Global fonksiyon - Modal'dan sonra hücre güncellemesi için
        (window as any).updateCellAfterFormula = (rowId: string, columnName: string, calculatedValue: string) => {
          if (tabulatorInstance.current) {
            try {
              console.log('🔍 TABULATOR DEBUG:');
              console.log('  - Aranan rowId:', rowId);
              console.log('  - Tüm satırlar:', tabulatorInstance.current.getData().map((r: any) => ({ id: r.id, data: r })));
              
              const row = tabulatorInstance.current.getRow(rowId);
              console.log('  - Bulunan row:', row);
              
              if (row) {
                console.log('  - Güncellemeden önce:', row.getData());
                row.update({ [columnName]: calculatedValue });
                console.log('  - Güncellemeden sonra:', row.getData());
                
                // Tabulator'ı görsel olarak yenile
                tabulatorInstance.current.redraw();
                console.log('🔄 Tabulator redraw yapıldı');
                
                // React Query cache'ini de invalidate et
                queryClient.invalidateQueries({ queryKey: [`/api/dynamic-tables/${tableId}/data`] });
                console.log('🔄 React Query cache invalidated');
                
                console.log(`🎯 Hücre güncellendi: ${rowId}-${columnName} = ${calculatedValue}`);
              } else {
                console.log('❌ Row bulunamadı! ID uyuşmuyor');
                // Alternatif: Index ile güncelleme deneyelim
                const allRows = tabulatorInstance.current.getRows();
                console.log('  - Toplam satır sayısı:', allRows.length);
                allRows.forEach((r: any, index: number) => {
                  const data = r.getData();
                  console.log(`    Satır ${index}: id=${data.id}`);
                  if (data.id === rowId) {
                    console.log('    ✅ ID eşleşti! Index ile güncellenecek');
                    r.update({ [columnName]: calculatedValue });
                  }
                });
              }
            } catch (error) {
              console.error('❌ Hücre güncellenemedi:', error);
            }
          }
        };

      } catch (error) {
        console.error("Error initializing tabulator:", error);
        toast({
          title: "Hata",
          description: "Tablo yüklenirken hata oluştu",
          variant: "destructive",
        });
      }
    };

    initTabulator();

    return () => {
      if (tabulatorInstance.current) {
        try {
          tabulatorInstance.current.destroy();
        } catch (error) {
          console.error("Error destroying tabulator:", error);
        }
      }
    };
  }, [columns, tableData, columnsLoading, dataLoading, tableId]);

  const handleAddColumn = () => {
    createColumnMutation.mutate({
      ...columnForm,
      sortOrder: columns.length,
    });
  };

  const handleUpdateColumn = () => {
    if (editingColumn) {
      updateColumnMutation.mutate({
        id: editingColumn.id,
        data: columnForm,
      });
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (confirm("Bu sütunu silmek istediğinizden emin misiniz?")) {
      deleteColumnMutation.mutate(columnId);
    }
  };

  const handleAddRow = () => {
    const newRowData: any = {};
    (columns as DynamicColumn[]).forEach((col: DynamicColumn) => {
      newRowData[col.name] = col.defaultValue || "";
    });
    
    createRowMutation.mutate(newRowData);
  };

  const startEditColumn = (column: DynamicColumn) => {
    setEditingColumn(column);
    setColumnForm({
      name: column.name,
      displayName: column.displayName,
      dataType: column.dataType,
      isRequired: column.isRequired,
      isEditable: column.isEditable,
      defaultValue: column.defaultValue || "",
      width: column.width || 150,
      currency: "TRY",
    });
    setShowColumnDialog(true);
  };

  if (columnsLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Row Management */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAddRow}
            disabled={columns.length === 0}
            data-testid="button-add-row"
          >
            <Plus className="w-4 h-4 mr-2" />
            Satır Ekle
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" data-testid="button-export">
            Dışa Aktar
          </Button>
          {/* Column Management */}
          <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-column">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Sütun
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingColumn ? "Sütun Düzenle" : "Yeni Sütun Ekle"}
                </DialogTitle>
                <DialogDescription>
                  {editingColumn ? "Sütun özelliklerini düzenleyin. Sütun başlığına sağ tıklayarak da bu menüye ulaşabilirsiniz." : "Tabloya yeni sütun ekleyin"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Sütun Adı</Label>
                  <Input
                    id="name"
                    value={columnForm.name}
                    onChange={(e) => setColumnForm({ ...columnForm, name: e.target.value })}
                    placeholder="ornek_sutun"
                    disabled={!!editingColumn}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Görünen Ad</Label>
                  <Input
                    id="displayName"
                    value={columnForm.displayName}
                    onChange={(e) => setColumnForm({ ...columnForm, displayName: e.target.value })}
                    placeholder="Örnek Sütun"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataType">Veri Tipi</Label>
                  <Select
                    value={columnForm.dataType}
                    onValueChange={(value) => setColumnForm({ ...columnForm, dataType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="width">Genişlik (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={columnForm.width}
                    onChange={(e) => setColumnForm({ ...columnForm, width: parseInt(e.target.value) || 150 })}
                    placeholder="150"
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="defaultValue">Varsayılan Değer</Label>
                  <Input
                    id="defaultValue"
                    value={columnForm.defaultValue}
                    onChange={(e) => setColumnForm({ ...columnForm, defaultValue: e.target.value })}
                    placeholder="Varsayılan değer"
                  />
                </div>

              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={editingColumn ? handleUpdateColumn : handleAddColumn}
                    disabled={!columnForm.name || !columnForm.displayName}
                  >
                    {editingColumn ? "Güncelle" : "Ekle"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowColumnDialog(false);
                      setEditingColumn(null);
                      setColumnForm({
                        name: "",
                        displayName: "",
                        dataType: "text",
                        isRequired: false,
                        isEditable: true,
                        defaultValue: "",
                        width: 150,
                        currency: "TRY",
                      });
                    }}
                  >
                    İptal
                  </Button>
                </div>
                
                {editingColumn && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteColumn(editingColumn.id);
                      setShowColumnDialog(false);
                      setEditingColumn(null);
                    }}
                  >
                    Sütunu Sil
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Instructions */}
      {columns.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p><strong>İpucu:</strong> Sütun başlığındaki üç nokta (...) menüsüne tıklayarak sütunu düzenleyebilirsiniz.</p>
              <p><strong>Veri Bağlama:</strong> Herhangi bir hücreye <strong>sağ tıklayarak</strong> başka tablolardan veri bağlayabilirsiniz.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabulator Container */}
      <div ref={tabulatorRef} className="border rounded-lg overflow-hidden" />
      
      {/* Cell Link Modal */}
      {cellLinkData && (
        <CellLinkModal
          isOpen={showCellLinkModal}
          onClose={() => {
            setShowCellLinkModal(false);
            setCellLinkData(null);
          }}
          sourceTableId={tableId}
          sourceRowId={cellLinkData.sourceRowId}
          sourceColumnName={cellLinkData.sourceColumnName}
        />
      )}
    </div>
  );
}