import { GetTransactionApi, Signature } from "gill";
import { useTransaction } from "../hooks";

// [DESCRIBE] useGetTransaction
{
  {
    const { transaction } = useTransaction({ signature: "123" as Signature });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;
  }

  {
    const { transaction } = useTransaction({
      signature: "123" as Signature,
      config: {
        commitment: "confirmed",
        encoding: "json",
      },
    });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;
  }
  {
    const { transaction } = useTransaction({
      signature: "123" as Signature,
      options: {
        refetchInterval: 1000,
      },
    });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;
  }

  {
    const { transaction } = useTransaction({
      signature: "123" as Signature,
      abortSignal: new AbortController().signal,
    });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;
  }
}
