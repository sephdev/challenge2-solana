// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  60, 160, 66, 202, 9, 184, 144, 135, 59, 115, 68, 122, 188, 75, 36, 148, 210,
  211, 14, 123, 47, 246, 23, 95, 244, 26, 122, 19, 236, 9, 113, 94, 123, 182,
  37, 154, 113, 46, 157, 39, 124, 65, 198, 165, 158, 193, 158, 133, 66, 92, 76,
  164, 149, 227, 113, 49, 119, 23, 254, 120, 69, 207, 109, 10,
]);

// Get the balance of from (sender) wallet
const getFromWalletBalance = async () => {
  try {
    // Connect to Devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // console.log('Connection object is:', connection);

    // Make a wallet from DEMO_FROM_SECRET_KEY and get its balance
    const fromWallet = await Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    const fromWalletBalance = await connection.getBalance(
      new PublicKey(fromWallet.publicKey)
    );
    console.log(
      `from Wallet balance: ${
        parseInt(fromWalletBalance) / LAMPORTS_PER_SOL
      } SOL`
    );
  } catch (err) {
    console.log(err);
  }
};

// Generate another Keypair (account we'll be sending to)
const to = Keypair.generate();

// Extract the public and private key from the (to) keypair
const toPublicKey = new PublicKey(to.publicKey).toString();
const toPrivateKey = to.secretKey;

// Connect to Devnet and Check to see new generated Keypair Public Key
// const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
// console.log('Public key of the generated TO keypair', toPublicKey);

// Get the balance of to (receiver) wallet
const getToWalletBalance = async () => {
  try {
    // Connect to Devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // console.log('Connection object is:', connection);

    // Make a wallet from to (receiver) and get its balance
    const toWallet = await Keypair.fromSecretKey(toPrivateKey);
    const toWalletBalance = await connection.getBalance(
      new PublicKey(toWallet.publicKey)
    );
    console.log(
      `to Wallet balance: ${parseInt(toWalletBalance) / LAMPORTS_PER_SOL} SOL`
    );
  } catch (err) {
    console.log(err);
  }
};

const transferSol = async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Get Keypair from Secret Key
  var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

  // Aidrop 2 SOL to Sender wallet
  console.log('Airdopping some SOL to Sender wallet!');
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log('Airdrop completed for the Sender account');
  await getFromWalletBalance();
  await getToWalletBalance();

  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log('Signature is ', signature);
};

// Show the wallet balance of from and to wallets before and after airdrop to the Sender wallet
const mainFunction = async () => {
  await getFromWalletBalance();
  await getToWalletBalance();
  await transferSol();
  await getFromWalletBalance();
  await getToWalletBalance();
};

mainFunction();
