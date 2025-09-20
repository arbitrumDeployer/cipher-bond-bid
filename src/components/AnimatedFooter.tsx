import { FileText, Archive, Lock } from "lucide-react";

export const AnimatedFooter = () => {
  return (
    <footer className="bg-gradient-corporate border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-8">
        {/* Animated Document Archive */}
        <div className="relative h-16 mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Archive className="h-8 w-8 text-corporate-silver" />
          </div>
          
          {/* Flying Documents */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute top-4 opacity-60"
              style={{
                animationDelay: `${i * 1}s`,
              }}
            >
              <div className="animate-document-fly">
                <div className="flex items-center gap-1 text-corporate-silver">
                  <Lock className="h-3 w-3" />
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Secure Auctions</h3>
            <p className="text-sm text-muted-foreground">
              End-to-end encrypted bidding with institutional-grade security
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-2">Compliance</h3>
            <p className="text-sm text-muted-foreground">
              Fully compliant with financial regulations and audit requirements
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-2">Support</h3>
            <p className="text-sm text-muted-foreground">
              24/7 institutional support for all participating entities
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Confidential Corporate Finance. All rights reserved. 
            <span className="text-corporate-gold ml-2">Powered by encrypted auctions</span>
          </p>
        </div>
      </div>
    </footer>
  );
};