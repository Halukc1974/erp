import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Book, CreditCard } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function Accounting() {
  // General Accounting table ID (created in database)
  const GENERAL_ACCOUNTING_TABLE_ID = "d4ddfe9d-a0dd-4318-88a9-bba1f9ad3a45";

  return (
    <AppLayout title="Genel Muhasebe" subtitle="Yevmiye kayıtları ve hesap hareketleri">


          {/* Journal Entries Table */}
          <Card data-testid="card-journal-entries">
            <CardHeader>
 
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={GENERAL_ACCOUNTING_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>

          {/* Account Balances Summary */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-asset-accounts">
              <CardHeader>
                <CardTitle>Aktif Hesaplar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">100 - Kasa</span>
                    <span className="font-mono text-sm">₺125,430</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">102 - Bankalar</span>
                    <span className="font-mono text-sm">₺2,347,890</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">120 - Alacak Senetleri</span>
                    <span className="font-mono text-sm">₺456,230</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">136 - Diğer Ticari Alacaklar</span>
                    <span className="font-mono text-sm">₺789,120</span>
                  </div>
                  <div className="flex justify-between items-center py-2 font-semibold border-t-2">
                    <span className="text-sm">Toplam Aktif</span>
                    <span className="font-mono text-sm">₺3,718,670</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-liability-accounts">
              <CardHeader>
                <CardTitle>Pasif Hesaplar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">320 - Borç Senetleri</span>
                    <span className="font-mono text-sm">₺234,560</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">336 - Diğer Ticari Borçlar</span>
                    <span className="font-mono text-sm">₺567,890</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">500 - Sermaye</span>
                    <span className="font-mono text-sm">₺1,500,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">540 - Dönem Net Karı</span>
                    <span className="font-mono text-sm">₺1,416,220</span>
                  </div>
                  <div className="flex justify-between items-center py-2 font-semibold border-t-2">
                    <span className="text-sm">Toplam Pasif</span>
                    <span className="font-mono text-sm">₺3,718,670</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
    </AppLayout>
  );
}
