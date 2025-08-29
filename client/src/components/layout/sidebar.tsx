import React, { useState, useMemo } from "react";
import { Calculator, Home, Book, ShoppingCart, TrendingUp, Users, HardHat, Building, FileText, BarChart, Plus, Edit, Trash2, FolderPlus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbService } from "../../lib/database";
import { MenuContextMenu } from '../ui/menu-context-menu';
import { PageFormModal } from '../ui/page-form-modal';
import { SectionFormModal } from '../ui/section-form-modal';
import { useToast } from '../../hooks/use-toast';

// Helper function to get icon component from string
const getIconComponent = (iconName: string) => {
  const iconComponent = (LucideIcons as any)[iconName];
  return iconComponent || FileText; // Fallback to FileText if icon not found
};

// Simple interfaces for menu data
interface MenuSection {
  id: string;
  title: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuPage {
  id: string;
  title: string;
  href: string;
  icon: string;
  section_id?: string;
  sort_order: number;
  is_active: boolean;
}

interface MenuItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<any>;
  active?: boolean;
  items?: MenuItem[];
}

export function Sidebar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modal states
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<MenuPage | null>(null);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);

  // Context menu state
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuType, setContextMenuType] = useState<'section' | 'page' | 'empty' | null>(null);
  const [contextMenuData, setContextMenuData] = useState<any>(null);

  // Fetch menu sections and pages from Supabase with timeout
  const { data: sections = [], isLoading: sectionsLoading, isError: sectionsError } = useQuery<MenuSection[]>({
    queryKey: ['menu-sections'],
    queryFn: async () => {
      console.log('🔄 Fetching menu sections from Supabase...');
      try {
        const data = await dbService.fetchTable('menu_sections', { 
          order: 'sort_order', 
          filter: 'is_active=true',
          timeout: 2000 // 2 second timeout
        });
        console.log('✅ Menu sections loaded:', data);
        return data || [];
      } catch (error) {
        console.error('❌ Error loading menu sections:', error);
        throw error; // Re-throw to trigger error state
      }
    },
    retry: 2, // Only retry 2 times
    retryDelay: 1000, // 1 second delay between retries
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const { data: pages = [], isLoading: pagesLoading, isError: pagesError } = useQuery<MenuPage[]>({
    queryKey: ['menu-pages'],
    queryFn: async () => {
      console.log('🔄 Fetching menu pages from Supabase...');
      try {
        const data = await dbService.fetchTable('menu_pages', { 
          order: 'sort_order', 
          filter: 'is_active=true',
          timeout: 2000 // 2 second timeout
        });
        console.log('✅ Menu pages loaded:', data);
        return data || [];
      } catch (error) {
        console.error('❌ Error loading menu pages:', error);
        throw error; // Re-throw to trigger error state
      }
    },
    retry: 2, // Only retry 2 times
    retryDelay: 1000, // 1 second delay between retries
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Mutations for CRUD operations
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      await dbService.deleteData('menu_sections', sectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-sections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-pages'] });
      toast({ title: "Bölüm başarıyla silindi" });
    },
    onError: (error) => {
      console.error('Delete section error:', error);
      toast({ title: "Bölüm silinirken hata oluştu", variant: "destructive" });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      await dbService.deleteData('menu_pages', pageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-pages'] });
      toast({ title: "Sayfa başarıyla silindi" });
    },
    onError: (error) => {
      console.error('Delete page error:', error);
      toast({ title: "Sayfa silinirken hata oluştu", variant: "destructive" });
    }
  });

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, type: 'section' | 'page' | 'empty', data?: any) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuType(type);
    setContextMenuData(data);
  };

  const handleCloseContextMenu = () => {
    setContextMenuPosition(null);
    setContextMenuType(null);
    setContextMenuData(null);
  };

  const handleContextMenuAction = (action: string) => {
    switch (action) {
      case 'add-section':
        setSectionModalOpen(true);
        setEditingSection(null);
        break;
      case 'add-page':
        setPageModalOpen(true);
        setEditingPage(null);
        break;
      case 'edit-section':
        if (contextMenuData) {
          setEditingSection(contextMenuData);
          setSectionModalOpen(true);
        }
        break;
      case 'edit-page':
        if (contextMenuData) {
          setEditingPage(contextMenuData);
          setPageModalOpen(true);
        }
        break;
      case 'delete-section':
        if (contextMenuData && contextMenuData.id) {
          if (confirm('Bu bölümü silmek istediğinizden emin misiniz?')) {
            deleteSectionMutation.mutate(contextMenuData.id);
          }
        }
        break;
      case 'delete-page':
        if (contextMenuData && contextMenuData.id) {
          if (confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
            deletePageMutation.mutate(contextMenuData.id);
          }
        }
        break;
    }
    handleCloseContextMenu();
  };

  // Generate context menu options based on type
  const getContextMenuOptions = () => {
    const options: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<any>;
      onClick: () => void;
      disabled?: boolean;
    }> = [];

    switch (contextMenuType) {
      case 'empty':
        options.push(
          {
            id: 'add-section',
            label: 'Yeni Bölüm Ekle',
            icon: FolderPlus,
            onClick: () => handleContextMenuAction('add-section')
          },
          {
            id: 'add-page',
            label: 'Yeni Sayfa Ekle',
            icon: Plus,
            onClick: () => handleContextMenuAction('add-page')
          }
        );
        break;
      case 'section':
        options.push(
          {
            id: 'edit-section',
            label: 'Bölümü Düzenle',
            icon: Edit,
            onClick: () => handleContextMenuAction('edit-section')
          },
          {
            id: 'add-page',
            label: 'Bu Bölüme Sayfa Ekle',
            icon: Plus,
            onClick: () => handleContextMenuAction('add-page')
          },
          {
            id: 'delete-section',
            label: 'Bölümü Sil',
            icon: Trash2,
            onClick: () => handleContextMenuAction('delete-section')
          }
        );
        break;
      case 'page':
        options.push(
          {
            id: 'edit-page',
            label: 'Sayfayı Düzenle',
            icon: Edit,
            onClick: () => handleContextMenuAction('edit-page')
          },
          {
            id: 'delete-page',
            label: 'Sayfayı Sil',
            icon: Trash2,
            onClick: () => handleContextMenuAction('delete-page')
          }
        );
        break;
    }

    return options;
  };

  // Fallback menu when Supabase data is not available
  const fallbackMenuItems: MenuItem[] = [
    { title: "Ana Sayfa", href: "/", icon: Home, active: location === "/" },
    {
      title: "İnsan Kaynakları",
      items: [
        { title: "Çalışanlar", href: "/calisanlar", icon: Users, active: location === "/calisanlar" },
        { title: "Puantaj", href: "/puantaj", icon: Calculator, active: location === "/puantaj" }
      ]
    },
    {
      title: "Satış",
      items: [
        { title: "Müşteriler", href: "/musteriler", icon: Users, active: location === "/musteriler" },
        { title: "Satış Siparişleri", href: "/satis-siparisleri", icon: ShoppingCart, active: location === "/satis-siparisleri" }
      ]
    },
    {
      title: "Satın Alma", 
      items: [
        { title: "Tedarikçiler", href: "/tedarikciler", icon: Building, active: location === "/tedarikciler" },
        { title: "Satın Alma Siparişleri", href: "/satin-alma-siparisleri", icon: ShoppingCart, active: location === "/satin-alma-siparisleri" }
      ]
    },
    {
      title: "Proje Yönetimi",
      items: [
        { title: "Projeler", href: "/projeler", icon: HardHat, active: location === "/projeler" },
        { title: "Görevler", href: "/gorevler", icon: FileText, active: location === "/gorevler" }
      ]
    },
    {
      title: "Muhasebe",
      items: [
        { title: "Hesap Planı", href: "/hesap-plani", icon: Book, active: location === "/hesap-plani" },
        { title: "Yevmiye Kayıtları", href: "/yevmiye", icon: FileText, active: location === "/yevmiye" }
      ]
    },
    {
      title: "Dinamik Tablolar",
      items: [
        { title: "Tablo Yönetimi", href: "/tablo-yonetimi", icon: BarChart, active: location === "/tablo-yonetimi" }
      ]
    }
  ];

  // Group pages by section and create dynamic menu structure
  const menuItems = useMemo(() => {
    // If there are errors or taking too long, use fallback immediately
    if (sectionsError || pagesError) {
      console.log('⚠️ Supabase error detected, using fallback menu');
      return fallbackMenuItems;
    }
    
    // If loading takes more than reasonable time, show fallback
    if ((sectionsLoading || pagesLoading)) {
      // For very first load, show loading - but timeout quickly
      return fallbackMenuItems;
    }
    
    // If we have empty data from successful query, use fallback
    if ((!sectionsLoading && !pagesLoading) && sections.length === 0 && pages.length === 0) {
      console.log('⚠️ No menu data from Supabase, using fallback menu');
      return fallbackMenuItems;
    }

    // If we have data, use it
    if (sections.length > 0 || pages.length > 0) {
      console.log('✅ Using Supabase menu data:', { sections: sections.length, pages: pages.length });
    }

    const items: MenuItem[] = [];
    
    // Add standalone pages (pages without section)
    const standalonePages = pages.filter(page => !page.section_id);
    standalonePages.forEach(page => {
      const IconComponent = getIconComponent(page.icon || 'FileText');
      items.push({
        title: page.title,
        href: page.href,
        icon: IconComponent,
        active: location === page.href,
      });
    });

    // Add sections with their pages
    sections.forEach(section => {
      const sectionPages = pages.filter(page => page.section_id === section.id);
      items.push({
        title: section.title,
        items: sectionPages.map(page => {
          const IconComponent = getIconComponent(page.icon || 'FileText');
          return {
            title: page.title,
            href: page.href,
            icon: IconComponent,
            active: location === page.href,
          };
        }),
      });
    });

    return items;
  }, [sections, pages, location, sectionsLoading, pagesLoading, sectionsError, pagesError]);

  // Only show loading for very brief moment - prefer showing menu quickly
  const isLoading = false; // Always show menu immediately

  // CSS utility function (simple version without external dependency)
  const cn = (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">ERP System</h2>
        <p className="text-sm text-gray-600">Yönetim Paneli</p>
      </div>

      {/* Navigation */}
      <nav 
        className="flex-1 overflow-y-auto py-4"
        onContextMenu={(e) => handleContextMenu(e, 'empty')}
      >
        {isLoading ? (
          <div className="px-4">
            <div className="animate-pulse space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          menuItems.map((section, sectionIndex) => {
            // Find original section and page data for context menu
            const originalSection = sections.find(s => s.title === section.title);
            const originalPage = pages.find(p => p.title === section.title && p.href === section.href);
            
            return (
              <div key={sectionIndex} className="px-4 mb-6">
                {section.href ? (
                  // Single menu item
                  <Link href={section.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 rounded-lg p-3 font-medium transition-colors cursor-pointer",
                        section.active
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                      )}
                      onContextMenu={(e) => handleContextMenu(e, 'page', originalPage)}
                    >
                      {section.icon && <section.icon className="w-5 h-5" />}
                      <span>{section.title}</span>
                    </div>
                  </Link>
                ) : (
                  // Section with items
                  <>
                    <h3 
                      className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 cursor-pointer hover:text-gray-700"
                      onContextMenu={(e) => handleContextMenu(e, 'section', originalSection)}
                    >
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items?.map((item, itemIndex) => {
                        // Find original page data for context menu
                        const originalPage = pages.find(p => p.title === item.title && p.href === item.href);
                        
                        return (
                          <Link key={itemIndex} href={item.href || '#'}>
                            <div
                              className={cn(
                                "flex items-center space-x-3 rounded-lg p-3 font-medium transition-colors cursor-pointer text-sm",
                                item.active
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                              )}
                              onContextMenu={(e) => handleContextMenu(e, 'page', originalPage)}
                            >
                              {item.icon && <item.icon className="w-4 h-4" />}
                              <span>{item.title}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </nav>      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {isLoading ? 'Menu yükleniyor...' : `${sections.length} bölüm, ${pages.length} sayfa`}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenuPosition && (
        <MenuContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          visible={true}
          options={getContextMenuOptions()}
          onClose={handleCloseContextMenu}
        />
      )}

      {/* Modals */}
      <PageFormModal
        open={pageModalOpen}
        onClose={() => {
          setPageModalOpen(false);
          setEditingPage(null);
        }}
        sections={sections}
        editingPage={editingPage}
      />

      <SectionFormModal
        open={sectionModalOpen}
        onClose={() => {
          setSectionModalOpen(false);
          setEditingSection(null);
        }}
        editingSection={editingSection}
      />
    </aside>
  );
}
