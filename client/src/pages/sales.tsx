import AppLayout from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, FileText, Target } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function Sales() {
  // Sales table ID
  const SALES_TABLE_ID = "027c5818-a204-406d-8775-d16405f42941";

  return (
    <AppLayout title="Ticaret & Satış" subtitle="Satış siparişleri ve müşteri işlemleri">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-monthly-sales">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-success" />
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">+15.2%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">₺2,847,500</h3>
                <p className="text-gray-600 text-sm">Aylık Satış</p>
              </CardContent>
            </Card>

            <Card data-testid="card-active-orders">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Target className="text-warning" />
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">Aktif</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">34</h3>
                <p className="text-gray-600 text-sm">Aktif Sipariş</p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-customers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary" />
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Kayıtlı</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">156</h3>
                <p className="text-gray-600 text-sm">Müşteri</p>
              </CardContent>
            </Card>

            <Card data-testid="card-conversion-rate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-error" />
                  </div>
                  <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">+2.8%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">68.4%</h3>
                <p className="text-gray-600 text-sm">Dönüşüm Oranı</p>
              </CardContent>
            </Card>
          </div>



          {/* Sales Orders Table */}
          <Card data-testid="card-sales-orders">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Satış Siparişleri</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={SALES_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>
    </AppLayout>
  );
}
