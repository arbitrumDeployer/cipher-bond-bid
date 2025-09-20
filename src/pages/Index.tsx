import { CorporateLogo } from "@/components/CorporateLogo";
import { WalletConnect } from "@/components/WalletConnect";
import { BondCard } from "@/components/BondCard";
import { AnimatedFooter } from "@/components/AnimatedFooter";
import { Search, Filter, TrendingUp, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  // Mock bond data
  const bonds = [
    {
      id: "1",
      issuer: "TechCorp International",
      maturity: "Dec 2029",
      yield: "4.75%",
      minBid: "$100,000",
      status: "active" as const,
      timeRemaining: "2d 14h",
      rating: "AAA"
    },
    {
      id: "2", 
      issuer: "Global Manufacturing Ltd",
      maturity: "Mar 2031",
      yield: "5.25%",
      minBid: "$250,000",
      status: "closing" as const,
      timeRemaining: "6h 23m",
      rating: "AA+"
    },
    {
      id: "3",
      issuer: "Energy Solutions Corp",
      maturity: "Sep 2027",
      yield: "4.50%",
      minBid: "$150,000",
      status: "active" as const,
      timeRemaining: "1d 8h",
      rating: "AA"
    },
    {
      id: "4",
      issuer: "FinTech Innovations",
      maturity: "Jun 2030",
      yield: "5.75%",
      minBid: "$500,000",
      status: "closed" as const,
      timeRemaining: "Ended",
      rating: "A+"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-corporate border-b border-border shadow-corporate">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <CorporateLogo />
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-success-green" />
                <span>Encrypted & Secure</span>
              </div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search corporate bonds..."
                className="pl-10 bg-input border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                <TrendingUp className="h-4 w-4 mr-2" />
                Sort by Yield
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 shadow-corporate">
            <div className="text-2xl font-bold text-corporate-gold">12</div>
            <div className="text-sm text-muted-foreground">Active Auctions</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-corporate">
            <div className="text-2xl font-bold text-success-green">$2.4B</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-corporate">
            <div className="text-2xl font-bold text-warning-amber">4.8%</div>
            <div className="text-sm text-muted-foreground">Avg Yield</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 shadow-corporate">
            <div className="text-2xl font-bold text-corporate-silver">156</div>
            <div className="text-sm text-muted-foreground">Participants</div>
          </div>
        </div>

        {/* Bond Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bonds.map((bond) => (
            <BondCard key={bond.id} bond={bond} />
          ))}
        </div>
      </main>

      <AnimatedFooter />
    </div>
  );
};

export default Index;
