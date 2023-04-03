# Processing Instructions

The `process_instruction` program teaches how to process instructions in a solana program.

## How the program works

If you look at the program code you'll see that we have created a new struct `InstructionData` which defines the instruction data. In our case we have added name and age fields.

```rust
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct InstructionData {
    name: String,
    age: u8,
}
```

In the program we can access the instruction data by using the `try_from_slice_unchecked` method of the `InstructionData` struct.

```rust
    let instruction_data_object = InstructionData::try_from_slice(&instruction_data)?
```

We later use this object to welcome the user.

```rust
    msg!("Welcome to the bar, {}", "???");
```

You need to replace the `???` with the name of the user.

After welcoming the user, we need to check if the user is of age 18 or above. If the user is of age 18 or above, then we need to print a message saying "You can drink". If the user is below 18, then we need to print a message saying "You can't drink".

We have already created the Errors Enum and impl here:

```rust
#[derive(Error, Debug)]
pub enum Errors {
    #[error("Not eligible to drink beer")]
    Ineligible,
}

impl From<Errors> for ProgramError {
    fn from(e: Errors) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

## Exercise

You need to first update the greeting to show the name of the user and then you need to write an if statement to check if the user is of age 18 or above. If the user is of age 18 or above, then you need to print a message saying "You can drink". If the user is below 18, then you need to print a message saying "You can't drink".

## Running the program

To test this exercise, follow the steps below:

### 1. Compiling the program

To compile the program, we'll use the `build-bpf` tool. Run the following command to compile the program:

```bash
cargo build-bpf --manifest-path=./exercises/processing_instructions/Cargo.toml --bpf-out-dir=./exercises/processing_instructions/dist/program
```

It creates the `dist/program` folder under the `exercises/processing_instructions` folder, which includes the `.so` file of the program via which we can deploy the program and the keypair JSON file of the program.

### 2. Deploy the program

Once the program is compiled, you will find the compiled program binary in the `dist/program` directory.

Use the following command to create a new Solana program:

```bash
solana program deploy exercises/processing_instructions/dist/program/processing_instructions.so --keypair <path_to_deployer_keypair>
```

Replace <path_to_deployer_keypair> with the path to your solana keypair or remove it if you want to use your default keypair.

### 7. Test the exercise

To test the exercise, use the following command:

```bash
cargo run -- run -e hello-solana -k <path_to_payer_keypair> -p exercises/processing_instructions/dist/solana/processing_instructions-keypair.json
```

Replace <path_to_payer_keypair> with the path to the keypair which would pay the transaction fees
