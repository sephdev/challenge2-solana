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
  194, 194, 192, 65, 138, 244, 89, 50, 23, 119, 123, 216, 208, 71, 242, 39, 202,
  65, 65, 100, 37, 37, 196, 198, 220, 90, 153, 26, 39, 43, 30, 170, 125, 104,
  116, 132, 55, 111, 69, 119, 114, 58, 53, 35, 235, 123, 102, 44, 158, 109, 104,
  126, 134, 15, 137, 59, 192, 119, 40, 60, 192, 189, 14, 240,
]);

// Generate another Keypair (account we'll be sending to)
const to = Keypair.generate();

// Extract the public and private key from the "to" keypair
const toPublicKey = new PublicKey(to.publicKey).toString();
const toPrivateKey = to.secretKey;

// Connect to Devnet and show new generated Keypair (to) Public Key
// const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
// console.log('Public key of generated "to" (Receiver) keypair:', toPublicKey);

// Get the balance of "from" (Sender) wallet
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

// Get the balance of "to" (Receiver) wallet
const getToWalletBalance = async () => {
  try {
    // Connect to Devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // console.log('Connection object is:', connection);

    // Make a wallet from "to" (Receiver) and get its balance
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

// Combine "from" and "to" wallets get-balance-functions
const getAllWalletsBalance = async () => {
  await getFromWalletBalance();
  await getToWalletBalance();
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

  // Get all wallets balances after airdrop completed
  await getAllWalletsBalance();

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

// Show the wallet balance of "from" and "to" wallets
// before and after airdropping SOL to the "from" (Sender) wallet
const mainFunction = async () => {
  await getAllWalletsBalance();
  await transferSol();
  await getAllWalletsBalance();
};

mainFunction();
