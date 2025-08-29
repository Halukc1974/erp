import { useState, useEffect } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Input } from "./input";
import { Loader2, Link, ExternalLink, Calculator, Plus, Minus, X, Divide } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { dbService } from "../../lib/database";
import { FormulaParser } from "../../utils/formula-parser";
import { HyperFormula } from "hyperformula";

interface CellLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTableId: string;
  sourceRowId: string;
  sourceColumnName: string;
}

export default function CellLinkModal({
  isOpen,
  onClose,
  sourceTableId,
  sourceRowId,
  sourceColumnName
}: CellLinkModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal seçimi: 'link', 'currency', 'delete' veya 'formula'
  const [modalMode, setModalMode] = useState<'link' | 'currency' | 'delete' | 'formula'>('link');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('TRY');
  
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  
  // Formül durumları
  const [formula, setFormula] = useState<string>("");
  const [formulaPreview, setFormulaPreview] = useState<string | null>(null);
  const [formulaError, setFormulaError] = useState<string | null>(null);

  // Para birimleri
  const CURRENCIES = [
    { code: "TRY", symbol: "₺", name: "Türk Lirası" },
    { code: "USD", symbol: "$", name: "Amerikan Doları" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "İngiliz Sterlini" },
    { code: "IQD", symbol: "ع.د", name: "Irak Dinarı" },
    { code: "LYD", symbol: "ل.د", name: "Libya Dinarı" }
  ];

  // Mevcut tabloları getir - Supabase'den dynamic_tables
  const { data: availableTables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ["dynamic_tables"],
    queryFn: () => dbService.fetchTable('dynamic_tables', {
      filter: 'is_active=eq.true'
    }),
    enabled: isOpen,
  });

  // Mevcut tablonun sütunlarını getir - Supabase'den dynamic_columns
  const { data: currentTableColumns = [] } = useQuery<any[]>({
    queryKey: [`dynamic_columns-${sourceTableId}`],
    queryFn: () => dbService.fetchTable('dynamic_columns', {
      filter: `table_id=eq.${sourceTableId}`,
      order: 'sort_order'
    }),
    enabled: isOpen && modalMode === 'formula',
  });

  // Mevcut tablonun verilerini getir - Supabase'den dynamic_table_data  
  const { data: currentTableData = [] } = useQuery<any[]>({
    queryKey: [`dynamic_table_data-${sourceTableId}`],
    queryFn: () => dbService.fetchTable('dynamic_table_data', {
      filter: `table_id=eq.${sourceTableId}`,
      order: 'id'
    }),
    enabled: isOpen && modalMode === 'formula',
  });

  // Seçilen tablonun sütunlarını getir - Supabase'den dynamic_columns
  const { data: selectedTableColumns = [] } = useQuery<any[]>({
    queryKey: [`selected-dynamic_columns-${selectedTable}`],
    queryFn: () => dbService.fetchTable('dynamic_columns', {
      filter: `table_id=eq.${selectedTable}`,
      order: 'sort_order'
    }),
    enabled: isOpen && !!selectedTable,
  });

  // Gerçek hücre koordinatları oluştur
  const realCellCoordinates = React.useMemo(() => {
    if (!currentTableColumns.length) return [];
    
    // Sütunları A, B, C... şeklinde etiketle
    const columnLetters = currentTableColumns.map((col: any, index: number) => ({
      letter: String.fromCharCode(65 + index), // A, B, C...
      name: col.name,
      displayName: col.displayName
    }));
    
    return columnLetters;
  }, [currentTableColumns]);

  // Hedef hücrenin Excel benzeri koordinatını bul
  const targetCellCoordinate = React.useMemo(() => {
    const colIndex = currentTableColumns.findIndex((col: any) => col.name === sourceColumnName);
    return colIndex >= 0 ? String.fromCharCode(65 + colIndex) : sourceColumnName;
  }, [currentTableColumns, sourceColumnName]);

  // Seçilen tablonun verilerini getir - Supabase'den  
  const { data: tableData = [], isLoading: dataLoading, error: dataError } = useQuery({
    queryKey: [`selected-table-data-${selectedTable}`],
    queryFn: () => dbService.fetchTable('dynamic_table_data', {
      filter: `table_id=eq.${selectedTable}`,
      order: 'id'
    }),
    enabled: isOpen && !!selectedTable,
  });

  // Debug: Veri yükleme durumunu logla
  React.useEffect(() => {
    console.log(`🔍 selectedTable değişti:`, selectedTable);
    if (selectedTable) {
      console.log(`🔍 Tablo verisi yükleniyor: "${selectedTable}"`);
      console.log('  - Supabase query için UUID:', selectedTable);
      console.log('  - Yükleniyor:', dataLoading);
      console.log('  - Hata:', dataError);
      console.log('  - Veri:', tableData);
      if (Array.isArray(tableData)) {
        console.log('  - Veri sayısı:', tableData.length);
        if (tableData.length > 0) {
          console.log('  - İlk kayıt örneği:', tableData[0]);
          console.log('  - İlk kayıt detayı:');
          console.log('    * id:', tableData[0]?.id);
          console.log('    * keys:', Object.keys(tableData[0] || {}));
          console.log('    * rowData:', tableData[0]?.row_data);
          if (tableData[0]?.row_data) {
            console.log('    * rowData keys:', Object.keys(tableData[0].row_data));
          }
        }
      }
    }
  }, [selectedTable, tableData, dataLoading, dataError]);

  // Seçilen tablonun kolonlarını bul
  // Seçilen tablonun info'sunu oluştur
  const selectedTableInfo = React.useMemo(() => {
    if (!selectedTable || !selectedTableColumns.length) return null;
    
    return {
      id: selectedTable,
      name: selectedTable,
      columns: selectedTableColumns.map((col: any) => col.name)
    };
  }, [selectedTable, selectedTableColumns]);

  // Debug: selectedTableInfo logla
  React.useEffect(() => {
    if (selectedTable) {
      console.log('  - selectedTable (UUID):', selectedTable);
      console.log('  - selectedTableColumns:', selectedTableColumns);
      console.log('  - selectedTableInfo:', selectedTableInfo);
      if (selectedTableInfo) {
        console.log('  - selectedTableInfo.columns:', selectedTableInfo.columns);
      }
    }
  }, [selectedTable, selectedTableInfo, selectedTableColumns]);

  // Cell link oluşturma mutation - Supabase
  const createLinkMutation = useMutation({
    mutationFn: async (linkData: any) => {
      return await dbService.insertData('cell_links', {
        source_table_id: linkData.sourceTableId,
        source_row_id: linkData.sourceRowId,
        source_column_name: linkData.sourceColumnName,
        target_table_name: linkData.targetTableName,
        target_row_id: linkData.targetRowId,
        target_field_name: linkData.targetFieldName
      });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Hücre bağlantısı oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: [`dynamic_table_data-${sourceTableId}`] });
      onClose();
      resetSelections();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Bağlantı oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  const handleCreateLink = () => {
    if (!selectedRow || !selectedField) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen kayıt ve alan seçiniz",
        variant: "destructive",
      });
      return;
    }

    createLinkMutation.mutate({
      sourceTableId,
      sourceRowId,
      sourceColumnName,
      targetTableName: selectedTable,
      targetRowId: selectedRow,
      targetFieldName: selectedField,
    });
  };

  const resetSelections = () => {
    setSelectedTable("");
    setSelectedRow("");
    setSelectedField("");
    setModalMode('link');
    setSelectedCurrency('TRY');
  };

  // Mevcut satır verisini getir
  const { data: currentRowData } = useQuery({
    queryKey: [`current-row-data-${sourceRowId}`],
    queryFn: () => dbService.fetchTable('dynamic_table_data', {
      filter: `id=eq.${sourceRowId}`
    }),
    enabled: isOpen && modalMode === 'currency' && !!sourceRowId,
  });

  // Para birimi değiştirme mutation
  const changeCurrencyMutation = useMutation({
    mutationFn: async (newCurrency: string) => {
      // Mevcut satır verilerini kontrol et
      if (!currentRowData || typeof currentRowData !== 'object') {
        throw new Error('Mevcut satır verisi bulunamadı');
      }
      
      // Mevcut hücre değerini al
      const currentCellValue = (currentRowData as any)[sourceColumnName] || '0|TRY';
      
      // Değeri parse et
      let amount = 0;
      if (typeof currentCellValue === 'string' && currentCellValue.includes('|')) {
        const [amountStr] = currentCellValue.split('|');
        amount = parseFloat(amountStr) || 0;
      } else if (typeof currentCellValue === 'number') {
        amount = currentCellValue;
      }
      
      // Yeni değeri oluştur
      const newValue = `${amount}|${newCurrency}`;
      
      // Tüm mevcut satır verisini koru, sadece bu hücreyi güncelle
      const updatedRowData = {
        ...(currentRowData as any),
        [sourceColumnName]: newValue
      };
      
      // If sourceRowId is a dummy, create a real row first
      let targetRowId = sourceRowId;
      if (String(targetRowId).startsWith('dummy-')) {
        console.log(`🔧 changeCurrencyMutation: sourceRowId is dummy (${targetRowId}), creating real row...`);
        const created = await dbService.insertData('dynamic_table_data', {
          table_id: sourceTableId,
          row_data: JSON.stringify(updatedRowData),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        // insertData returns an array or object depending on API; normalize
        targetRowId = Array.isArray(created) ? created[0]?.id : created?.id;
        console.log('🔧 changeCurrencyMutation: created row id =', targetRowId);
      }

      return await dbService.updateData('dynamic_table_data', targetRowId, {
        row_data: JSON.stringify(updatedRowData),
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Para birimi değiştirildi",
      });
      queryClient.invalidateQueries({ queryKey: [`dynamic_table_data-${sourceTableId}`] });
      onClose();
      resetSelections();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Para birimi değiştirilemedi",
        variant: "destructive",
      });
    },
  });

  // Satır silme mutation - Supabase
  const deleteRowMutation = useMutation({
    mutationFn: async () => {
      return await dbService.deleteData('dynamic_table_data', sourceRowId);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Satır başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: [`dynamic_table_data-${sourceTableId}`] });
      onClose();
      resetSelections();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Satır silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Formül mutation'ı - Supabase 
  const saveFormulaMutation = useMutation({
    mutationFn: async (formulaData: { formula: string }) => {
      // 1. Önce formülü hesapla
      const calculatedValue = calculateFormulaPreview(formulaData.formula);
      const finalCalculatedValue = (calculatedValue && calculatedValue !== "Hesaplanıyor...") ? calculatedValue : "0";
      
      console.log('🧮 Hesaplanan değer:', finalCalculatedValue);

      // 2. Formülü calculatedValue ile beraber kaydet
      // If sourceRowId is a dummy, create a real row first with initial data
      let targetRowId = sourceRowId;
      if (String(targetRowId).startsWith('dummy-')) {
        console.log(`🔧 saveFormulaMutation: sourceRowId is dummy (${targetRowId}), creating real row...`);
        const created = await dbService.insertData('dynamic_table_data', {
          table_id: sourceTableId,
          row_data: JSON.stringify({ [sourceColumnName]: finalCalculatedValue }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        targetRowId = Array.isArray(created) ? created[0]?.id : created?.id;
        console.log('🔧 saveFormulaMutation: created row id =', targetRowId);
      }

      const formulaResponse = await dbService.insertData('dynamic_cell_formulas', {
        table_id: sourceTableId,
        row_id: targetRowId,
        column_name: sourceColumnName,
        formula_text: formulaData.formula,
        calculated_value: finalCalculatedValue,
        is_active: true
      });

      console.log('✅ Formül database kaydedildi:', formulaResponse);

      // 3. Hesaplanan değeri hücreye de yaz (JSON row_data formatında)
      const currentRowData = currentTableData.find((row: any) => row.id === sourceRowId);
      const updatedRowData = {
        ...(typeof currentRowData?.row_data === 'string' ? JSON.parse(currentRowData.row_data) : currentRowData?.row_data || {}),
        [sourceColumnName]: finalCalculatedValue
      };
      
      const updateResponse = await dbService.updateData('dynamic_table_data', targetRowId, {
        row_data: JSON.stringify(updatedRowData),
        updated_at: new Date().toISOString()
      });

      console.log('✅ Hücre değeri güncellendi:', updateResponse);

      return { formula: formulaResponse, update: updateResponse };
    },
    onSuccess: (response: any) => {
      console.log('🎉 onSuccess tetiklendi! Response:', response);
      
      // Hesaplanan değeri tekrar al (doğru olduğundan emin olmak için)
      const calculatedValue = calculateFormulaPreview(formula);
      const finalCalculatedValue = (calculatedValue && calculatedValue !== "Hesaplanıyor...") ? calculatedValue : "0";
      
      console.log('🔍 DEBUG: Modal sonucu kontrol:');
      console.log('  - sourceRowId:', sourceRowId);
      console.log('  - sourceColumnName:', sourceColumnName);
      console.log('  - formula:', formula);
      console.log('  - finalCalculatedValue:', finalCalculatedValue);
      console.log('  - updateCellAfterFormula var mı?', typeof (window as any).updateCellAfterFormula);
      
      if (finalCalculatedValue && (window as any).updateCellAfterFormula) {
        console.log(`📲 Global fonksiyon çağırılıyor: ${sourceRowId}, ${sourceColumnName}, ${finalCalculatedValue}`);
        (window as any).updateCellAfterFormula(sourceRowId, sourceColumnName, finalCalculatedValue);
      } else {
        console.log('❌ Global fonksiyon çağırılamadı - finalCalculatedValue:', finalCalculatedValue);
      }
      
      toast({
        title: "Başarılı",
        description: "Formül kaydedildi ve hücre değeri güncellendi",
      });
      
      // Cache'i temizle ve tabloyu yenile
      queryClient.invalidateQueries({ queryKey: [`dynamic_table_data-${sourceTableId}`] });
      
      // Modal'ı kapat
      onClose();
      resetSelections();
      setFormula(""); // Formülü temizle
      
      // Sayfayı tamamen yenile (F5 gibi)
      setTimeout(() => {
        window.location.reload();
      }, 500); // 500ms bekle ki toast görünebilsin
    },
    onError: (error: any) => {
      console.log('💥 onError tetiklendi! Error:', error);
      toast({
        title: "Hata",
        description: error.message || "Formül kaydedilirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  // Global formül hesaplama fonksiyonunu window'a ekle (auto-recalculation için)
  useEffect(() => {
    (window as any).calculateFormulaWithData = (formula: string, tableData: any[], columns: any[]): string => {
      if (!formula.startsWith('=') || !tableData.length || !columns.length) return '0';

      // 🎯 ÇÖZÜM 1: Column Name → Position Mapping
      const createColumnMapping = (columns: any[]) => {
        const sortedColumns = [...columns].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
        const mapping: { [key: string]: number } = {};

        sortedColumns.forEach((column, index) => {
          const letter = String.fromCharCode(65 + index);
          mapping[letter.toLowerCase()] = index;
          if (column.name) mapping[String(column.name).toLowerCase()] = index;
        });

        console.log('🔄 GLOBAL - Column Name → Position Mapping:', mapping);
        return mapping;
      };

      // 🎯 Formül çevirme fonksiyonu
      const convertFormulaToPositionBased = (formula: string, columnMapping: { [key: string]: number }) => {
        // Excel hücre referanslarını bul ve çevir (örn: a1 → A1, b2 → B2)
        const convertedFormula = formula.replace(/([a-zA-Z]+\d+)/g, (match) => {
          const columnName = match.toLowerCase();
          const position = columnMapping[columnName];

          if (position !== undefined) {
            // Pozisyonu Excel sütun harfine çevir (0=A, 1=B, 2=C, ...)
            const excelColumn = String.fromCharCode(65 + position);
            const rowMatch = match.match(/(\d+)/);
            const rowNumber = rowMatch ? rowMatch[1] : '1';

            const excelRef = excelColumn + rowNumber;
            console.log(`🔄 GLOBAL - ${match} → ${excelRef} (position: ${position})`);
            return excelRef;
          }

          return match; // Mapping bulunamazsa orijinali bırak
        });

        return convertedFormula;
      };

      try {
        console.log('🧮 Global formül hesaplanıyor:', formula);

        // Column mapping oluştur ve formülü çevir
        let processedFormula = formula;
        if (columns && columns.length > 0) {
          const columnMapping = createColumnMapping(columns);
          processedFormula = convertFormulaToPositionBased(formula, columnMapping);
        }

        // Son olarak büyük harfe çevir (Excel standart)
        processedFormula = processedFormula.toUpperCase();

        console.log(`🎯 GLOBAL - Formül çevirme sonucu: "${formula}" → "${processedFormula}"`);

        // HyperFormula instance oluştur
        const hf = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' });
        const sheetId = hf.addSheet('Sheet1');
        const numericSheetId = typeof sheetId === 'number' ? sheetId : 0;
        
        // Veri matrisini oluştur - ÖNEMLİ: POSITION-BASED SIRALAMA
        const dataMatrix: (string | number | null)[][] = [];
        
        // Columns'u sortOrder'a göre sırala (Excel A=0, B=1, C=2...)
        const sortedColumns = [...columns].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
        console.log(`📊 Modal Position-based sıralama:`, sortedColumns.map((c: any) => `${c.name}(order:${c.sortOrder})`).join(', '));
        
        tableData.forEach((row: any) => {
          const rowData: (string | number | null)[] = [];
          sortedColumns.forEach((column: any) => {
            // TABULATOR DATA FORMAT: row[column.name] (id hariç direkt property'ler)
            const value = row[column.name];
            
            console.log(`🔍 ${column.name} = ${value} (type: ${typeof value})`);
            
            let finalValue: string | number | null = null;
            if (value === null || value === undefined || value === '') {
              finalValue = null;
            } else if (typeof value === 'string' && value.includes('|')) {
              const [amount] = value.split('|');
              const numAmount = parseFloat(amount);
              finalValue = isNaN(numAmount) ? 0 : numAmount;
            } else if (typeof value === 'number') {
              finalValue = value;
            } else {
              const numValue = parseFloat(String(value));
              finalValue = isNaN(numValue) ? String(value) : numValue;
            }
            
            rowData.push(finalValue);
          });
          dataMatrix.push(rowData);
        });
        
        // Padding
        while (dataMatrix.length < 10) {
          dataMatrix.push(new Array(Math.max(sortedColumns.length, 10)).fill(null));
        }
        dataMatrix.forEach(row => {
          while (row.length < 10) row.push(null);
        });
        
        // Veriyi set et ve formülü hesapla
        hf.setSheetContent(numericSheetId, dataMatrix);
        const tempRow = Math.max(tableData.length + 2, 10);
        const tempCol = Math.max(sortedColumns.length + 2, 10);
        hf.setCellContents({ sheet: numericSheetId, row: tempRow, col: tempCol }, [[processedFormula]]);
        
        const result = hf.getCellValue({ sheet: numericSheetId, row: tempRow, col: tempCol });
        hf.destroy();
        
        if (result === null || result === undefined) return '0';
        if (typeof result === 'object') return '#ERROR';
        if (typeof result === 'number') {
          if (Math.abs(result) > 1e15) return result.toExponential(2);
          if (result % 1 !== 0) return parseFloat(result.toFixed(6)).toString();
          return result.toString();
        }
        
        return String(result);
      } catch (error) {
        console.error('💥 Global formül hesaplama hatası:', error);
        return '#ERROR';
      }
    };
  }, []);

  // Gerçek hücre değerlerini al
  const getRealCellValue = (cellRef: string): number => {
    try {
      // Hücre referansını parse et (örn: "A1" -> sütun "A", satır 1)
      const match = cellRef.match(/^([A-Z]+)(\d+)$/);
      if (!match) return 0;
      
      const [, columnLetter, rowNumber] = match;
      const rowIndex = parseInt(rowNumber) - 1; // 1-based'den 0-based'e
      
      // Sütun harfini sütun adına çevir
      const columnIndex = columnLetter.charCodeAt(0) - 65; // A=0, B=1, C=2...
      const column = currentTableColumns[columnIndex];
      
      if (!column) {
        console.log(`Column not found for ${columnLetter} (index: ${columnIndex})`);
        return 0;
      }
      
      // Tablodaki satırı bul
      const row = currentTableData[rowIndex];
      if (!row || !row.rowData) {
        console.log(`Row not found at index ${rowIndex}`);
        return 0;
      }
      
      // Sütun değerini al ve sayıya çevir
      const value = row.rowData[column.name];
      const numValue = parseFloat(value);
      const result = isNaN(numValue) ? 0 : numValue;
      
      console.log(`${cellRef}: column=${column.name}, value=${value}, parsed=${result}`);
      return result;
    } catch (error) {
      console.error('Hücre değeri alınırken hata:', error);
      return 0;
    }
  };

  // HyperFormula ile profesyonel formül hesaplama
  const calculateFormulaPreview = (formula: string): string | null => {
    if (!formula.startsWith('=')) return null;

    // Boş formül kontrolü
    if (formula.trim() === '=') {
      return 'Hesaplanıyor...';
    }

    // 🎯 ÇÖZÜM 1: Column Name → Position Mapping
    const createColumnMapping = (columns: any[]) => {
      const sortedColumns = [...columns].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const mapping: { [key: string]: number } = {};

      console.log('🔍 MODAL DEBUG - Original columns:', columns.map((c: any) => `${c.name}(sortOrder:${c.sortOrder})`));
      console.log('🔍 MODAL DEBUG - Sorted columns:', sortedColumns.map((c: any) => `${c.name}(sortOrder:${c.sortOrder})`));

      sortedColumns.forEach((column, index) => {
        const letter = String.fromCharCode(65 + index);
        mapping[letter.toLowerCase()] = index;
        if (column.name) mapping[String(column.name).toLowerCase()] = index;
      });

      console.log('🔄 MODAL - Column Name → Position Mapping:', mapping);
      return mapping;
    };

    // 🎯 Formül çevirme fonksiyonu
    const convertFormulaToPositionBased = (formula: string, columnMapping: { [key: string]: number }) => {
      const convertedFormula = formula.replace(/([a-zA-Z]+)(\d+)/g, (fullMatch, letters, digits) => {
        const key = String(letters).toLowerCase();
        const position = columnMapping[key];

        if (position !== undefined) {
          const excelColumn = String.fromCharCode(65 + position);
          const excelRef = excelColumn + digits;
          console.log(`🔄 MODAL - ${fullMatch} → ${excelRef} (position: ${position})`);
          return excelRef;
        }

        return fullMatch;
      });

      return convertedFormula;
    };

    try {
      console.log('🧮 Formül hesaplanıyor:', formula);
      console.log('📊 Tablo verileri:', currentTableData.length, 'satır');
      console.log('📋 Sütunlar:', currentTableColumns.map(c => c.name));
      console.log('📋 İlk satır verisi:', currentTableData[0]?.rowData);
      
      // Veri yoksa hesaplama yapmaya gerek yok
      if (!currentTableData.length || !currentTableColumns.length) {
        console.log('⚠️ Veri veya sütun bulunamadı');
        return '0';
      }

      // *** MODAL İÇİN ÖZEL DATA TRANSFORMATION ***
      // Tabulator'daki transform logic'i modal için de uygula
      const transformedData = currentTableData.map((originalRow, index) => {
        console.log(`🔄 MODAL - Transform Row ${index + 1}:`, originalRow);
        
        let transformedRow: any = {
          id: originalRow.id,
          table_id: originalRow.table_id,
          user_id: originalRow.user_id,
          created_at: originalRow.created_at,
          updated_at: originalRow.updated_at
        };

        // row_data parsing - tabulator ile aynı logic
        let parsedData: any = {};
        
        if (typeof originalRow.row_data === 'string') {
          try {
            parsedData = JSON.parse(originalRow.row_data);
            console.log(`✅ MODAL - JSON parse success:`, parsedData);
          } catch (e) {
            console.error(`❌ MODAL - JSON parse error:`, e);
            parsedData = {};
          }
        } else if (typeof originalRow.row_data === 'object' && originalRow.row_data !== null) {
          parsedData = originalRow.row_data;
          console.log(`✅ MODAL - Direct object use:`, parsedData);
        } else {
          console.log(`⚠️ MODAL - No row_data found, using empty object`);
          parsedData = {};
        }

        // Field'ları direkt row seviyesine çıkar - tabulator pattern (POSITION-BASED)
        const sortedTableColumns = [...currentTableColumns].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
        sortedTableColumns.forEach((column: any) => {
          const fieldName = column.name;
          if (parsedData[fieldName] !== undefined) {
            transformedRow[fieldName] = parsedData[fieldName];
            console.log(`🔗 MODAL - Field ${fieldName}: ${parsedData[fieldName]} → ${transformedRow[fieldName]}`);
          } else {
            transformedRow[fieldName] = '';
            console.log(`⚠️ MODAL - Field ${fieldName} not found, using empty string`);
          }
        });

        console.log(`✅ MODAL - Transformed row:`, transformedRow);
        return transformedRow;
      });

      console.log('🎯 MODAL - All data transformed:', transformedData);
      
      // 🎯 FORMÜL NORMALİZATİON UYGULA (Column Name → Position Mapping)
      const originalFormula = formula;

      // Column mapping oluştur ve formülü çevir
      let normalizedFormula = formula;
      if (currentTableColumns && currentTableColumns.length > 0) {
        const columnMapping = createColumnMapping(currentTableColumns);
        normalizedFormula = convertFormulaToPositionBased(formula, columnMapping);
      }

      // Son olarak büyük harfe çevir (Excel standart)
      normalizedFormula = normalizedFormula.toUpperCase();

      console.log(`🎯 MODAL - Formül çevirme sonucu: "${originalFormula}" → "${normalizedFormula}"`);

      // HyperFormula instance oluştur
      const hfOptions = {
        licenseKey: 'gpl-v3', // Open source license
        useColumnIndex: true, // 🎯 POZISYON BAZLI: A=0, B=1, C=2 otomatik
      };
      
      const hf = HyperFormula.buildEmpty(hfOptions);
      
      // Worksheet ekle - HyperFormula 0-indexed sayısal ID döndürür
      const sheetId = hf.addSheet('Sheet1');
      console.log('📑 MODAL - Sheet ID:', sheetId, 'Type:', typeof sheetId);
      
      // SheetId'yi sayıya çevir
      const numericSheetId = typeof sheetId === 'number' ? sheetId : 0;
      
      // Mevcut tablo verilerini HyperFormula'ya aktar
      const maxRows = Math.max(currentTableData.length, 10);
      const maxCols = Math.max(currentTableColumns.length, 10);
      
      // Veri matrisini hazırla - sadece gerçek veri için
      const dataMatrix: (string | number | null)[][] = [];
      
      // Sadece mevcut satırları işle, boş satır ekleme
      for (let row = 0; row < transformedData.length; row++) {
        const rowData: (string | number | null)[] = [];
        const tableRow = transformedData[row];  // TRANSFORMED DATA KULLAN
        
        console.log(`🔍 MODAL - Satır ${row + 1} işleniyor:`, tableRow);
        console.log(`🔍 MODAL - TableRow yapısı:`, Object.keys(tableRow));
        
        for (let col = 0; col < currentTableColumns.length; col++) {
          const column = currentTableColumns[col];
          const columnName = column.name;
          
          console.log(`🔧 MODAL - ${columnName} aranıyor...`);
          
          // ARTIK BASIT: Direkt field access (tableRow[columnName])
          let value = tableRow[columnName];
          
          if (value !== undefined) {
            console.log(`✅ MODAL - Direkt field'dan alındı: ${columnName} = ${value}`);
          } else {
            console.log(`⚠️ MODAL - ${columnName} hiçbir yerde bulunamadı`);
            console.log(`⚠️ MODAL - TableRow keys:`, Object.keys(tableRow));
            value = null;
          }
          
          // Sayısal değerleri number olarak kaydet
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
          
          // A1, B1, C1... formatında log - DOĞRU MAPPING
          const cellRef = String.fromCharCode(65 + col) + (row + 1);
          console.log(`📍 ${cellRef} = ${finalValue} (raw: ${value}) [sütun: ${column.name}]`);
          
          // a1+a2 formülü için özel debug
          if (formula.toLowerCase().includes('a1') && row === 0 && col === 0) {
            console.log(`🔥 MODAL FORMÜL DEBUG [${cellRef}]:`, {
              columnName: column.name,
              rawValue: value,
              processedValue: finalValue,
              expectedForA1: 'Bu A1 değeri, tab verification için'
            });
          }
        }
        dataMatrix.push(rowData);
      }
      
      // En az 10x10 matrix olması için boş satır ve sütunlar ekle
      while (dataMatrix.length < 10) {
        const emptyRow = new Array(Math.max(currentTableColumns.length, 10)).fill(null);
        dataMatrix.push(emptyRow);
      }
      
      // Her satırda en az 10 sütun olması için
      dataMatrix.forEach(row => {
        while (row.length < 10) {
          row.push(null);
        }
      });
      
      console.log('🏗️ Veri matrisi:', dataMatrix);
      
      // Veriyi HyperFormula'ya yükle - numerik sheetId kullan
      hf.setSheetContent(numericSheetId, dataMatrix);
      
      // Formülü geçici bir hücreye yerleştir ve hesapla - boş alanda
      const tempRow = Math.max(transformedData.length + 2, 10);
      const tempCol = Math.max(currentTableColumns.length + 2, 10);
      
      console.log(`📝 MODAL - Formül ${tempRow+1}:${tempCol+1} hücresine yerleştiriliyor`);
      console.log(`🎯 MODAL - HyperFormula'ya gönderilecek formül: "${normalizedFormula}" (orijinal: "${originalFormula}")`);
      
      // Formülü array olarak gönder - NORMALIZED FORMULA KULLAN
      const formulaArray = [[normalizedFormula]];
      hf.setCellContents({ sheet: numericSheetId, row: tempRow, col: tempCol }, formulaArray);
      
      // Sonucu al
      const result = hf.getCellValue({ sheet: numericSheetId, row: tempRow, col: tempCol });
      
      console.log('✅ MODAL FORMÜL SONUCU:', {
        originalFormula: originalFormula,
        normalizedFormula: normalizedFormula,
        result: result,
        resultType: typeof result,
        expectedFormula: 'A1+B1+C1 değerleri toplamı olmalı',
        matrixFirst3Cells: [
          `A1=${dataMatrix[0]?.[0]}`, 
          `B1=${dataMatrix[0]?.[1]}`, 
          `C1=${dataMatrix[0]?.[2]}`
        ]
      });
      
      // HyperFormula instance'ını temizle
      hf.destroy();
      
      // Sonuç kontrolü
      if (result === null || result === undefined) {
        console.log('❌ Sonuç null/undefined');
        return '0';
      }
      
      // HyperFormula error kontrolü
      if (typeof result === 'object') {
        if ((result as any).error || (result as any).message) {
          console.error('❌ HyperFormula hatası:', result);
          return '#ERROR';
        }
      }
      
      // Sayı formatlaması
      if (typeof result === 'number') {
        // Çok büyük veya çok küçük sayıları kontrol et
        if (Math.abs(result) > 1e15) {
          return result.toExponential(2);
        }
        // Ondalık sayıları formatla
        if (result % 1 !== 0) {
          return parseFloat(result.toFixed(6)).toString();
        }
        return result.toString();
      }
      
      return String(result);
      
    } catch (error) {
      console.error('💥 HyperFormula hesaplama hatası:', error);
      if (error instanceof Error) {
        return `#ERROR: ${error.message}`;
      }
      return '#ERROR';
    }
  };

  // Formül validation ve önizleme
  React.useEffect(() => {
    if (formula && formula.trim() && formula.startsWith('=')) {
      try {
        const preview = calculateFormulaPreview(formula);
        if (preview) {
          setFormulaPreview(preview);
          setFormulaError(null);
        } else {
          setFormulaPreview(null);
          setFormulaError("Geçersiz formül");
        }
      } catch (error) {
        setFormulaPreview(null);
        setFormulaError(error instanceof Error ? error.message : 'Bilinmeyen hata');
      }
    } else {
      setFormulaPreview(null);
      setFormulaError(formula.trim() && !formula.startsWith('=') ? 'Formül = ile başlamalı' : null);
    }
  }, [formula]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            {modalMode === 'link' ? 'Veri Bağlantısı Oluştur' 
             : modalMode === 'currency' ? 'Para Birimi Değiştir' 
             : modalMode === 'formula' ? 'Formül Ekle'
             : 'Satır Silme Onayı'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {modalMode === 'link' 
              ? `${sourceColumnName} hücresine bağlanacak veriyi seçin`
              : modalMode === 'currency'
              ? `${sourceColumnName} hücresinin para birimini değiştirin`
              : modalMode === 'formula'
              ? `${sourceColumnName} hücresine matematik formülü ekleyin`
              : `Bu satırı kalıcı olarak silmek istediğinizden emin misiniz?`
            }
          </p>
          {/* Hedef hücre bilgileri - formül modu için özellikle önemli */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-mono">
                {sourceColumnName}
              </div>
              <span className="text-sm font-medium text-blue-800">
                Satır ID: {sourceRowId}
              </span>
              <span className="text-xs text-blue-600">
                ({modalMode === 'formula' ? 'Formül eklenecek hücre' : modalMode === 'currency' ? 'Para birimi değişecek hücre' : modalMode === 'link' ? 'Veri bağlanacak hücre' : 'İşlem yapılacak satır'})
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Seçim Butonları */}
        <div className="grid grid-cols-4 gap-1 mb-4 p-1 bg-muted rounded-lg">
          <Button
            variant={modalMode === 'link' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setModalMode('link')}
          >
            🔗 Veri Bağla
          </Button>
          <Button
            variant={modalMode === 'currency' ? 'default' : 'ghost'}
            size="sm" 
            onClick={() => setModalMode('currency')}
          >
            💱 Para Birimi
          </Button>
          <Button
            variant={modalMode === 'formula' ? 'default' : 'ghost'}
            size="sm" 
            onClick={() => setModalMode('formula')}
          >
            🧮 Formül Ekle
          </Button>
          <Button
            variant={modalMode === 'delete' ? 'default' : 'ghost'}
            size="sm" 
            onClick={() => setModalMode('delete')}
          >
            🗑️ Satır Sil
          </Button>
        </div>

        {modalMode === 'link' ? (
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
          {/* Tablo Seçimi */}
          <div>
            <label className="text-sm font-medium mb-2 block">1. Veri Kaynağı Tablosu</label>
            <Select value={selectedTable} onValueChange={(value) => { 
              setSelectedTable(value);
              setSelectedRow("");
              setSelectedField("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Tablo seçiniz..." />
              </SelectTrigger>
              <SelectContent>
                {tablesLoading ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Yükleniyor...
                  </SelectItem>
                ) : (
                  (Array.isArray(availableTables) ? availableTables : [])?.map((table: any) => (
                    <SelectItem key={table.id} value={table.id} className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      {table.display_name || table.displayName || table.name}
                    </SelectItem>
                  )) || []
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Alan Seçimi */}
          {selectedTable && selectedTableInfo && (
            <div>
              <label className="text-sm font-medium mb-2 block">2. Gösterilecek Alan</label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Alan seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedTableInfo.columns?.map((column: string) => (
                    <SelectItem key={column} value={column} className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      {column}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Veri Seçimi */}
          {selectedTable && selectedField && selectedTableInfo && (
            <div className="flex-1 overflow-hidden">
              <label className="text-sm font-medium mb-2 block">3. Kayıt Seçimi</label>
              <div className="border rounded-lg overflow-hidden h-64">
                {dataLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Veriler yükleniyor...
                  </div>
                ) : (
                  <div className="overflow-auto h-full">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-12">Seç</TableHead>
                          {selectedTableInfo.columns?.map((column: string) => (
                            <TableHead key={column}>{column}</TableHead>
                          )) || []}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Array.isArray(tableData) && tableData.length > 0) ? tableData.map((row: any) => (
                          <TableRow 
                            key={row.id}
                            className={selectedRow === row.id ? "bg-primary/10" : "cursor-pointer hover:bg-muted/50"}
                            onClick={() => setSelectedRow(row.id)}
                          >
                            <TableCell>
                              <input 
                                type="radio" 
                                name="selectedRow"
                                checked={selectedRow === row.id}
                                onChange={() => setSelectedRow(row.id)}
                                className="accent-primary"
                              />
                            </TableCell>
                            {selectedTableInfo.columns?.map((column: string) => (
                              <TableCell key={column}>
                                {column === selectedField ? (
                                  <span className="font-medium text-primary flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" />
                                    {row[column] || '-'}
                                  </span>
                                ) : (
                                  row[column] || '-'
                                )}
                              </TableCell>
                            )) || []}
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={(selectedTableInfo.columns?.length || 0) + 1} className="text-center text-muted-foreground">
                              Bu tabloda henüz veri bulunmuyor
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        ) : modalMode === 'currency' ? (
          /* Para Birimi Değiştirme */
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
            <div>
              <label className="text-sm font-medium mb-2 block">Para Birimi Seçin</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code} className="text-foreground hover:bg-accent hover:text-accent-foreground">
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Önizleme:</strong> Seçilen para birimi ile hücre değeri değişecektir.
              </p>
            </div>
          </div>
        ) : modalMode === 'formula' ? (
          /* Formül Editörü */
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
            {/* Hedef Hücre Bilgisi - Vurgu */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-amber-500 text-white px-3 py-1 rounded font-mono text-lg font-bold">
                  {targetCellCoordinate}
                </div>
                <span className="text-amber-800 font-semibold">← Bu hücreye formül eklenecek</span>
                <span className="text-sm text-gray-600">({sourceColumnName})</span>
              </div>
              <p className="text-sm text-amber-700">
                Satır ID: <span className="font-mono bg-amber-100 px-1 rounded">{sourceRowId}</span>
              </p>
            </div>
            
            {/* Formül Giriş Alanı */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Matematik Formülü 
                <span className="text-blue-600 ml-2">({targetCellCoordinate} hücresine uygulanacak)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder={`=${targetCellCoordinate !== 'A' ? 'A' : 'B'}1+${targetCellCoordinate !== 'B' ? 'B' : 'C'}2*${targetCellCoordinate !== 'C' ? 'C' : 'D'}3 (${targetCellCoordinate} hücresine eklenecek)`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                />
                <div className="absolute right-2 top-2 text-xs text-gray-400">
                  Excel benzeri formül
                </div>
              </div>
              {/* Formül sonucu önizleme */}
              {formulaPreview && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <span className="text-green-700 font-semibold">Sonuç:</span>
                  <span className="ml-2 font-mono">{formulaPreview}</span>
                </div>
              )}
              {formulaError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <span className="text-red-700 font-semibold">Hata:</span>
                  <span className="ml-2">{formulaError}</span>
                </div>
              )}
            </div>

            {/* Hızlı Hücre Seçiciler */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Gerçek Hücre Seçici (Tıklayarak formüle ekleyin)
                <span className="text-gray-600 text-xs ml-2">→ {targetCellCoordinate} hücresine uygulanacak</span>
              </label>
              
              {/* Gerçek Tablo Sütunları */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Mevcut Tablo Sütunları:</p>
                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border">
                  {realCellCoordinates.map((coord: any) => {
                    const isTargetCell = coord.name === sourceColumnName;
                    return (
                      <button
                        key={coord.name}
                        onClick={() => setFormula(prev => prev + coord.letter + '1')}
                        className={`px-3 py-2 text-sm border rounded hover:bg-blue-100 hover:border-blue-300 ${
                          isTargetCell 
                            ? 'bg-amber-200 border-amber-400 text-amber-800 font-bold ring-2 ring-amber-300' 
                            : 'bg-white border-gray-200'
                        }`}
                        title={isTargetCell ? `Bu hücreye (${coord.letter}) formül eklenecek!` : `${coord.letter} (${coord.displayName}) hücresini formüle ekle`}
                      >
                        <div className="font-mono font-bold">{coord.letter}</div>
                        <div className="text-xs">{coord.displayName}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genel Hücre Seçici */}
              <div className="grid grid-cols-10 gap-1 p-3 bg-gray-50 rounded-lg border max-h-32 overflow-auto">
                {Array.from({length: 5}, (_, row) => 
                  Array.from({length: Math.min(10, realCellCoordinates.length || 10)}, (_, col) => {
                    const cellRef = String.fromCharCode(65 + col) + (row + 1);
                    const isTargetCell = cellRef.charAt(0) === targetCellCoordinate;
                    return (
                      <button
                        key={cellRef}
                        onClick={() => setFormula(prev => prev + cellRef)}
                        className={`px-2 py-1 text-xs border rounded hover:bg-blue-50 hover:border-blue-300 ${
                          isTargetCell 
                            ? 'bg-amber-200 border-amber-400 text-amber-800 font-bold ring-2 ring-amber-300' 
                            : 'bg-white border-gray-200'
                        }`}
                        title={isTargetCell ? `Bu hücreye (${cellRef}) formül eklenecek!` : `${cellRef} hücresini formüle ekle`}
                      >
                        {cellRef}
                      </button>
                    );
                  })
                ).flat()}
              </div>
              <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-200 border border-amber-400 rounded"></span>
                <span>{targetCellCoordinate} = Formül eklenecek hedef hücre ({sourceColumnName})</span>
              </p>
            </div>

            {/* Hızlı Fonksiyonlar */}
            <div>
              <label className="text-sm font-medium mb-2 block">Hızlı Fonksiyonlar</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'SUM', desc: 'Topla', template: 'SUM(A1:A10)' },
                  { name: 'AVG', desc: 'Ortalama', template: 'AVG(A1:A10)' },
                  { name: 'COUNT', desc: 'Say', template: 'COUNT(A1:A10)' },
                  { name: 'MIN', desc: 'Minimum', template: 'MIN(A1:A10)' },
                  { name: 'MAX', desc: 'Maksimum', template: 'MAX(A1:A10)' },
                  { name: 'IF', desc: 'Koşul', template: 'IF(A1>10,"Yüksek","Düşük")' },
                ].map(func => (
                  <button
                    key={func.name}
                    onClick={() => setFormula(prev => prev + func.template)}
                    className="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                    title={func.desc}
                  >
                    {func.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Önizleme */}
            {formula && (
              <div className={`border rounded-lg p-3 ${formulaError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className={`text-sm ${formulaError ? 'text-red-800' : 'text-green-800'}`}>
                  <strong>Formül:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{formula}</code>
                </p>
                {formulaPreview && !formulaError && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>Önizleme Sonuç:</strong> <span className="font-mono bg-white px-2 py-1 rounded">{formulaPreview}</span>
                  </p>
                )}
                {formulaError && (
                  <p className="text-sm text-red-700 mt-1">
                    <strong>❌ Hata:</strong> {formulaError}
                  </p>
                )}
              </div>
            )}

            {/* Yardım */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Formül Örnekleri</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li><code>=A1+B2</code> - İki hücreyi topla</li>
                <li><code>=A1*2.5</code> - Hücreyi sayıyla çarp</li>
                <li><code>=SUM(A1:A10)</code> - Aralığı topla</li>
                <li><code>=AVG(A1,B2,C3)</code> - Seçili hücrelerin ortalaması</li>
                <li><code>=IF(A1&gt;100,"Yüksek","Düşük")</code> - Koşullu değer</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Satır Silme Onayı */
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[60vh]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  🗑️
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-2">Satır Silme Uyarısı</h3>
                  <p className="text-sm text-red-800 mb-3">
                    Bu işlem <strong>geri alınamaz</strong>. Seçilen satırdaki tüm veriler kalıcı olarak silinecektir.
                  </p>
                  <div className="bg-red-100 rounded p-3">
                    <p className="text-xs text-red-700 font-medium">
                      ⚠️ Bu satırla bağlantılı olan diğer hücreler de etkilenebilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => { onClose(); resetSelections(); }}>
            İptal
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSelections}>
              Temizle
            </Button>
            {modalMode === 'link' ? (
              <Button 
                onClick={handleCreateLink}
                disabled={!selectedRow || !selectedField || createLinkMutation.isPending}
              >
                {createLinkMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Bağlantı Oluştur
              </Button>
            ) : modalMode === 'currency' ? (
              <Button 
                onClick={() => changeCurrencyMutation.mutate(selectedCurrency)}
                disabled={changeCurrencyMutation.isPending}
              >
                {changeCurrencyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Para Birimi Değiştir
              </Button>
            ) : modalMode === 'formula' ? (
              <Button 
                onClick={() => saveFormulaMutation.mutate({ formula })}
                disabled={!formula || !formula.trim() || !!formulaError || saveFormulaMutation.isPending}
              >
                {saveFormulaMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                🧮 Formülü Kaydet
              </Button>
            ) : (
              <Button 
                variant="destructive"
                onClick={() => deleteRowMutation.mutate()}
                disabled={deleteRowMutation.isPending}
              >
                {deleteRowMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Satırı Sil
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}