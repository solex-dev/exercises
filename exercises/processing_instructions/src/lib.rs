use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};
use thiserror::Error;

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction_data_object = InstructionData::try_from_slice(&instruction_data)?;

    // TODO: Use the `msg!` macro to welcome the customer to the bar
    msg!("Welcome to the bar, {}", "???");
    // TODO: Check if the age of the customer is over 18 to drink beer
    // TODO: Return Errors::Ineligible if the customer is not eligible
    Ok(())
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct InstructionData {
    name: String,
    age: u8,
}

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
