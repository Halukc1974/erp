import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Calendar, FileText, AlertTriangle } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function BankGuarantees() {
  const BANK_GUARANTEES_TABLE_ID = "f6ab0e3f-61da-40df-b98b-eb20b555b564";

  return (
    <AppLayout title="Banka Teminatları" subtitle="Banka teminat belgeleri">


          <Card data-testid="card-bank-guarantees">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Banka Teminatları</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={BANK_GUARANTEES_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>
    </AppLayout>
  );
}