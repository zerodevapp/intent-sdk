import {
    createTransactionMessage,
    type IInstruction,
    pipe,
    setTransactionMessageLifetimeUsingBlockhash,
    type SolanaRpcApi,
    type Rpc,
    type Transaction,
    type TransactionSigner,
    appendTransactionMessageInstructions,
    getBase64EncodedWireTransaction,
    createNoopSigner,
    address,
    setTransactionMessageFeePayerSigner,
    type Base64EncodedWireTransaction,
    type SignatureBytes,
    addSignersToTransactionMessage,
    partiallySignTransactionMessageWithSigners,
} from "@solana/kit";
import { FEE_PAYER_URL } from "../utils/constants.js";

/**
 * Sign a set of Solana instructions using the provided signer
 * 
 * @param rpc - The Solana RPC API client
 * @param instructions - Array of Solana instructions to sign
 * @param solanaSigner - The Solana transaction signer
 * @returns A fully signed transaction
 */
export async function signSolanaInstructions(
    rpc: Rpc<SolanaRpcApi>,
    instructions: IInstruction[],
    solanaSigner: TransactionSigner,
): Promise<Transaction> {
    // Fetch latest blockhash from the Solana network
    const response = await rpc.getLatestBlockhash().send();
    if (!response.value || !response.value.blockhash) {
        throw new Error("Failed to get latest blockhash from Solana RPC");
    }
    // TODO: make this to fetch signer address from rpc
    const feePayer = createNoopSigner(address("Data6X2sFNz6WFGJ5nXBCYMvyVvJUQh5oUJLkPd9pM58"))
    // Create and configure the transaction message
    const transactionMessage = pipe(
        // Initialize a new transaction message
        createTransactionMessage({
            version: 0,
        }),
        tx => setTransactionMessageFeePayerSigner(feePayer, tx),
        // Add all instructions to the transaction
        tx => appendTransactionMessageInstructions(instructions, tx),
        // Set transaction lifetime using blockhash
        tx => setTransactionMessageLifetimeUsingBlockhash(response.value, tx),
    );
    // explicitly add signer to the transaction aside from the fee payer
    const txWithSigner = addSignersToTransactionMessage([solanaSigner], transactionMessage);

    // Sign the transaction message with the signers embedded in the transaction message
    // signedTransaction.signatures[feePayer.address] == '';
    // signedTransaction.signatures[solanaSigner.address] == Real Signature
    const signedTransaction = await partiallySignTransactionMessageWithSigners(txWithSigner);

    const encoded = getBase64EncodedWireTransaction(signedTransaction);

    const signature = await sponsorTransaction(solanaSigner, encoded);

    // add feepayer signature
    signedTransaction.signatures[feePayer.address] = signature;
    
    return signedTransaction;
}

export async function sponsorTransaction(solanaSigner : TransactionSigner, transactionMessage : Base64EncodedWireTransaction) : Promise<SignatureBytes> {
    const response = await fetch(FEE_PAYER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'  // Add this line
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'zd_sponsorSolanaTransaction',
          params: [
            {
              serializedTransaction: transactionMessage,
              sender : solanaSigner.address,
              network: 'devnet' // TODO fix this
            }
          ]
        })
      })
    const data = await response.json();
    const sig = new Uint8Array(data.result.signature) as SignatureBytes
    return sig
}