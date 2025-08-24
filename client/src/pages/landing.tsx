import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Building, Users, FileText, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Calculator className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Muhasebe ERP</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">v3.0 Tiger Edition</p>
              </div>
            </div>
            <Button 
              data-testid="button-login"
              onClick={() => window.location.href = '/login'}
              className="bg-primary hover:bg-primary-dark"
            >
              Giriş Yap
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Kapsamlı Muhasebe ve
              <span className="text-primary block">İş Yönetimi Sistemi</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              Türkiye'nin önde gelen Logo Tiger 3'ten ilham alınarak geliştirilen, 
              Supabase altyapısıyla desteklenen modern ERP çözümü.
            </p>
            <div className="mt-10">
              <Button 
                data-testid="button-get-started"
                onClick={() => window.location.href = '/login'}
                size="lg"
                className="bg-primary hover:bg-primary-dark text-lg px-8 py-3"
              >
                Hemen Başlayın
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Özellikler
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              İşletmeniz için ihtiyacınız olan tüm modüller
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="card-feature-accounting">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-primary" size={24} />
                </div>
                <CardTitle>Genel Muhasebe</CardTitle>
                <CardDescription>
                  Kapsamlı hesap planı, yevmiye kayıtları ve VUK uyumlu raporlama
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-commerce">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-success" size={24} />
                </div>
                <CardTitle>Ticaret & Satış</CardTitle>
                <CardDescription>
                  Satın alma, sipariş yönetimi ve müşteri takip sistemleri
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-banking">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-warning" size={24} />
                </div>
                <CardTitle>Bankacılık</CardTitle>
                <CardDescription>
                  Kredi yönetimi, banka teminat mektupları ve nakit akış takibi
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-subcontractors">
              <CardHeader>
                <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="text-error" size={24} />
                </div>
                <CardTitle>Taşeron Yönetimi</CardTitle>
                <CardDescription>
                  Puantaj sistemi, bordro hesaplamaları ve işçi takibi
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-expenses">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Building className="text-accent" size={24} />
                </div>
                <CardTitle>Gider Yönetimi</CardTitle>
                <CardDescription>
                  Merkez giderleri, masraf merkezleri ve bütçe kontrolü
                </CardDescription>
              </CardHeader>
            </Card>

            <Card data-testid="card-feature-reporting">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="text-primary" size={24} />
                </div>
                <CardTitle>Raporlama</CardTitle>
                <CardDescription>
                  Mali tablolar, analitik raporlar ve Excel dışa aktarım
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teknik Özellikler
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Modern teknoloji ile desteklenen güvenilir altyapı
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center" data-testid="feature-supabase">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-primary" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Supabase</h3>
              <p className="text-gray-600 dark:text-gray-400">Gerçek zamanlı veritabanı</p>
            </div>

            <div className="text-center" data-testid="feature-excel">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-success" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Excel Benzeri</h3>
              <p className="text-gray-600 dark:text-gray-400">Tabulator.js ile tablo editörü</p>
            </div>

            <div className="text-center" data-testid="feature-multicurrency">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-warning" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Çok Para Birimi</h3>
              <p className="text-gray-600 dark:text-gray-400">TRY, USD, EUR desteği</p>
            </div>

            <div className="text-center" data-testid="feature-compliance">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-error" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">VUK Uyumlu</h3>
              <p className="text-gray-600 dark:text-gray-400">Türk mevzuatına uygun</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calculator className="text-white" size={18} />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Muhasebe ERP</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Modern muhasebe ve iş yönetimi çözümü
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
