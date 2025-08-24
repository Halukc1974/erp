import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Truck, ClipboardList, BarChart3 } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function OrderManagement() {
  const ORDER_MANAGEMENT_TABLE_ID = "bdfbc90c-e415-4587-a1bd-6d759ee4dbd8";

  return (
    <AppLayout title="Sipariş Yönetimi" subtitle="Sipariş takip ve yönetimi">
      <Card data-testid="card-order-management">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sipariş Yönetimi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicTabulator 
            tableId={ORDER_MANAGEMENT_TABLE_ID}
            onCellEdit={(id, field, value) => {
              console.log('Cell edited:', { id, field, value });
            }}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}