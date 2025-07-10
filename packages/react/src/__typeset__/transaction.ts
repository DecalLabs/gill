import { GetTransactionApi, Signature } from "gill";
import { useTransaction } from "../hooks";

// [DESCRIBE] useTransaction
{
  const signature = null as unknown as Signature;

  {
    const { transaction } = useTransaction({ signature });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;

    // @ts-expect-error - Should not allow no argument
    useTransaction();

    // @ts-expect-error - Should not allow empty argument object
    useTransaction({});
  }

  {
    const { transaction } = useTransaction({
      signature,
      config: { 
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
        encoding: "json"
      },
    });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;
  }

  {
    const { transaction } = useTransaction({
      signature: "5Pj5fCupXLUePYn18JkY8SrRaWFiUctuDTRwvUy2ML9yvkENLb1QMYbcBGcBXRrSVDjp7RjUwk9a3rLC6gpvtYpZ",
    });
    transaction satisfies ReturnType<GetTransactionApi["getTransaction"]>;
  }
}
