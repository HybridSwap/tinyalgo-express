//import algosdk from 'algosdk'; //uncomment for testing in command line

const BOOTSTRAP_APP_ARGUMENT = "Ym9vdHN0cmFw"
const BURN_APP_ARGUMENT = "YnVybg=="
const MINT_APP_ARGUMENT = "bWludA=="
const REDEEM_APP_ARGUMENT = "cmVkZWVt"
const SWAP_APP_ARGUMENT = "c3dhcA=="

const bytecode = "BCAIAQAAAwS2jM5BBQYhBSQNRDEJMgMSRDEVMgMSRDEgMgMSRDIEIg1EMwEAMQASRDMBECEHEkQzARiBzfuGpwESRDMBGSISMwEbJRIQNwEaAIAJYm9vdHN0cmFwEhBAAFwzARkjEkQzARuBAhI3ARoAgARzd2FwEhBAAhMzARsiEkQ3ARoAgARtaW50EkABOTcBGgCABGJ1cm4SQAGDNwEaAIAGcmVkZWVtEkACMzcBGgCABGZlZXMSQAJQACEGIQQkIxJNMgQSRDcBGgEXIQUSNwEaAhckEhBEMwIAMQASRDMCECUSRDMCISMSRDMCIiMcEkQzAiMhBxJEMwIkIxJEMwIlgAdUTTFQT09MEkQzAiZRAA2ADVRpbnltYW4gUG9vbCASRDMCJ4ATaHR0cHM6Ly90aW55bWFuLm9yZxJEMwIpMgMSRDMCKjIDEkQzAisyAxJEMwIsMgMSRDMDADEAEkQzAxAhBBJEMwMRIQUSRDMDFDEAEkQzAxIjEkQkIxNAABAzAQEzAgEIMwMBCDUBQgGJMwQAMQASRDMEECEEEkQzBBEkEkQzBBQxABJEMwQSIxJEMwEBMwIBCDMDAQgzBAEINQFCAVQyBCEGEkQ3ARwBMQATRDcBHAEzBBQSRDMCADEAE0QzAhQxABJEMwMAMwIAEkQzAxQzAwczAxAiEk0xABJEMwQAMQASRDMEFDMCABJEMwEBMwQBCDUBQgD8MgQhBhJENwEcATEAE0Q3ARwBMwIUEkQzAxQzAwczAxAiEk03ARwBEkQzAgAxABJEMwIUMwQAEkQzAwAxABJEMwMUMwMHMwMQIhJNMwQAEkQzBAAxABNEMwQUMQASRDMBATMCAQgzAwEINQFCAI4yBCEEEkQ3ARwBMQATRDMCADcBHAESRDMCADEAE0QzAwAxABJEMwIUMwIHMwIQIhJNMQASRDMDFDMDBzMDECISTTMCABJEMwEBMwMBCDUBQgA8MgQlEkQ3ARwBMQATRDMCFDMCBzMCECISTTcBHAESRDMBATMCAQg1AUIAETIEJRJEMwEBMwIBCDUBQgAAMwAAMQATRDMABzEAEkQzAAg0AQ9D"

const bytecode2 = ""

function _base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

const slippage = 0.05


const program = _base64ToArrayBuffer(bytecode)
console.log(program)
const lsig = algosdk.makeLogicSig(program ); 
//const lsig = algosdk.makeLogicSig(program,[algosdk.encodeUint64(350338509),algosdk.encodeUint64(137594422),algosdk.encodeUint64(0)]); 
const TESTNET_VALIDATOR_APP_ID = 21580889
const MAINNET_VALIDATOR_APP_ID = 350338509

const validator_app_id = MAINNET_VALIDATOR_APP_ID;

const liquidity_asset_id = 359370898

var asset_id = 137594422

var user_address = "C5E5W3BERJALL2ZH4YB3TAP7ZSJH2PJUPDHLGF74YE6DBMQ62AA47IXGNQ"

const pool = "F5YT2BPHPNCLHR44ZKWJOE6Z7RMVAZSX4KIWMEBYSKGBFEF7KJJ742QYT4"

var inputIsAlgo = true;
var amount = 20000000;
var asset_out_amount = 0;


const algodClient = new algosdk.Algodv2('', 'https://api.algoexplorer.io/', '');


async function is_opted_in() {
    let optedIn = false;
    try {
        let account_info = await algodClient.accountInformation(user_address).do();
        console.log(account_info);
        account_info['apps-local-state'].forEach(item => {
            if (item['id'] == validator_app_id) {
                optedIn = true;
            }
        })
    }
    catch (error) { console.log(error); return false}
    return optedIn;
}

is_opted_in().then(data => {
    if(!data) {
        console.log('Account not opted into app...')
        /*transaction_group = client.prepare_app_optin_transactions()
        transaction_group.sign_with_private_key(account['address'], account['private_key'])
        result = client.submit(transaction_group, wait=True)
        */
    }
else { console.log(user_address + " is opted in") }
})

async function getPoolInfo(paddress){
    try {
        let account_info = await algodClient.accountInformation(paddress).do();
        console.log(account_info);
        let app_state = account_info['apps-local-state'][0]['key-value']
        console.log(app_state)

        let appObject = {};
        app_state.forEach(item => {
            let key = item.key;
            let value = item.value;
            appObject[key] = value;
        })

        console.log(appObject)
        let reserve1 = appObject["czE="].uint;
        let reserve2 = appObject["czI="].uint;
        if (inputIsAlgo === false){
            let r1 = reserve1;
            reserve1 = reserve2;
            reserve2 = r1;
        }
        let quote = fixedInQuote(amount,reserve1,reserve2)
        console.log(quote)
        return quote
    }
    catch (error) {
        console.log(error);
    }
}

getPoolInfo(pool)

function fixedInQuote(asset_in_amount,output_supply,input_supply){
    let amount_out = (asset_in_amount * 997 * output_supply) / ((input_supply * 1000) + (asset_in_amount * 997))
    asset_out_amount = amount_out;
    return amount_out
}

/* function prepare_swap_transactions_from_quote(quote: SwapQuote, swapper_address=None){
return prepare_swap_transactions(
    amount_in=quote.amount_in_with_slippage,
    amount_out=quote.amount_out_with_slippage,
    swap_type=quote.swap_type,
    swapper_address = user_address,
)
} */




async function prepare_swap_transactions(){

  const SuggestedParams = await algodClient.getTransactionParams().do();
  console.log(SuggestedParams)
  console.log(user_address + " " + pool)
  
  let txns = [
  algosdk.makePaymentTxnWithSuggestedParams(
      user_address,
      pool,
      2000,
      undefined,
      toUintArray('fee'),
      SuggestedParams
  ),
 algosdk.makeApplicationNoOpTxn(
      pool,
      SuggestedParams,
      validator_app_id,
      app_args=[toUintArray('swap'), toUintArray('fi')],
      [user_address],
      undefined,
     [asset_id, liquidity_asset_id],
  ),
  (!inputIsAlgo)?algosdk.makeAssetTransferTxnWithSuggestedParams(
      user_address,
      pool,
      undefined,
      undefined,
      parseInt(amount + (amount * slippage)),
      undefined,
      asset_id,
      SuggestedParams,
  ):algosdk.makePaymentTxnWithSuggestedParams(
      user_address,
      pool,
      parseInt(amount + (amount * slippage)),
      undefined,
      undefined,
      SuggestedParams,
  ),
  (inputIsAlgo)?algosdk.makeAssetTransferTxnWithSuggestedParams(
      pool,
      user_address,
      undefined,
      undefined,
      parseInt(asset_out_amount - (asset_out_amount * slippage)),
      undefined,
      asset_id,
      SuggestedParams,
  ):algosdk.makePaymentTxnWithSuggestedParams(
      pool,
      user_address,
      parseInt(asset_out_amount - (asset_out_amount * slippage)),
      undefined,
      undefined,
      SuggestedParams,
  )
]

txns = algosdk.assignGroupID(txns)

console.log(txns)

//txn_group = TransactionGroup(txns)
//txn_group.sign_with_logicisg(pool_logicsig)
return txns
}

function toUintArray(input){
  return Uint8Array.from(Array.from(input).map(letter => letter.charCodeAt(0)));
}
