# SBT Poap

## flatten
```
npx hardhat flatten ./contracts/Poap.sol > audit/Poap.sol
```


## Commands  

Try running some of the following tasks:

```shell
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node

npx hardhat run scripts/deploy.js --network mumbai
```

## test
```
$ npx hardhat test

  Poap main test
    √ should return correct name (3173ms)
    √ Should check POAPs' vars (178ms)
    √ Should check POAPEvent (175ms)
    √ Should check POAPRole (361ms)
    √ Should check POAPPausable (74ms)
    √ Should check POAP mint (724ms)
    √ Should check POAP transforms (135ms)


  7 passing (5s)

```



## deploy
```
$ npx hardhat run scripts/deploy.js --network mumbai

Contract address: 0x397c584e80e1D2A4Ef0c1434e4e408F2D934fe22

```

