import { Bell, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "Muhasebe Dashboard", subtitle = "Hoşgeldiniz, bugünkü mali durumunuz" }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Currency Selector */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
            <Globe className="text-gray-500" size={16} />
            <Select defaultValue="TRY">
              <SelectTrigger className="bg-transparent border-none text-sm font-medium text-gray-700 w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span data-testid="current-period">{currentDate}</span>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2 text-gray-400 hover:text-gray-600" data-testid="notifications">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Logout Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            Çıkış
          </Button>
        </div>
      </div>
    </header>
  );
}
