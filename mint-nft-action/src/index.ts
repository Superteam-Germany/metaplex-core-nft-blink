import { create, fetchCollection } from "@metaplex-foundation/mpl-core";
import {
  createNoopSigner,
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Buffer } from "node:buffer";

import wallet from "../../wallet.json";

if (globalThis.Buffer === undefined) {
  globalThis.Buffer = Buffer;
}

const app = new Hono();

// see https://solana.com/docs/advanced/actions#options-response
app.use(
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Accept-Encoding"],
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
  })
);

// see https://solana.com/docs/advanced/actions#get-request
app.get("/", (c) => {
  const response: ActionGetResponse = {
    title: "Mint NFT with a Blink",
    description: "This is a blink to mint NFT",
    icon: "https://img.fotofolio.xyz/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png",
    label: "Mint NFT",
  };

  return c.json(response);
});

// see https://solana.com/docs/advanced/actions#post-request
app.post("/", async (c) => {
  const req = await c.req.json<ActionPostRequest>();

  const transaction = await prepareTransaction(new PublicKey(req.account));

  const response: ActionPostResponse = {
    transaction: Buffer.from(transaction).toString("base64"),
  };

  return c.json(response);
});

async function prepareTransaction(user: PublicKey) {
  const umi = createUmi("https://api.devnet.solana.com", "confirmed");

  let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
  const adminSigner = createSignerFromKeypair(umi, keypair);
  // we create noop signer since we want let user sign the transaction later
  umi.use(signerIdentity(createNoopSigner(publicKey(user))));

  // Generate the Asset KeyPair
  const asset = generateSigner(umi);
  console.log("This is your asset address", asset.publicKey.toString());

  // Pass and Fetch the Collection
  const collection = await fetchCollection(
    umi,
    publicKey("72An7SwKfUmTAu34x2azX7tYwCBznFKxDR6RV9gxoQDr")
  );

  // Generate the Asset
  const tx = await create(umi, {
    asset,
    collection,
    name: "My Asset",
    uri: "https://example.com",
    authority: adminSigner,
  }).buildAndSign(umi);

  return umi.transactions.serialize(tx);
}

export default app;
