use anchor_lang::prelude::*;

use mpl_core::{
    ID as MPL_CORE_PROGRAM_ID,
    accounts::BaseCollectionV1, 
    types::{PluginAuthorityPair, Plugin, PermanentFreezeDelegate}, 
    instructions::{CreateV2CpiBuilder, CreateCollectionV2CpiBuilder}, 
};
declare_id!("3egzXoTuREpyAbqyw2zJBx6vUXnVGcVZEMVeqxFQBQZU");

#[program]
pub mod anchor_example {
    use super::*;

    pub fn create_collection(ctx: Context<CreateCollection>) -> Result<()> {

        let mut collection_plugins = vec![];

        collection_plugins.push( PluginAuthorityPair { plugin: Plugin::PermanentFreezeDelegate( PermanentFreezeDelegate { frozen: true}), authority: None});

        CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .collection(&ctx.accounts.collection.to_account_info())
        .payer(&ctx.accounts.payer.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name("My Super Collection".to_string())
        .uri("https://example.com".to_string())
        .plugins(collection_plugins)
        .invoke()?;

        Ok(())
    }

    pub fn create_asset(ctx: Context<CreateAsset>) -> Result<()> {

        CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.asset.to_account_info())
        .collection(Some(&ctx.accounts.collection.to_account_info()))
        .payer(&ctx.accounts.payer.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name("My Super Asset".to_string())
        .uri("https://example.com".to_string())
        .invoke()?;

        Ok(())
    }

}

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub collection: Signer<'info>,
    #[account(address = MPL_CORE_PROGRAM_ID)]
    /// CHECK: This doesn't need to be checked, because there is the address constraint
    pub mpl_core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateAsset<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        constraint = collection.update_authority == signer.key(),
    )]
    pub collection: Account<'info, BaseCollectionV1>,
    #[account(mut)]
    pub asset: Signer<'info>,
    #[account(address = MPL_CORE_PROGRAM_ID)]
    /// CHECK: This doesn't need to be checked, because there is the address constraint
    pub mpl_core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
