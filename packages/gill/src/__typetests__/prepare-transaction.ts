/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  BaseTransactionMessage,
  ITransactionMessageWithFeePayer,
  Rpc,
  SolanaRpcApi,
  TransactionMessageWithBlockhashLifetime,
} from "@solana/kit";
import { signTransactionMessageWithSigners } from "@solana/kit";
import { prepareTransaction } from "../core";

// [DESCRIBE] prepareTransaction
async () => {
  const rpc = null as unknown as Rpc<SolanaRpcApi>;

  const transactionWithoutBlockhash = null as unknown as BaseTransactionMessage<"legacy"> &
    ITransactionMessageWithFeePayer;

  const transactionWithBlockhash = null as unknown as BaseTransactionMessage<"legacy"> &
    ITransactionMessageWithFeePayer &
    TransactionMessageWithBlockhashLifetime;

  // @ts-expect-error Base transaction should not be a signable
  signTransactionMessageWithSigners(transactionWithoutBlockhash);

  signTransactionMessageWithSigners(transactionWithBlockhash);

  // Supports input transactions without a blockhash
  {
    const newTx = await prepareTransaction({
      rpc,
      transaction: transactionWithoutBlockhash,
    });

    signTransactionMessageWithSigners(newTx);
  }

  // Supports input transactions with a blockhash
  {
    const newTx = await prepareTransaction({
      rpc,
      transaction: transactionWithBlockhash,
    });

    signTransactionMessageWithSigners(newTx);
  }
};
