import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Book, CreditCard } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function DebtReceivables() {
  const DEBT_RECEIVABLES_TABLE_ID = "f934196b-e041-49e3-91e1-b910a2492d55";

  return (
    <AppLayout title="Borç-Alacak" subtitle="Borç ve alacak hesapları yönetimi">


          {/* Debt Receivables Table */}
          <Card data-testid="card-debt-receivables">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Borç-Alacak Kayıtları</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={DEBT_RECEIVABLES_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>
    </AppLayout>
  );
}