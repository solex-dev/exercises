import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { PublicKey } from "@solana/web3.js";
import { assert, suite, test } from "vitest";
import BN from "bn.js";

function createKeypairFromFile(path: string): Keypair {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8")))
  );
}

const program = createKeypairFromFile(process.env.PROGRAM_PATH!);
const PROGRAM_ID = program.publicKey;

type Counter = {
  count: BN;
};

const COUNTER_ACCOUNT_SIZE = 8;

function deserializeCounterAccount(data: Buffer): Counter {
  if (data.byteLength !== 8) {
    throw Error("Need exactly 8 bytes to deserialize counter");
  }

  return {
    count: new BN(data, "le"),
  };
}

type IncrementInstructionAccounts = {
  counter: PublicKey;
};
type IncrementInstructionArgs = {};

const createIncrementInstruction = (
  accounts: IncrementInstructionAccounts,
  args: IncrementInstructionArgs
): TransactionInstruction => {
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: accounts.counter,
        isSigner: false,
        isWritable: true,
      },
    ],
    data: Buffer.from([0x0]),
  });
};

suite("counter_program", () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  test("Test allocate counter + increment tx", async () => {
    // Randomly generate our wallet
    const payerKeypair = Keypair.generate();
    const payer = payerKeypair.publicKey;

    // Randomly generate the account key
    // to sign for setting up the Counter state
    const counterKeypair = Keypair.generate();
    const counter = counterKeypair.publicKey;

    // Airdrop our wallet 1 Sol
    await connection.requestAirdrop(payer, LAMPORTS_PER_SOL);

    // Create a TransactionInstruction to interact with our counter program
    const allocIx: TransactionInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: counter,
      lamports: await connection.getMinimumBalanceForRentExemption(
        COUNTER_ACCOUNT_SIZE
      ),
      space: COUNTER_ACCOUNT_SIZE,
      programId: PROGRAM_ID,
    });
    const incrementIx: TransactionInstruction = createIncrementInstruction(
      { counter },
      {}
    );
    let tx = new Transaction().add(allocIx).add(incrementIx);

    // Explicitly set the feePayer to be our wallet (this is set to first signer by default)
    tx.feePayer = payer;

    // Fetch a "timestamp" so validators know this is a recent transaction
    tx.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash;

    // Send transaction to network (local network)
    await sendAndConfirmTransaction(
      connection,
      tx,
      [payerKeypair, counterKeypair],
      { skipPreflight: true, commitment: "confirmed" }
    );

    // Get the counter account info from network
    const counterAccountInfo = await connection.getAccountInfo(counter, {
      commitment: "confirmed",
    });
    assert(counterAccountInfo, "Expected counter account to have been created");

    // Deserialize the counter & check count has been incremented
    const counterAccount = deserializeCounterAccount(counterAccountInfo.data);
    assert(
      counterAccount.count.toNumber() === 1,
      "Expected count to have been 1"
    );
    console.log(
      `[alloc+increment] count is: ${counterAccount.count.toNumber()}`
    );
  });
  test("Test allocate tx and increment tx", async () => {
    const payerKeypair = Keypair.generate();
    const payer = payerKeypair.publicKey;

    const counterKeypair = Keypair.generate();
    const counter = counterKeypair.publicKey;

    await connection.requestAirdrop(payer, LAMPORTS_PER_SOL);

    // Check allocate tx
    const allocIx: TransactionInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: counter,
      lamports: await connection.getMinimumBalanceForRentExemption(
        COUNTER_ACCOUNT_SIZE
      ),
      space: COUNTER_ACCOUNT_SIZE,
      programId: PROGRAM_ID,
    });
    let tx = new Transaction().add(allocIx);
    tx.feePayer = payer;
    tx.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash;
    await sendAndConfirmTransaction(
      connection,
      tx,
      [payerKeypair, counterKeypair],
      { skipPreflight: true, commitment: "confirmed" }
    );

    let counterAccountInfo = await connection.getAccountInfo(counter, {
      commitment: "confirmed",
    });
    assert(counterAccountInfo, "Expected counter account to have been created");

    let counterAccount = deserializeCounterAccount(counterAccountInfo.data);
    assert(
      counterAccount.count.toNumber() === 0,
      "Expected count to have been 0"
    );
    console.log(`[allocate] count is: ${counterAccount.count.toNumber()}`);

    // Check increment tx
    const incrementIx: TransactionInstruction = createIncrementInstruction(
      { counter },
      {}
    );
    tx = new Transaction().add(incrementIx);
    tx.feePayer = payer;
    tx.recentBlockhash = (
      await connection.getLatestBlockhash("confirmed")
    ).blockhash;
    await sendAndConfirmTransaction(connection, tx, [payerKeypair], {
      skipPreflight: true,
      commitment: "confirmed",
    });

    counterAccountInfo = await connection.getAccountInfo(counter, {
      commitment: "confirmed",
    });
    assert(counterAccountInfo, "Expected counter account to have been created");

    counterAccount = deserializeCounterAccount(counterAccountInfo.data);
    assert(
      counterAccount.count.toNumber() === 1,
      "Expected count to have been 1"
    );
    console.log(`[increment] count is: ${counterAccount.count.toNumber()}`);
  });
});
