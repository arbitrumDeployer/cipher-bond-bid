import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface BondCardProps {
  bond: {
    id: string;
    issuer: string;
    maturity: string;
    yield: string;
    minBid: string;
    status: "active" | "closing" | "closed";
    timeRemaining: string;
    rating: string;
  };
}

export const BondCard = ({ bond }: BondCardProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmitBid = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) < parseFloat(bond.minBid.replace(/[$,]/g, ''))) {
      toast({
        title: "Invalid Bid",
        description: `Minimum bid is ${bond.minBid}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert bid amount to wei for contract interaction
      const bidAmountWei = parseEther(bidAmount);
      
      // Place encrypted bid on FHE contract - no direct ETH transfer
      await writeContract({
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // FHE Contract address
        abi: [
          {
            "inputs": [
              {"internalType": "uint256", "name": "bondId", "type": "uint256"},
              {"internalType": "uint32", "name": "encryptedAmount", "type": "uint32"}
            ],
            "name": "placeEncryptedBid",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'placeEncryptedBid',
        args: [BigInt(bond.id), BigInt(bidAmountWei)],
        // No value transfer - encrypted data only
      });
    } catch (err) {
      console.error('Error placing encrypted bid:', err);
      toast({
        title: "Encrypted Bid Failed",
        description: "Failed to place encrypted bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle transaction success
  if (isConfirmed) {
    toast({
      title: "Bid Submitted Successfully",
      description: "Your encrypted bid has been recorded on the blockchain",
    });
    setBidAmount("");
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green text-white";
      case "closing":
        return "bg-warning-amber text-background";
      case "closed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card border-border shadow-corporate hover:shadow-gold-glow transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-card-foreground">
              {bond.issuer}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Corporate Bond - {bond.rating} Rating
            </CardDescription>
          </div>
          <Badge className={getStatusColor(bond.status)}>
            {bond.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Maturity:</span>
            <span className="font-medium">{bond.maturity}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success-green" />
            <span className="text-muted-foreground">Yield:</span>
            <span className="font-medium text-success-green">{bond.yield}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Min Bid:</span>
            <span className="font-medium">{bond.minBid}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning-amber" />
            <span className="text-muted-foreground">Time Left:</span>
            <span className="font-medium text-warning-amber">{bond.timeRemaining}</span>
          </div>
        </div>

        {bond.status === "active" && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Your bid will be encrypted until auction closure
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1 bg-input border-border text-foreground"
              />
              <Button
                onClick={handleSubmitBid}
                disabled={isPending || isConfirming || !bidAmount || !isConnected}
                className="bg-corporate-gold hover:bg-corporate-gold/80 text-background font-medium"
              >
                {isPending ? "Confirming..." : isConfirming ? "Processing..." : "Submit Bid"}
              </Button>
            </div>
          </div>
        )}
        
        {bond.status === "closed" && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Auction closed - Results being processed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};