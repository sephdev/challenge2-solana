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
  144, 223, 113, 181, 168, 15, 197, 155, 168, 112, 153, 252, 171, 241, 70, 199,
  147, 50, 151, 215, 109, 61, 125, 21, 247, 98, 153, 9, 255, 17, 232, 11, 116,
  30, 117, 208, 10, 60, 138, 141, 125, 52, 169, 154, 248, 199, 209, 201, 28,
  235, 57, 201, 175, 231, 202, 83, 98, 1, 54, 216, 146, 136, 244, 246,
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

  // Get all wallets balances
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

// Show the wallet balance of from and to wallets
// before and after airdrop to the Sender wallet
const mainFunction = async () => {
  await getAllWalletsBalance();
  await transferSol();
  await getAllWalletsBalance();
};

mainFunction();
