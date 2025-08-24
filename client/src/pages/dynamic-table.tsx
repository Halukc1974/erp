import React from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";
import type { MenuPage, DynamicTable } from "@shared/schema";

export default function DynamicTablePage() {
  // Find the dynamic table by name (derived from URL)
  const { data: tables = [], isLoading: tablesLoading } = useQuery<DynamicTable[]>({
    queryKey: ['/api/dynamic-tables'],
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery<MenuPage[]>({
    queryKey: ['/api/menu-pages'],
  });

  const isLoading = tablesLoading || pagesLoading;

  // Get current path
  const currentPath = window.location.pathname;
  
  // Check if this is a static route that should be handled by specific components
  const staticRoutes = ['/', '/accounting', '/purchases', '/sales', '/subcontractors', '/receivables', '/credits', '/guarantees', '/customers', '/expenses', '/documents'];
  
  if (staticRoutes.includes(currentPath)) {
    return null; // Don't render for static routes
  }

  if (isLoading) {
    return (
      <AppLayout title="Yükleniyor..." subtitle="Sayfa yükleniyor">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AppLayout>
    );
  }

  // Find the page that matches the current URL
  const currentPage = pages.find(page => page.href === currentPath);
  
  if (!currentPage) {
    return (
      <AppLayout title="Sayfa Bulunamadı" subtitle="Bu sayfa henüz yapılandırılmamış">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <p className="text-gray-600">Bu sayfa henüz yapılandırılmamış.</p>
        </div>
      </AppLayout>
    );
  }

  // Find the table associated with this page
  const tableName = currentPath.replace(/^\//, '').replace(/\//g, '_');
  const table = tables.find(t => t.name === tableName);

  if (!table) {
    return (
      <AppLayout title={currentPage.title} subtitle="Bu sayfa için tablo bulunamadı">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{currentPage.title}</h1>
          <p className="text-gray-600">Bu sayfa için tablo bulunamadı.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={currentPage.title} subtitle="Dynamic table">
      <div className="bg-white rounded-lg shadow-sm">
        <DynamicTabulator 
          tableId={table.id}
          onCellEdit={(id, field, value) => {
            console.log('Cell edited:', { id, field, value });
          }}
        />
      </div>
    </AppLayout>
  );
}