import {
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { test } from "vitest";
import { createKeypairFromFile } from "./utils";

test("hello_solana", async () => {
  if (!(process.env.KEYPAIR || process.env.PROGRAM_PATH)) {
    new Error("Missing required parameters");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = createKeypairFromFile(process.env.KEYPAIR!);
  const program = createKeypairFromFile(process.env.PROGRAM_PATH!);

  let instruction = new TransactionInstruction({
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    programId: program.publicKey,
    data: Buffer.alloc(0),
  });

  const signature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer]
  );

  const transaction = await connection.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  const logs = transaction?.meta?.logMessages;

  if (logs?.length == 0) {
    new Error("No transaction logs");
  }

  console.log(`Signature - ${signature}`);
});
