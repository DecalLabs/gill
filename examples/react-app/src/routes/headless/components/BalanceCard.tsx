import { useBalance } from "gill-react";
import { Card } from "../../../components/Card";
import { useWallet } from "@hermis/solana-headless-react";
import { address, lamportsToSol } from "gill";

interface BalanceCardProps {
  balance?: number | string;
  loading?: boolean;
}

export function BalanceCard({ loading }: BalanceCardProps) {
  const { publicKey } = useWallet();

  const { balance } = useBalance({ address: address(publicKey?.toBase58() ?? "") });

  console.log(balance);
  return (
    <Card title="Account Balance">
      <div className="text-2xl font-bold">
        {loading ? <span className="text-gray-400">Loading...</span> : <span>{lamportsToSol(balance) || 0} SOL</span>}
      </div>
    </Card>
  );
}
