import { generateSigner, createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { base58 } from '@metaplex-foundation/umi/serializers';
import { createCollection } from '@metaplex-foundation/mpl-core'

import wallet from "../wallet.json";

// Setup Umi
const umi = createUmi("https://api.devnet.solana.com", "finalized");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const adminSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(adminSigner));

(async () => {
    // Generate the Collection KeyPair
    const collection = generateSigner(umi);
    console.log("This is your collection address", collection.publicKey.toString());

    // Generate the collection
    let tx = await createCollection(umi, {
        collection,
        name: "My Collection",
        uri: "https://example.com",
        plugins: [
            {
                type: "PermanentFreezeDelegate",
                frozen: true,
                authority: { type: "None" }
            }
        ]
    }).sendAndConfirm(umi);

    // Deserialize the Signature from the Transaction
    console.log("Collection Created: https://solana.fm/tx/" + base58.deserialize(tx.signature)[0] + "?cluster=devnet-alpha");

})();
