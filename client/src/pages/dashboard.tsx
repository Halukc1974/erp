import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Wallet, DollarSign, Receipt, CreditCard, Clock, BarChart } from "lucide-react";
import RevenueChart from "@/components/charts/revenue-chart";
import ExpenseChart from "@/components/charts/expense-chart";
import DataTable from "@/components/ui/data-table";

export default function Dashboard() {
  const { data: metrics = {} } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ["/api/dashboard/recent-transactions"],
  });

  const formatCurrency = (amount: number, currency = "TRY") => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
    return `${symbol}${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <AppLayout title="Dashboard" subtitle="İşletme performans özeti">
      {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-revenue">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <ArrowUp className="text-success" />
                  </div>
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">+12.5%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">
                  {formatCurrency((metrics as any)?.totalRevenue || 0)}
                </h3>
                <p className="text-gray-600 text-sm">Toplam Gelir</p>
              </CardContent>
            </Card>

            <Card data-testid="card-expenses">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                    <ArrowDown className="text-error" />
                  </div>
                  <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">-5.2%</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">
                  {formatCurrency((metrics as any)?.totalExpenses || 0)}
                </h3>
                <p className="text-gray-600 text-sm">Toplam Gider</p>
              </CardContent>
            </Card>

            <Card data-testid="card-cashflow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wallet className="text-primary" />
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">Sabit</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">
                  {formatCurrency((metrics as any)?.cashFlow || 0)}
                </h3>
                <p className="text-gray-600 text-sm">Nakit Akışı</p>
              </CardContent>
            </Card>

            <Card data-testid="card-pending-invoices">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-accent" />
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">23 Bekliyor</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-mono">
                  {formatCurrency((metrics as any)?.pendingInvoices || 0)}
                </h3>
                <p className="text-gray-600 text-sm">Bekleyen Faturalar</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2" data-testid="card-revenue-chart">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aylık Gelir Analizi</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="bg-primary text-white">2024</Button>
                    <Button variant="outline" size="sm">2023</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <RevenueChart />
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card data-testid="card-expense-breakdown">
              <CardHeader>
                <CardTitle>Gider Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm text-gray-700">Personel</span>
                    </div>
                    <span className="text-sm font-mono">₺892,400</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <span className="text-sm text-gray-700">Malzeme</span>
                    </div>
                    <span className="text-sm font-mono">₺634,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <span className="text-sm text-gray-700">Kira & Genel</span>
                    </div>
                    <span className="text-sm font-mono">₺396,600</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-error rounded-full"></div>
                      <span className="text-sm text-gray-700">Diğer</span>
                    </div>
                    <span className="text-sm font-mono">₺156,200</span>
                  </div>
                </div>
                <div className="h-32">
                  <ExpenseChart />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Table */}
          <Card data-testid="card-transactions-table">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Son İşlemler</CardTitle>
                <div className="flex items-center space-x-3">
                  <Button size="sm" data-testid="button-new-transaction">
                    Yeni İşlem
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable data={recentTransactions as any[]} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start space-y-3 text-left bg-white hover:bg-gray-50"
              data-testid="button-create-invoice"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Receipt className="text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Fatura Oluştur</h4>
                <p className="text-sm text-gray-600">Yeni satış faturası düzenle</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start space-y-3 text-left bg-white hover:bg-gray-50"
              data-testid="button-record-payment"
            >
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CreditCard className="text-success" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Ödeme Kaydet</h4>
                <p className="text-sm text-gray-600">Alınan/verilen ödeme girişi</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start space-y-3 text-left bg-white hover:bg-gray-50"
              data-testid="button-timesheet"
            >
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="text-warning" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Puantaj Gir</h4>
                <p className="text-sm text-gray-600">Taşeron çalışma saatleri</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start space-y-3 text-left bg-white hover:bg-gray-50"
              data-testid="button-create-report"
            >
              <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                <BarChart className="text-error" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Rapor Oluştur</h4>
                <p className="text-sm text-gray-600">Mali durum raporu</p>
              </div>
            </Button>
          </div>
    </AppLayout>
  );
}
