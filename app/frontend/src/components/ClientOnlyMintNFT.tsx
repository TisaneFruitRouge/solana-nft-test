// src/components/MintNftNoUmi.tsx
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3, AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "../../idl/solana_nft_anchor.json";
import type { SolanaNftAnchor } from "../../types/solana_nft_anchor";
import {
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const METADATA_PROGRAM_ID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

const network = "https://api.devnet.solana.com";

function MintNftNoUmi() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [mintLink, setMintLink] = useState<string | null>(null);

  const handleMint = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const connection = new web3.Connection(network, "confirmed");
      const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "processed",
      });

      const program = new Program(idl as SolanaNftAnchor, provider);
      const mint = web3.Keypair.generate();

      // Calculate metadata PDA manually
      const [metadataAccount] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );

      // Calculate master edition PDA manually
      const [masterEditionAccount] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from("edition"),
        ],
        METADATA_PROGRAM_ID
      );

      console.log("Mint:", mint.publicKey.toString());
      console.log("Metadata:", metadataAccount.toString());
      console.log("Master Edition:", masterEditionAccount.toString());

      // Call your anchor program
      console.log("Calling initNft...");
      const tx = await program.methods
        .initNft("Kobeni-2", "kBN2", "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json")
        .accounts({
          signer: provider.wallet.publicKey,
          mint: mint.publicKey,
          metadataAccount,
          masterEditionAccount,
        })
        .signers([mint])
        .transaction();

      tx.feePayer = provider.wallet.publicKey;

      const latestBlockhash = await provider.connection.getLatestBlockhash();

      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
      tx.feePayer = provider.wallet.publicKey;

      // Sign & send
      const signedTx = await provider.wallet.signTransaction(tx);
      signedTx.partialSign(mint);

      const sig = await provider.connection.sendRawTransaction(signedTx.serialize());
      await provider.connection.confirmTransaction({
        signature: sig,
        blockhash: tx.recentBlockhash,
        lastValidBlockHeight: tx.lastValidBlockHeight as number,
      });

      console.log("NFT minted successfully:", tx);
      setMintLink(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);
    } catch (err) {
      console.error("Minting failed:", err);
      alert(`Minting failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mint-container p-4">
      <button
        type="button"
        onClick={handleMint}
        disabled={!wallet.connected || loading}
        className="p-2 bg-black text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>
      {mintLink && (
        <p className="mt-4">
          ✅ NFT Minted! View on{" "}
          <a
            href={mintLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Solana Explorer
          </a>
        </p>
      )}
    </div>
  );
}

export default MintNftNoUmi;
