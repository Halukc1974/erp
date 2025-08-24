import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Phone, Mail, TrendingUp } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function CustomerManagement() {
  const CUSTOMER_MANAGEMENT_TABLE_ID = "25fe3811-ed50-4033-81d7-99887e1fa6f0";

  return (
    <AppLayout title="Müşteri Yönetimi" subtitle="Müşteri bilgileri ve ilişkileri">
      <Card data-testid="card-customer-management">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Müşteri Yönetimi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicTabulator 
            tableId={CUSTOMER_MANAGEMENT_TABLE_ID}
            onCellEdit={(id, field, value) => {
              console.log('Cell edited:', { id, field, value });
            }}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}