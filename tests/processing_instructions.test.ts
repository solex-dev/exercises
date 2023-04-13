import {
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  SendTransactionError,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { serialize } from "borsh";
import { Buffer } from "buffer";
import { test } from "vitest";
import { createKeypairFromFile } from "./utils";

interface IProperties {
  name: string;
  age: number;
}

class Assignable {
  constructor(properties: IProperties) {
    for (const [key, value] of Object.entries(properties)) {
      (this as any)[key] = value;
    }
  }
}

test("processing-instructions", async () => {
  if (!process.env.KEYPAIR || !process.env.PROGRAM_PATH) {
    new Error("Missing required parameters");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const payer = createKeypairFromFile(process.env.KEYPAIR!);
  const program = createKeypairFromFile(process.env.PROGRAM_PATH!);

  class InstructionData extends Assignable {
    toBuffer() {
      return Buffer.from(serialize(InstructionDataSchema, this));
    }
  }

  const InstructionDataSchema = new Map([
    [
      InstructionData,
      {
        kind: "struct",
        fields: [
          ["name", "string"],
          ["age", "u8"],
        ],
      },
    ],
  ]);

  const mary = new InstructionData({
    age: 21,
    name: "mary",
  });

  const jimmy = new InstructionData({
    age: 10,
    name: "jimmy",
  });

  const mary_instruction = new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
    ],
    programId: program.publicKey,
    data: mary.toBuffer(),
  });

  const jimmy_instruction = new TransactionInstruction({
    ...mary_instruction,
    data: jimmy.toBuffer(),
  });

  try {
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(mary_instruction).add(jimmy_instruction),
      [payer]
    );
  } catch (err) {
    if (err instanceof SendTransactionError) {
      const error = `Program ${program.publicKey.toString()} failed: custom program error: 0x0`;
      if (err.logs?.includes(error)) {
        return 0;
      } else {
        return 1;
      }
    }
  }
});
