import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import AppLayout from "../components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowUp, ArrowDown, Wallet, DollarSign, Receipt, CreditCard, Clock, BarChart } from "lucide-react";
import RevenueChart from "../components/charts/revenue-chart";
import ExpenseChart from "../components/charts/expense-chart";
import DataTable from "../components/ui/data-table";
import { dbService } from "../lib/database"; // Supabase REST API

export default function Dashboard() {
  // Test database connection on mount
  useEffect(() => {
    const testDB = async () => {
      console.log('=== DATABASE CONNECTION TEST ===');
      console.log('Testing database connection...');
      const isConnected = await dbService.testConnection();
      console.log('Database connection test result:', isConnected);
      
      if (!isConnected) {
        console.log('Connection failed, getting available tables...');
        const tables = await dbService.getAvailableTables();
        console.log('Available tables:', tables);
        
        // Try basic Supabase endpoint
        try {
          console.log('Testing basic Supabase endpoint...');
          const response = await fetch('https://xtsczsqpetyumpkawiwl.supabase.co/rest/v1/', {
            method: 'GET',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c2N6c3FwZXR5dW1wa2F3aXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk4NDMsImV4cCI6MjA3MDcyNTg0M30.tEbu8QHtWQM00zLpkt5IuOwpeo61cn7LJ0N8fR6FCU4',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0c2N6c3FwZXR5dW1wa2F3aXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDk4NDMsImV4cCI6MjA3MDcyNTg0M30.tEbu8QHtWQM00zLpkt5IuOwpeo61cn7LJ0N8fR6FCU4'
            }
          });
          console.log('Basic endpoint response:', response.status, response.ok);
          const text = await response.text();
          console.log('Response text (first 500 chars):', text.substring(0, 500));
        } catch (endpointError) {
          console.error('Basic endpoint test error:', endpointError);
        }
      }
      console.log('=== END DATABASE TEST ===');
    };
    testDB();
  }, []);

  // Fetch real data from Supabase PostgreSQL
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      try {
        // Try backend first (if available)
        const response = await fetch('/api/database/dashboard-stats');
        if (response.ok) {
          return await response.json();
        }
        
        // Fallback to Supabase REST API
        return await dbService.getDashboardMetrics();
      } catch (error) {
        console.log('Using Supabase REST API fallback');
        return await dbService.getDashboardMetrics();
      }
    },
  });

  // Fetch recent suppliers as example data
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/database/suppliers');
        if (response.ok) {
          return await response.json();
        }
        return await dbService.getSuppliers();
      } catch (error) {
        console.log('Using Supabase REST API for suppliers');
        return await dbService.getSuppliers();
      }
    },
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/database/customers');
        if (response.ok) {
          return await response.json();
        }
        return await dbService.getCustomers();
      } catch (error) {
        return await dbService.getCustomers();
      }
    },
  });

  const formatCurrency = (amount: number, currency = "TRY") => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₺";
    return `${symbol}${Math.abs(amount).toLocaleString()}`;
  };

  // Show loading state
  if (statsLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="İşletme performans özeti">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </AppLayout>
    );
  }

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
                                    <div className="text-3xl font-bold text-green-600">
                    {formatCurrency((dashboardStats as any)?.totalRevenue || 0)}
                  </div>
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
                                                      <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency((dashboardStats as any)?.cashFlow || 0)}
                  </div>
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
                  {formatCurrency((dashboardStats as any)?.cashFlow || 0)}
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
                  {formatCurrency((dashboardStats as any)?.pendingInvoices || 0)}
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
              <DataTable data={suppliers as any[]} />
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

            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col items-start space-y-3 text-left bg-blue-50 hover:bg-blue-100"
              onClick={() => {
                console.log('🔍 Supabase Test Başlatılıyor...');
                dbService.fetchTable('customers', { limit: 5 })
                  .then(data => console.log('✅ Customers data:', data))
                  .catch(err => console.error('❌ Customers error:', err));
                dbService.fetchTable('projects', { limit: 3 })
                  .then(data => console.log('✅ Projects data:', data))
                  .catch(err => console.error('❌ Projects error:', err));
              }}
              data-testid="button-test-database"
            >
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">DB</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Test Supabase</h4>
                <p className="text-sm text-gray-600">Veritabanı bağlantı testi</p>
              </div>
            </Button>
          </div>
    </AppLayout>
  );
}
