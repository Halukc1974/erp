import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, TrendingUp, FileText, AlertCircle } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function CreditManagement() {
  const CREDIT_MANAGEMENT_TABLE_ID = "57e10c2b-c236-4de8-912f-61b8e74793dd";

  return (
    <AppLayout title="Kredi Yönetimi" subtitle="Kredi işlemleri ve yönetimi">
      <Card data-testid="card-credit-management">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kredi Yönetimi Kayıtları</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicTabulator 
            tableId={CREDIT_MANAGEMENT_TABLE_ID}
            onCellEdit={(id, field, value) => {
              console.log('Cell edited:', { id, field, value });
            }}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}