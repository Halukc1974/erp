import AppLayout from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HardHat, Clock, DollarSign, Users } from "lucide-react";
import DynamicTabulator from "@/components/ui/dynamic-tabulator";

export default function Subcontractors() {
  // Subcontractor timesheets table ID
  const TIMESHEETS_TABLE_ID = "5f26129c-6868-44ad-a250-502a8bd39421";

  return (
    <AppLayout title="Taşeron Puantaj" subtitle="Taşeron çalışan puantaj takibi">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-active-contractors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="text-primary" />
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Aktif</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">{subcontractors?.length || 0}</h3>
                <p className="text-gray-600 text-sm">Aktif Taşeron</p>
              </CardContent>
            </Card>

            <Card data-testid="card-monthly-hours">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Clock className="text-warning" />
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">Bu Ay</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">1,247</h3>
                <p className="text-gray-600 text-sm">Toplam Saat</p>
              </CardContent>
            </Card>

            <Card data-testid="card-monthly-cost">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-error" />
                  </div>
                  <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">-3.2%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">₺234,670</h3>
                <p className="text-gray-600 text-sm">Aylık Maliyet</p>
              </CardContent>
            </Card>

            <Card data-testid="card-pending-approvals">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <HardHat className="text-success" />
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">Bekliyor</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">8</h3>
                <p className="text-gray-600 text-sm">Onay Bekleyen</p>
              </CardContent>
            </Card>
          </div>



          {/* Time Sheets Table */}
          <Card data-testid="card-time-sheets">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Puantaj Kayıtları</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={TIMESHEETS_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>
    </AppLayout>
  );
}
