import AppLayout from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Package, FileText, Users } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function Purchases() {
  // Purchase Orders table ID
  const PURCHASE_ORDERS_TABLE_ID = "bf2b5389-588a-436a-97b8-c35513b2c3b1";

  return (
    <AppLayout title="Satın Alma Yönetimi" subtitle="Siparişler, tedarikçiler ve alım süreçleri">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-total-orders">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="text-primary" />
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Bu Ay</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">47</h3>
                <p className="text-gray-600 text-sm">Toplam Sipariş</p>
              </CardContent>
            </Card>

            <Card data-testid="card-pending-orders">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Package className="text-warning" />
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">Bekliyor</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">12</h3>
                <p className="text-gray-600 text-sm">Bekleyen Sipariş</p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-suppliers">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <Users className="text-success" />
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">Aktif</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">23</h3>
                <p className="text-gray-600 text-sm">Tedarikçi</p>
              </CardContent>
            </Card>

            <Card data-testid="card-monthly-spending">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-error" />
                  </div>
                  <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">-8.3%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">₺1,234,500</h3>
                <p className="text-gray-600 text-sm">Aylık Harcama</p>
              </CardContent>
            </Card>
          </div>



          {/* Purchase Orders Table */}
          <Card data-testid="card-purchase-orders">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Satın Alma Siparişleri</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={PURCHASE_ORDERS_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>
    </AppLayout>
  );
}
