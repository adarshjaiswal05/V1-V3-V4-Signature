var web3 = new Web3(window.ethereum);


let sLogin = false
let sMsgsender;

const domainName = "Uniswap V2" 
const domainVersion = "1" 
const chainId = 5 
const contractAddress = "0x12d0648B0E70A1Fc437bbb7396f00B123bB534f3" 


async function loginWithMetaMask() {
	let nId = await web3.eth.net.getId();
	if (nId != 5) {
		userWallet.innerText = "Invalid network please select goeill testnet to continue"
		return console.log("invalid network please select goeill testnet to continue")

	}
	else {

		const sAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
			.catch((e) => {
				console.error(e.message)
				return
			})
		console.log(sAccounts[0])
		if (!sAccounts) { return }
		else {
			loginButton.innerText = 'Sign out of MetaMask'
			userWallet.innerText = sAccounts[0]
			loginButton.onclick = "signOutOfMetaMask()"

			loginButton.removeEventListener('click', loginWithMetaMask)
			setTimeout(() => {
				loginButton.addEventListener('click', signOutOfMetaMask)
			}, 200)
		}
		sLogin = true
		sMsgsender = sAccounts[0];
	}
}
async function signOutOfMetaMask() {
	console.log("sign out called")

	userWallet.innerText = ''
	loginButton.innerText = 'Sign in with MetaMask'

	loginButton.removeEventListener('click', signOutOfMetaMask)
	setTimeout(() => {
		loginButton.addEventListener('click', loginWithMetaMask)
	}, 200)
	


	sLogin = false
	sMsgsender = '';

}

async function signMessage(){
	console.log("called")
	var sMessage = document.getElementById("Message").value;
	let signature = await web3.eth.personal.sign(sMessage,sMsgsender);
	console.log("signature "+ signature);
    splitSignature(signature)
}



function splitSignature(signature)
{


    r = signature.slice(0, 66)
    s = '0x' + signature.slice(66, 130)
    v = '0x' + signature.slice(130, 132)
    v = web3.utils.toDecimal(v)

console.log('R: ' + r);
console.log('S: ' + s);
console.log('V: ' + v);
}


async function verifySignature(message, signature){
    var sMessage = document.getElementById("message").value;
    var sSignature = document.getElementById("signature").value;

   let owner= web3.eth.accounts.recover(sMessage, sSignature);

   console.log(owner)
   
   if (owner.toLowerCase()==sMsgsender.toLowerCase()){
    console.log(true)
}else console.log(false)

}

async function createPermit() {
    var sSpender = document.getElementById("spenderWalletAddress").value;
    var nValue = document.getElementById("amount").value;
    var  nNonce = document.getElementById("nonce").value;
    let spender=sSpender;
    let value=nValue;
    let nonce=nNonce;
    let deadline = Date.now()+1000000000;
    console.log("deadline="+deadline)
    const permit = { owner: sMsgsender, spender, value, nonce, deadline }
    const Permit = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ]

    const domainType = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ]

      const domain = {
        name: domainName,
        version: domainVersion,
        verifyingContract: contractAddress,
        chainId:chainId
      }
    
    
    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            Permit: Permit
        },
        domain: domain,
        primaryType: "Permit",
        message: permit
    });

    const signature = await signTransation(dataToSign)

    console.log("signature="+signature)

    splitSignature(signature)

  }


  async function signTransation ( dataToSign ) {

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
          method: "eth_signTypedData_v3",
          params: [sMsgsender, dataToSign],
          from: sMsgsender
        }, (err, result) => {
          if (err) return reject(err);
          resolve(result.result)
        })
      })
  }





