import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { dbService } from "../../lib/database";

const sectionFormSchema = z.object({
  title: z.string().min(1, "Bölüm adı gerekli").max(100, "Bölüm adı çok uzun"),
});

type SectionFormData = z.infer<typeof sectionFormSchema>;

interface SectionFormModalProps {
  open: boolean;
  onClose: () => void;
  editingSection?: any | null; // Using any for now to avoid schema import issues
}

export function SectionFormModal({ open, onClose, editingSection }: SectionFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      title: editingSection?.title || "",
    },
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: SectionFormData) => {
      return await dbService.insertData('menu_sections', {
        title: data.title,
        sort_order: 999,
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-sections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-pages'] });
      toast({ title: "Bölüm başarıyla oluşturuldu" });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Bölüm oluşturulamadı", variant: "destructive" });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: SectionFormData) => {
      return await dbService.updateData('menu_sections', editingSection?.id, {
        title: data.title,
      });
    },
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-pages'] });
      toast({ title: "Bölüm başarıyla güncellendi" });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({ title: "Hata", description: "Bölüm güncellenemedi", variant: "destructive" });
    },
  });

  const onSubmit = (data: SectionFormData) => {
    if (editingSection) {
      updateSectionMutation.mutate(data);
    } else {
      createSectionMutation.mutate(data);
    }
  };

  const isLoading = createSectionMutation.isPending || updateSectionMutation.isPending;

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: editingSection?.title || "",
      });
    }
  }, [open, editingSection, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingSection ? "Bölümü Düzenle" : "Yeni Bölüm Oluştur"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bölüm Adı</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Örn: Muhasebe, Satış, İnsan Kaynakları" 
                      data-testid="input-section-title"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="button-save"
              >
                {isLoading ? "Kaydediliyor..." : (editingSection ? "Güncelle" : "Oluştur")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}