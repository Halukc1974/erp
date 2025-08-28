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
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error('Create section error:', error);
      toast({ title: "Bölüm oluşturulurken hata oluştu", variant: "destructive" });
    }
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: SectionFormData) => {
      return await dbService.updateData('menu_sections', editingSection?.id, {
        title: data.title,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-sections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-pages'] });
      toast({ title: "Bölüm başarıyla güncellendi" });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error('Update section error:', error);
      toast({ title: "Bölüm güncellenirken hata oluştu", variant: "destructive" });
    }
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
            {editingSection ? "Bölümü Düzenle" : "Yeni Bölüm Ekle"}
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
                      placeholder="Örn: İnsan Kaynakları" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : editingSection ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
