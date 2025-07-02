import { Base64EncodedWireTransaction, SimulateTransactionApi } from "gill";
import { useSimulateTransaction } from "../hooks";

// [DESCRIBE] useSimulateTransaction
{
  {
    const { simulation } = useSimulateTransaction({
      transaction: "123" as Base64EncodedWireTransaction,
      config: { commitment: "confirmed", encoding: "base64" },
    });
    simulation satisfies ReturnType<SimulateTransactionApi["simulateTransaction"]>;
  }

  {
    const { simulation } = useSimulateTransaction({
      transaction: "123" as Base64EncodedWireTransaction,
      config: { commitment: "confirmed", encoding: "base64" },
      options: {
        refetchInterval: 1000,
      },
    });
    simulation satisfies ReturnType<SimulateTransactionApi["simulateTransaction"]>;
  }

  {
    const { simulation } = useSimulateTransaction({
      transaction: "123" as Base64EncodedWireTransaction,
      config: { commitment: "confirmed", encoding: "base64" },
      abortSignal: new AbortController().signal,
    });
    simulation satisfies ReturnType<SimulateTransactionApi["simulateTransaction"]>;
  }
}
