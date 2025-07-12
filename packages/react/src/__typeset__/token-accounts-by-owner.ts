import {
  AccountInfoWithBase58Bytes,
  AccountInfoWithBase58EncodedData,
  AccountInfoWithBase64EncodedData,
  AccountInfoWithBase64EncodedZStdCompressedData,
  AccountInfoWithJsonData,
  Address,
  Base58EncodedBytes,
  Base58EncodedDataResponse,
  Base64EncodedDataResponse,
  Base64EncodedZStdCompressedDataResponse,
  SolanaRpcResponse,
} from "gill";
import { useTokenAccountsByOwner } from "../hooks";

// [DESCRIBE] useTokenAccountsByOwner
{
  const owner = null as unknown as Address;
  const mint = null as unknown as Address;
  const programId = null as unknown as Address;

  // default encoded data as bytes
  {
    const { tokenAccounts: baseConfigAccounts } = useTokenAccountsByOwner({
      owner,
      filter: { mint }
    });
    // Should return accounts with data encoded as base58 bytes by default
    baseConfigAccounts satisfies SolanaRpcResponse<any>;
    baseConfigAccounts.value[0].account satisfies AccountInfoWithBase58Bytes;
    baseConfigAccounts.value[0].account.data satisfies Base58EncodedBytes;

    // @ts-expect-error - Should not allow no argument
    useTokenAccountsByOwner();
    // @ts-expect-error - Should not allow empty argument object
    useTokenAccountsByOwner({});
    // @ts-expect-error - Should not allow missing filter
    useTokenAccountsByOwner({ owner });
    // @ts-expect-error - Should not allow missing owner
    useTokenAccountsByOwner({ filter: { mint } });
  }

  // base58 encoded `data`
  {
    const { tokenAccounts: base58Accounts } = useTokenAccountsByOwner({
      owner,
      filter: { programId },
      config: {
        commitment: "finalized",
        encoding: "base58",
      }
    });
    
    // Should return accounts with data encoded as base58 (explicit encoding)
    base58Accounts satisfies SolanaRpcResponse<any>;
    base58Accounts.value[0].account satisfies AccountInfoWithBase58EncodedData;
    base58Accounts.value[0].account.data satisfies Base58EncodedDataResponse;

    // @ts-expect-error Should not be base58 encoded bytes
    base58Accounts.value[0].account.data satisfies Base58EncodedBytes;
  }

  // base64 encoded `data`
  {
    const { tokenAccounts: base64Accounts } = useTokenAccountsByOwner({
      owner,
      filter: { programId },
      config: {
        commitment: "finalized",
        encoding: "base64",
      },
    });
    
    // Should return accounts with data encoded as base64
    base64Accounts satisfies SolanaRpcResponse<any>;
    base64Accounts.value[0].account satisfies AccountInfoWithBase64EncodedData;
    base64Accounts.value[0].account.data satisfies Base64EncodedDataResponse;

    // @ts-expect-error Should not be base58 encoded bytes
    base64Accounts.value[0].account.data satisfies Base58EncodedBytes;
  }

  // base64+zstd encoded `data`
  {
    const { tokenAccounts: base64ZstdAccounts } = useTokenAccountsByOwner({
      owner,
      filter: { programId },
      config: {
        commitment: "finalized",
        encoding: "base64+zstd",
      },
    });
    
    // Should return accounts with data encoded as base64+zstd
    base64ZstdAccounts satisfies SolanaRpcResponse<any>;
    base64ZstdAccounts.value[0].account satisfies AccountInfoWithBase64EncodedZStdCompressedData;
    base64ZstdAccounts.value[0].account.data satisfies Base64EncodedZStdCompressedDataResponse;

    // @ts-expect-error Should not be base58 encoded bytes
    base64ZstdAccounts.value[0].account.data satisfies Base58EncodedBytes;
  }

  // json parsed encoded `data`
  {
    const { tokenAccounts:jsonParsedAccounts } = useTokenAccountsByOwner({
      owner,
      filter: { programId },
      config: {
        commitment: "finalized",
        encoding: "jsonParsed",
      },
    });
    
    // Should return accounts with data encoded as base64 or jsonParsed
    jsonParsedAccounts satisfies SolanaRpcResponse<any>;
    jsonParsedAccounts.value[0].account satisfies AccountInfoWithBase64EncodedData | AccountInfoWithJsonData;
    
    // @ts-expect-error Should not be base58 encoded bytes
    jsonParsedAccounts.value[0].account.data satisfies Base58EncodedBytes;
  }
}
