import { Briefcase, Lock, Zap } from "lucide-react";
import corporateLogo from "@/assets/corporate-logo.png";

interface CorporateLogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const CorporateLogo = ({ showText = true, size = "md" }: CorporateLogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img 
          src={corporateLogo} 
          alt="Confidential Corporate Finance" 
          className={`${sizeClasses[size]} animate-crypto-pulse`}
        />
        <div className="absolute inset-0 bg-gradient-encrypted opacity-30 rounded-lg animate-encrypted-glow"></div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold text-foreground tracking-tight`}>
            Confidential Corporate Finance
          </h1>
          <p className="text-sm text-muted-foreground">Encrypted Bond Auctions</p>
        </div>
      )}
    </div>
  );
};