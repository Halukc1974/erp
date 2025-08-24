import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Archive, Search } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function Documents() {
  const DOCUMENTS_TABLE_ID = "82b94d6f-4c1a-4e8d-9f2a-e8c5b7a3d1f6";

  return (
    <AppLayout title="Belge Yönetimi" subtitle="Elektronik belge arşivi">
      <Card data-testid="card-documents">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Belge Yönetimi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicTabulator 
            tableId={DOCUMENTS_TABLE_ID}
            onCellEdit={(id, field, value) => {
              console.log('Cell edited:', { id, field, value });
            }}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}