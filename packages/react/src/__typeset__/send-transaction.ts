import { Base64EncodedWireTransaction, SendTransactionApi } from "gill";
import { useSendTransaction } from "../hooks";

// [DESCRIBE] useSendTransaction
{
  const transaction = null as unknown as Base64EncodedWireTransaction;

  {
    const { signature } = useSendTransaction({ transaction });
    signature satisfies ReturnType<SendTransactionApi["sendTransaction"]>;

    // @ts-expect-error - Should not allow no argument
    useSendTransaction();

    // @ts-expect-error - Should not allow empty argument object
    useSendTransaction({});
  }

  // accept transaction in `Base64EncodedWireTransaction` format
  {
    const { signature } = useSendTransaction({
      transaction,
      config: {
        encoding: "base64",
        skipPreflight: false
      }
    });
    signature satisfies ReturnType<SendTransactionApi["sendTransaction"]>;
  }

  // should accept transaction in `string` format
  {
    const { signature } = useSendTransaction({
      transaction: "4hXTCkRzt9WyecNzV1XPgCDfGAZzQKNxLXgynz5QDuWWPSAZBZSHptvWRL3BjCvzUXRdKvHL2b7yGrRQcWyaqsaBCncVG7BFggS8w9snUts67BSh3EqKpXLUm5UMHfD7ZBe9GhARjbNQMLJ1QD3Spr6oMTBU6EhdB4RD8CP2xUxr2u3d6fos36PD98XS6oX8TQjLpsMwncs5DAMiD4nNnR8NBfyghGCWvCVifVwvA8B8TJxE1aiyiv2L429BCWfyzAme5sZW8rDb14NeCQHhZbtNqfXhcp2tAnaAT"
    });
    signature satisfies ReturnType<SendTransactionApi["sendTransaction"]>;
  }
}