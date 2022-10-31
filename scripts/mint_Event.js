/*

$ npx hardhat run scripts/mint_RNFT.js --network bsctestnet
*/

const { ethers } = require('hardhat');
const contract = require('../artifacts/contracts/Poap.sol/Poap.json');


/*
npx hardhat run scripts/mint_Event.js --network bscTestnet
*/
async function overView() {
  const contractAddress = '0xbe9221D5d9e2e102e70398Db815D518ffa3792ce';
  const poapContract = await ethers.getContractAt(contract.abi, contractAddress);

  //admin
  const adminAddr1 = "0xBd71Ba19e9567E37f9E239Ec6fb2Ea27894bDb2e";
  
  const isamdin =  await poapContract.isAdmin(adminAddr1);
  console.log('isamdin:', isamdin);
     
   //设置admin
  // await poapContract.addAdmin(adminAddr1)

}

overView();
