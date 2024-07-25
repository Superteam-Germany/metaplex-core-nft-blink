import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorExample } from "../target/types/anchor_example";
import { Keypair } from "@solana/web3.js";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

describe("anchor-example", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const wallet = anchor.Wallet.local();
  const program = anchor.workspace.AnchorExample as Program<AnchorExample>;

  const collection = Keypair.generate()
  const asset = Keypair.generate()

  it("Create Collection!", async () => {
    const tx = await program.methods.createCollection()
    .accountsPartial({
      signer: wallet.publicKey,
      payer: wallet.publicKey,
      collection: collection.publicKey,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    })
    .signers([wallet.payer, collection])
    .rpc();

    console.log(tx);
  });

  it("Create Asset!", async () => {
    const tx = await program.methods.createAsset()
    .accountsPartial({
      signer: wallet.publicKey,
      payer: wallet.publicKey,
      asset: asset.publicKey,
      collection: collection.publicKey,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
    })
    .signers([wallet.payer, asset])
    .rpc();

    console.log(tx);
  });
});
