import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { dbService } from "../../lib/database";
import * as LucideIcons from "lucide-react";

// Type definitions
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
  sectionId?: string;
  sort_order: number;
  is_active: boolean;
}

const pageFormSchema = z.object({
  title: z.string().min(1, "Sayfa adı gerekli"),
  href: z.string().min(1, "URL gerekli").regex(/^\//, "URL '/' ile başlamalı"),
  icon: z.string().min(1, "İkon seçimi gerekli"),
  sectionId: z.string().optional(),
  pageType: z.enum(["empty", "table"], { required_error: "Sayfa türü seçimi gerekli" }),
});

type PageFormData = z.infer<typeof pageFormSchema>;

interface PageFormModalProps {
  open: boolean;
  onClose: () => void;
  sections: MenuSection[];
  editingPage?: MenuPage | null;
}

// Popular icons list
const iconOptions = [
  "Home", "Book", "FileText", "BarChart", "ShoppingCart", "TrendingUp", 
  "Users", "HardHat", "Building", "Calculator", "CreditCard", "Briefcase",
  "FolderOpen", "Settings", "PieChart", "Database", "Package", "Truck",
  "Clock", "Calendar", "Mail", "Phone", "MapPin", "Star"
];

export function PageFormModal({ open, onClose, sections, editingPage }: PageFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: editingPage?.title || "",
      href: editingPage?.href || "",
      icon: editingPage?.icon || "FileText",
      sectionId: editingPage?.sectionId || "none",
      pageType: "empty" as const,
    },
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const pageData = {
        title: data.title,
        href: data.href,
        icon: data.icon,
        section_id: data.sectionId === 'none' ? null : data.sectionId,
        sort_order: 999, // Will be handled by backend
        is_active: true,
      };
      
      // Create the page first
      const page = await dbService.insertData('menu_pages', pageData);
      
      // If it's a table page, create a dynamic table for it
      if (data.pageType === 'table') {
        await dbService.insertData('dynamic_tables', {
          name: data.href.replace(/^\//, '').replace(/\//g, '_'), // Convert URL to valid table name
          display_name: data.title,
          description: `${data.title} için dinamik tablo`,
          is_active: true,
        });
      }
      
      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-pages'] });
      queryClient.invalidateQueries({ queryKey: ['menu-sections'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-tables'] });
      toast({ title: "Sayfa başarıyla oluşturuldu" });
      onClose();
      form.reset();
    },
    onError: (error) => {
      console.error('Page creation error:', error);
      toast({ title: "Hata", description: "Sayfa oluşturulamadı", variant: "destructive" });
    },
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      if (!editingPage?.id) throw new Error('No page ID provided');
      
      const updateData = {
        title: data.title,
        href: data.href,
        icon: data.icon,
        section_id: data.sectionId === 'none' ? null : data.sectionId,
      };
      
      return await dbService.updateData('menu_pages', editingPage.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-pages'] });
      queryClient.invalidateQueries({ queryKey: ['menu-sections'] });
      toast({ title: "Sayfa başarıyla güncellendi" });
      onClose();
    },
    onError: (error) => {
      console.error('Page update error:', error);
      toast({ title: "Hata", description: "Sayfa güncellenemedi", variant: "destructive" });
    },
  });

  const onSubmit = (data: PageFormData) => {
    // Convert "none" back to null/undefined for backend
    const processedData = {
      ...data,
      sectionId: data.sectionId === "none" ? undefined : data.sectionId
    };
    
    if (editingPage) {
      updatePageMutation.mutate(processedData);
    } else {
      createPageMutation.mutate(processedData);
    }
  };

  const isLoading = createPageMutation.isPending || updatePageMutation.isPending;

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: editingPage?.title || "",
        href: editingPage?.href || "",
        icon: editingPage?.icon || "FileText",
        sectionId: editingPage?.sectionId || "none",
        pageType: "empty",
      });
    }
  }, [open, editingPage, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPage ? 'Sayfa Düzenle' : 'Yeni Sayfa Oluştur'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sayfa Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: Yeni Raporlar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="href"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Örn: /reports/new" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>İkon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="İkon seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((iconName) => {
                        const IconComponent = (LucideIcons as any)[iconName];
                        return (
                          <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center space-x-2">
                              {IconComponent && <IconComponent className="w-4 h-4" />}
                              <span>{iconName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sayfa Türü</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sayfa türü seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="empty">Boş Sayfa</SelectItem>
                      <SelectItem value="table">Tablo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bölüm (İsteğe bağlı)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bölüm seçin (boş bırakılabilir)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Bağımsız sayfa</SelectItem>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : editingPage ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}