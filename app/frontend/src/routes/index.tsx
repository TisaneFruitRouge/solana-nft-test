import { createFileRoute } from '@tanstack/react-router';
import "@solana/wallet-adapter-react-ui/styles.css";

import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import MintNft from '~/components/MintNFT';
import { useMemo } from 'react';
import ClientOnlyMint from '~/components/ClientOnlyMintNFT';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const endpoint = "https://api.devnet.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <div className="p-2">
            <h3>Welcome Home!!!</h3>
          </div>
          <ClientOnlyMint />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
