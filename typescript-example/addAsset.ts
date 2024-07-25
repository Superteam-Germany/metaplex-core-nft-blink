import { generateSigner, createSignerFromKeypair, signerIdentity, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { create, fetchCollection } from '@metaplex-foundation/mpl-core'
import { base58 } from '@metaplex-foundation/umi/serializers';

import wallet from "../wallet.json";

// Setup Umi
const umi = createUmi("https://api.devnet.solana.com", "finalized");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const adminSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(adminSigner));

(async () => {
    // Generate the Asset KeyPair
    const asset = generateSigner(umi);
    console.log("This is your asset address", asset.publicKey.toString());

    // Pass and Fetch the Collection
    const collection = await fetchCollection(umi, publicKey("72An7SwKfUmTAu34x2azX7tYwCBznFKxDR6RV9gxoQDr"))
    console.log(collection);

    // Generate the Asset
    const tx = await create(umi, {
        asset,
        collection,
        name: "My Asset",
        uri: "https://example.com",
    }).sendAndConfirm(umi);

    // Deserialize the Signature from the Transaction
    console.log("Asset Created: https://solana.fm/tx/" + base58.deserialize(tx.signature)[0] + "?cluster=devnet-alpha");

})();