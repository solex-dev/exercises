# Hello Solana

The `hello_solana` program teaches how to log messages when invoked.

## How the program works

If you look at the program code, you'll see that it has a single function `process_instruction`. The function takes three arguments: `program_id`, `accounts` and `instruction_data`. The `program_id` is the public key of the program. The `accounts` is an array of accounts that are passed to the program. The `instruction_data` is the data that is passed into the instruction's data, it is passed as an array of bytes.

The `process_instruction` function is passed to the `entrypoint!` macro which tells Solana that `process_instruction` is the entrypoint of the program.

In the program we are using the `msg!` macro to log the message "gm, solana" to the console. It takes a single argument which is the message to be logged. This function returns a `ProgramResult` which a generic type of `Result`.

## Exercise

The current program logs gm, ??? to the console. Your task is to change the message to any message of your choice.

## Running the program

To test this exercise, follow the steps below:

### 1. Install Solana tools

You need to install the Solana CLI tools to compile and deploy the program. You can install the Solana CLI tools by following the instructions provided in the documentation: https://docs.solana.com/cli/install-solana-cli-tools

### 2. Compiling the program

To compile the program, we'll use the `build-bpf` tool. Run the following command to compile the program:

```bash
cargo build-bpf --manifest-path=./exercises/hello_solana/Cargo.toml --bpf-out-dir=./exercises/hello_solana/dist/program
```

It creates the `dist/program` folder under the `exercises/hello_solana` folder, which includes the `.so` file of the program via which we can deploy the program and the keypair JSON file of the program.

### 3. Creating a paper Wallet

We need to create a paper wallet to deploy the program. To create a paper wallet, use the following command:

```bash
solana-keygen new --no-outfile
```

### 4. Change the paper wallet's network to devnet

We are going to be testing the program on the devnet. In the upcoming exercises we'll learn how to run a local validator.
To change the paper wallet's network to devnet, use the following command:

```bash
solana config set --url https://api.devnet.solana.com
```

### 5. Fund the paper wallet

We need some SOL to deploy our program. So, to fund the paper wallet, use the following command:

```bash
solana airdrop 2
```

### 6. Deploy the program

Once the program is compiled, you will find the compiled program binary in the `dist/program` directory.

Use the following command to create a new Solana program:

```bash
solana program deploy exercises/hello_solana/dist/program/hello_solana.so --keypair <path_to_deployer_keypair>
```

Replace <path_to_deployer_keypair> with the path to your solana keypair or remove it if you want to use your default keypair.

### 7. Test the exercise

To test the exercise, use the following command:

```bash
cargo run -- run -e hello-solana -k <path_to_payer_keypair> -p exercises/hello_solana/dist/solana/hello_solana-keypair.json
```

Replace <path_to_payer_keypair> with the path to the keypair which would pay the transaction fees
