import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Accounting from "./pages/accounting";
import Purchases from "./pages/purchases";
import Sales from "./pages/sales";
import Subcontractors from "./pages/subcontractors";
import DebtReceivables from "./pages/debt-receivables";
import CreditManagement from "./pages/credit-management";
import BankGuarantees from "./pages/bank-guarantees";
import OrderManagement from "./pages/order-management";
import CustomerManagement from "./pages/customer-management";
import Operations from "./pages/operations";
import OverheadCosts from "./pages/overhead-costs";
import Documents from "./pages/documents";
import DynamicTablePage from "./pages/dynamic-table";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/accounting" component={Accounting} />
          <Route path="/purchases" component={Purchases} />
          <Route path="/sales" component={Sales} />
          <Route path="/subcontractors" component={Subcontractors} />
          <Route path="/receivables" component={DebtReceivables} />
          <Route path="/credits" component={CreditManagement} />
          <Route path="/guarantees" component={BankGuarantees} />
          <Route path="/customers" component={CustomerManagement} />
          <Route path="/expenses" component={OverheadCosts} />
          <Route path="/documents" component={Documents} />
          {/* Catch-all route for dynamic pages - must be last */}
          <Route component={DynamicTablePage} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
