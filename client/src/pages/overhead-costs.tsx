import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { Sidebar } from "../components/layout/sidebar";
import Header from "../components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, DollarSign, Receipt, PieChart, FileCheck } from "lucide-react";
import DynamicTabulator from "../components/ui/dynamic-tabulator";

export default function OverheadCosts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const OVERHEAD_COSTS_TABLE_ID = "5fd2c08b-9c4b-421a-a83d-9d2e779256fb";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Merkez Giderleri" subtitle="Genel merkez giderleri" />
        
        <div className="flex-1 overflow-auto p-6">


          <Card data-testid="card-overhead-costs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Merkez Giderleri</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <DynamicTabulator 
                tableId={OVERHEAD_COSTS_TABLE_ID}
                onCellEdit={(id, field, value) => {
                  console.log('Cell edited:', { id, field, value });
                }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}