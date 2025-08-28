import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "../components/layout/app-layout";
import DynamicTabulator from "../components/ui/dynamic-tabulator";
import { dbService } from "../lib/database";

interface MenuPage {
  id: string;
  title: string;
  href: string;
  icon: string;
  section_id?: string;
  sort_order: number;
  is_active: boolean;
}

interface DynamicTable {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
}

export default function DynamicTablePage() {
  const [location] = useLocation();
  const currentPath = window.location.pathname;
  
  // Check if this is a static route that should be handled by specific components
  const staticRoutes = ['/', '/accounting', '/purchases', '/sales', '/subcontractors', '/receivables', '/credits', '/guarantees', '/customers', '/expenses', '/documents'];
  
  if (staticRoutes.includes(currentPath)) {
    return null; // Don't render for static routes
  }

  // Fetch menu page data to see if this is a dynamic table page
  const { data: menuPages, isLoading: menuLoading } = useQuery({
    queryKey: ['menu-pages'],
    queryFn: () => dbService.fetchTable('menu_pages', {
      filter: 'is_active=true',
      order: 'sort_order'
    }),
    staleTime: 30000, // 30 seconds
  });

  // Fetch dynamic tables
  const { data: dynamicTables, isLoading: tablesLoading } = useQuery({
    queryKey: ['dynamic-tables'], 
    queryFn: () => dbService.fetchTable('dynamic_tables', {
      filter: 'is_active=true'
    }),
    staleTime: 30000,
  });

  // Find the current page
  const currentPage = menuPages?.find((page: MenuPage) => page.href === currentPath);
  
  // If we found a page, check if it has a corresponding dynamic table
  let dynamicTable: DynamicTable | undefined;
  
  if (currentPage && dynamicTables) {
    // Look for dynamic table by converting the page URL to table name
    const tableName = currentPath.replace(/^\//, '').replace(/\//g, '_');
    dynamicTable = dynamicTables.find((table: DynamicTable) => table.name === tableName);
  }

  // Loading state
  if (menuLoading || tablesLoading) {
    return (
      <AppLayout title="Yükleniyor..." subtitle="Sayfa verileri getiriliyor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  // If we found a page but no dynamic table, show empty page message
  if (currentPage && !dynamicTable) {
    return (
      <AppLayout title={currentPage.title} subtitle="Boş Sayfa">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentPage.title}</h1>
          <p className="text-gray-600 mb-4">Bu sayfa henüz içerik ile doldurulmamış.</p>
          <p className="text-sm text-gray-500">Sayfa türü: Boş Sayfa</p>
        </div>
      </AppLayout>
    );
  }

  // If we found both page and dynamic table, show the table
  if (currentPage && dynamicTable) {
    return (
      <AppLayout title={dynamicTable.display_name} subtitle={dynamicTable.description || `${currentPage.title} tablosu`}>
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Dinamik Tablo Aktif
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Bu sayfa için dinamik tablo sistemi başarıyla yüklendi.</p>
                </div>
              </div>
            </div>
          </div>
          
          <DynamicTabulator tableId={dynamicTable.name} />
        </div>
      </AppLayout>
    );
  }

  // Fallback for unknown paths - keep the original fallback system
  const fallbackPages: { [key: string]: { title: string; tableName: string; description: string } } = {
    '/projeler': {
      title: 'Projeler',
      tableName: 'projects',
      description: 'Proje yönetimi ve takip sistemi'
    },
    '/musteriler': {
      title: 'Müşteriler',
      tableName: 'customers', 
      description: 'Müşteri bilgileri ve iletişim detayları'
    },
    '/tedarikciler': {
      title: 'Tedarikçiler',
      tableName: 'suppliers',
      description: 'Tedarikçi bilgileri ve satın alma kayıtları'
    },
    '/calisanlar': {
      title: 'Çalışanlar',
      tableName: 'employees',
      description: 'Personel bilgileri ve bordro sistemi'
    },
    '/puantaj': {
      title: 'Puantaj',
      tableName: 'attendance',
      description: 'Çalışan puantaj ve vardiya takibi'
    }
  };
  
  const fallbackPage = fallbackPages[currentPath];
  
  if (!fallbackPage) {
    return (
      <AppLayout title="Sayfa Bulunamadı" subtitle="Bu sayfa henüz yapılandırılmamış">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Bu sayfa henüz yapılandırılmamış.</p>
          <p className="text-sm text-gray-500">Path: {currentPath}</p>
        </div>
      </AppLayout>
    );
  }

  // Show fallback page with warning
  return (
    <AppLayout title={fallbackPage.title} subtitle={fallbackPage.description}>
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Fallback Tablo Gösteriliyor
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Bu sayfa menu sisteminde bulunamadı. Fallback tablo gösteriliyor.</p>
              </div>
            </div>
          </div>
        </div>
        
        <DynamicTabulator tableId={fallbackPage.tableName} />
      </div>
    </AppLayout>
  );
}
