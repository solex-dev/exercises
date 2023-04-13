import { Keypair } from "@solana/web3.js";

export const createKeypairFromFile = (path: string): Keypair => {
  return Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8")))
  );
};
