import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Activity, Target, Monitor } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function Operations() {
  const OPERATIONS_TABLE_ID = "cbff0019-220d-4aad-a1ad-f503da2bd838";

  return (
    <AppLayout title="Operasyon" subtitle="Operasyonel süreçler ve takip">
      <Card data-testid="card-operations">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Operasyon Kayıtları</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicTabulator 
            tableId={OPERATIONS_TABLE_ID}
            onCellEdit={(id, field, value) => {
              console.log('Cell edited:', { id, field, value });
            }}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}