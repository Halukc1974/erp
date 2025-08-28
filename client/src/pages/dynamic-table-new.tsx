import React from "react";
import AppLayout from "../components/layout/app-layout";
import DynamicTabulator from "../components/ui/dynamic-tabulator";

export default function DynamicTablePage() {
  // Get current path
  const currentPath = window.location.pathname;
  
  // Check if this is a static route that should be handled by specific components
  const staticRoutes = ['/', '/accounting', '/purchases', '/sales', '/subcontractors', '/receivables', '/credits', '/guarantees', '/customers', '/expenses', '/documents'];
  
  if (staticRoutes.includes(currentPath)) {
    return null; // Don't render for static routes
  }

  // Fallback configuration for common paths when Supabase is unavailable
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-600 mb-4">Bu sayfa henüz yapılandırılmamış.</p>
          <p className="text-sm text-gray-500">Path: {currentPath}</p>
        </div>
      </AppLayout>
    );
  }
  
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
                CORS Hatası - Supabase Bağlantısı Yok
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Supabase'e erişim CORS policy tarafından engelleniyor. Fallback tablo gösteriliyor.</p>
              </div>
            </div>
          </div>
        </div>
        
        <DynamicTabulator tableId={fallbackPage.tableName} />
      </div>
    </AppLayout>
  );
}
