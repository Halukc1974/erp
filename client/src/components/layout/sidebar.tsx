import React, { useState } from "react";
import { Calculator, Home, Book, ShoppingCart, TrendingUp, Users, HardHat, Building, FileText, BarChart, Plus, Edit, Trash2, FolderPlus } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { MenuContextMenu, useMenuContextMenu } from "@/components/ui/menu-context-menu";
import { PageFormModal } from "@/components/ui/page-form-modal";
import { SectionFormModal } from "@/components/ui/section-form-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MenuSection, MenuPage } from "@shared/schema";

// Helper function to get icon component from string
const getIconComponent = (iconName: string) => {
  const iconComponent = (LucideIcons as any)[iconName];
  return iconComponent || FileText; // Fallback to FileText if icon not found
};

export default function Sidebar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Context menu and modal states
  const { contextMenu, showContextMenu, hideContextMenu } = useMenuContextMenu();
  const [pageFormOpen, setPageFormOpen] = useState(false);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<MenuPage | null>(null);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [contextMenuType, setContextMenuType] = useState<'empty' | 'page' | 'section'>('empty');
  const [contextTarget, setContextTarget] = useState<MenuPage | MenuSection | null>(null);

  // Fetch menu sections and pages from database
  const { data: sections = [], isLoading: sectionsLoading } = useQuery<MenuSection[]>({
    queryKey: ['/api/menu-sections'],
  });

  const { data: pages = [], isLoading: pagesLoading } = useQuery<MenuPage[]>({
    queryKey: ['/api/menu-pages'],
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => apiRequest(`/api/menu-pages/${pageId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-pages'] });
      toast({ title: "Sayfa başarıyla silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Sayfa silinemedi", variant: "destructive" });
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => apiRequest(`/api/menu-sections/${sectionId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-pages'] });
      toast({ title: "Bölüm başarıyla silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Bölüm silinemedi", variant: "destructive" });
    },
  });

  // Context menu handlers
  const handleEmptySpaceRightClick = (event: React.MouseEvent) => {
    setContextMenuType('empty');
    setContextTarget(null);
    showContextMenu(event);
  };

  const handlePageRightClick = (event: React.MouseEvent, page: MenuPage) => {
    setContextMenuType('page');
    setContextTarget(page);
    showContextMenu(event);
  };

  const handleSectionRightClick = (event: React.MouseEvent, section: MenuSection) => {
    setContextMenuType('section');
    setContextTarget(section);
    showContextMenu(event);
  };

  // Context menu options
  const getContextMenuOptions = () => {
    if (contextMenuType === 'empty') {
      return [
        {
          id: 'new-page',
          label: 'Yeni Sayfa Oluştur',
          icon: Plus,
          onClick: () => {
            setEditingPage(null);
            setPageFormOpen(true);
          },
        },
        {
          id: 'new-section',
          label: 'Yeni Bölüm Oluştur',
          icon: FolderPlus,
          onClick: () => {
            setEditingSection(null);
            setSectionFormOpen(true);
          },
        },
      ];
    }

    if (contextMenuType === 'page' && contextTarget) {
      const page = contextTarget as MenuPage;
      return [
        {
          id: 'edit-page',
          label: 'Sayfayı Düzenle',
          icon: Edit,
          onClick: () => {
            setEditingPage(page);
            setPageFormOpen(true);
          },
        },
        {
          id: 'delete-page',
          label: 'Sayfayı Sil',
          icon: Trash2,
          onClick: () => {
            if (window.confirm(`"${page.title}" sayfasını silmek istediğinizden emin misiniz?`)) {
              deletePageMutation.mutate(page.id);
            }
          },
        },
      ];
    }

    if (contextMenuType === 'section' && contextTarget) {
      const section = contextTarget as MenuSection;
      return [
        {
          id: 'edit-section',
          label: 'Bölümü Düzenle',
          icon: Edit,
          onClick: () => {
            setEditingSection(section);
            setSectionFormOpen(true);
          },
        },
        {
          id: 'delete-section',
          label: 'Bölümü Sil',
          icon: Trash2,
          onClick: () => {
            if (window.confirm(`"${section.title}" bölümünü silmek istediğinizden emin misiniz? Bu bölümdeki tüm sayfalar da silinecek.`)) {
              deleteSectionMutation.mutate(section.id);
            }
          },
        },
      ];
    }

    return [];
  };

  // Group pages by section and create dynamic menu structure
  const menuItems = React.useMemo(() => {
    if (sectionsLoading || pagesLoading) return [];

    interface MenuItem {
      title: string;
      href?: string;
      icon?: React.ComponentType<any>;
      active?: boolean;
      pageData?: MenuPage;
      sectionData?: MenuSection;
      items?: MenuItem[];
    }

    const items: MenuItem[] = [];
    
    // Add standalone pages (pages without section)
    const standalonePages = pages.filter(page => !page.sectionId);
    standalonePages.forEach(page => {
      const IconComponent = getIconComponent(page.icon || 'FileText');
      items.push({
        title: page.title,
        href: page.href,
        icon: IconComponent,
        active: location === page.href,
        pageData: page, // Add page data for context menu
      });
    });

    // Add sections with their pages (including empty sections)
    sections.forEach(section => {
      const sectionPages = pages.filter(page => page.sectionId === section.id);
      items.push({
        title: section.title,
        sectionData: section, // Add section data for context menu
        items: sectionPages.map(page => {
          const IconComponent = getIconComponent(page.icon || 'FileText');
          return {
            title: page.title,
            href: page.href,
            icon: IconComponent,
            active: location === page.href,
            pageData: page, // Add page data for context menu
          };
        }),
      });
    });

    return items;
  }, [sections, pages, location, sectionsLoading, pagesLoading]);

  const isLoading = sectionsLoading || pagesLoading;

  return (
    <aside className="w-80 bg-white shadow-lg flex flex-col" data-testid="sidebar">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Muhasebe ERP</h1>
            <p className="text-sm text-gray-500">v3.0 Tiger Edition</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Users className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Mali Müşavir</p>
            <p className="text-xs text-gray-500">Yönetici</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav 
        className="flex-1 py-4"
        onContextMenu={handleEmptySpaceRightClick}
      >
        {isLoading ? (
          <div className="px-4 space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="px-4 mb-6">
            {section.href ? (
              // Single menu item
              <Link href={section.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 rounded-lg p-3 font-medium transition-colors cursor-pointer",
                    section.active
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  )}
                  data-testid={`nav-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onContextMenu={(e) => {
                    if (section.pageData) {
                      handlePageRightClick(e, section.pageData);
                    }
                  }}
                >
                  {section.icon && <section.icon className="w-5 h-5" />}
                  <span>{section.title}</span>
                </div>
              </Link>
            ) : (
              // Section with items
              <>
                <h3 
                  className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                  onContextMenu={(e) => {
                    if (section.sectionData) {
                      handleSectionRightClick(e, section.sectionData);
                    }
                  }}
                >
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items?.map((item: any, itemIndex: number) => (
                    <Link key={itemIndex} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 rounded-lg p-3 transition-colors cursor-pointer",
                          item.active
                            ? "text-primary bg-primary/10"
                            : "text-gray-700 hover:text-primary hover:bg-gray-100"
                        )}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                        onContextMenu={(e) => {
                          if (item.pageData) {
                            handlePageRightClick(e, item.pageData);
                          }
                        }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        ))
        )}
      </nav>

      {/* Context Menu */}
      <MenuContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        options={getContextMenuOptions()}
        onClose={hideContextMenu}
      />

      {/* Page Form Modal */}
      <PageFormModal
        open={pageFormOpen}
        onClose={() => {
          setPageFormOpen(false);
          setEditingPage(null);
        }}
        sections={sections}
        editingPage={editingPage}
      />

      {/* Section Form Modal */}
      <SectionFormModal
        open={sectionFormOpen}
        onClose={() => {
          setSectionFormOpen(false);
          setEditingSection(null);
        }}
        editingSection={editingSection}
      />

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Supabase bağlantısı aktif</span>
          <div className="w-2 h-2 bg-success rounded-full"></div>
        </div>
      </div>
    </aside>
  );
}
