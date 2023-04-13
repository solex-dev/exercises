import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { test } from "vitest";

function createKeypairFromFile(path: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8")))
  );
}

test("counter", async () => {
  if (!(process.env.KEYPAIR || process.env.PROGRAM_PATH)) {
    new Error("Missing required parameters");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = createKeypairFromFile(process.env.KEYPAIR!);
  const program = createKeypairFromFile(process.env.PROGRAM_PATH!);

  await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);

  let instruction = new TransactionInstruction({
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    programId: program.publicKey,
    data: Buffer.alloc(0),
  });

  const incrementInstructionAccounts = new TransactionInstruction({
    programId: program.publicKey,
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    data: Buffer.from([0x0]),
  });

  const decrementInstructionAccounts = new TransactionInstruction({
    programId: program.publicKey,
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    data: Buffer.from([0x1]),
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
  const counter = logs?.[0].split(" ")[1];

  const incrementSignature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(incrementInstructionAccounts),
    [payer]
  );

  const incrementTransaction = await connection.getParsedTransaction(
    incrementSignature,
    {
      maxSupportedTransactionVersion: 0,
    }
  );

  const incrementLogs = incrementTransaction?.meta?.logMessages;
  const incrementCounter = incrementLogs?.[0].split(" ")[1];

  const decrementSignature = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(decrementInstructionAccounts),
    [payer]
  );

  const decrementTransaction = await connection.getParsedTransaction(
    decrementSignature,
    {
      maxSupportedTransactionVersion: 0,
    }
  );

  const decrementLogs = decrementTransaction?.meta?.logMessages;
  const decrementCounter = decrementLogs?.[0].split(" ")[1];

  if (logs?.length == 0) {
    new Error("No transaction logs");
  }

  console.log(`Signature - ${signature}`);
  console.log(`Counter - ${counter}`);
  console.log(`Increment Signature - ${incrementSignature}`);
  console.log(`Increment Counter - ${incrementCounter}`);
  console.log(`Decrement Signature - ${decrementSignature}`);
  console.log(`Decrement Counter - ${decrementCounter}`);
});
