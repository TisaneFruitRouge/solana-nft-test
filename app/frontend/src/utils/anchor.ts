import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "../../idl/solana_nft_anchor.json";
import type { Commitment } from "@solana/web3.js";

const programID = new web3.PublicKey(idl.address);
const network = "https://api.devnet.solana.com";
const opts = { preflightCommitment: 'processed' as Commitment };

export const getProvider = () => {
  const connection = new web3.Connection(network, opts.preflightCommitment);
  const provider = new AnchorProvider(connection, window.solana, opts);
  return provider;
};

export const getProgram = () => {
  const provider = getProvider();

  const program = new Program(idl as any, provider);
  return program;
};
