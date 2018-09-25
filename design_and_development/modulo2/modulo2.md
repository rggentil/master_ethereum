# Módulo 2 - Comunicación y Procesamiento

## Ejercicio 1 - Construya su propia blockchain

Para este ejercicio he utilizado el cliente geth como se indica. He utilizado una VM con Ubuntu 16.04 y el ciente geth es la versión 1.8.15-stable.

Comentar que para este ejercicio me he basado en dos manuales:
https://medium.com/mercuryprotocol/how-to-create-your-own-private-ethereum-blockchain-dad6af82fc9f
https://medium.com/coinmonks/ethereum-setting-up-a-private-blockchain-67bbb96cf4f1

### Inicializar nuestra blockchain

Lo primero, tenemos que configurar nuestro fichero de inicialización json de nuestra blockchain, donde se eligen algunos de los parámetros:

- chainId: id de nuestra blockchain
- allow: si queremos asignar ETHs a alguna cuenta antes de empezar. En nuestro caso asignamos 100000ETH a una cuenta creada anteriormente con MyEtherWallet.
- difficulty: la dificultad para el minado. He dejado el que venía en el ejemplo ya que parece ser lo suficiente bajo para minar fácilmente bloques con mi ordenador.
- gasLimit: el límite de gas, que también lo dejo por defecto.
- el resto de parámetros los he dejado tal como venían ya que no parece que sean demasiado importantes para una blockchain privada.

El fichero de init se encuentra en [init.json](my-own-blockchain/init.json) y lo mostramos a continuación:

```json
{
  "config": {
    "chainId": 1983,
    "homesteadBlock": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0
  },

  "alloc"      : {
     "9ca36bcfed9a328fb0e4cababbacc115344efbd1": { 
          "balance": "100000000000000000000000"
     }
    },
  "difficulty" : "0x400",
  "extraData"  : "",
  "gasLimit"   : "0x2fefd8",
  "nonce"      : "0x0000000000000042",
  "mixhash"    : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "parentHash" : "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp"  : "0x00"
  }
}
```

A continuación iniciamos la blockchain:

```bash
rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/my-own-blockchain$ geth --datadir ./datadir init init.json
INFO [09-11|23:43:03.186] Maximum peer count                       ETH=25 LES=0 total=25
INFO [09-11|23:43:03.191] Allocated cache and file handles         database=/home/rggentil/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/my-own-blockchain/datadir/geth/chaindata cache=16 handles=16
INFO [09-11|23:43:03.207] Writing custom genesis block 
INFO [09-11|23:43:03.208] Persisted trie from memory database      nodes=1 size=150.00B time=80.205µs gcnodes=0 gcsize=0.00B gctime=0s livenodes=1 livesize=0.00B
INFO [09-11|23:43:03.208] Successfully wrote genesis state         database=chaindata                                                                                                                        hash=925efa…87d5c0
INFO [09-11|23:43:03.209] Allocated cache and file handles         database=/home/rggentil/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/my-own-blockchain/datadir/geth/lightchaindata cache=16 handles=16
INFO [09-11|23:43:03.218] Writing custom genesis block 
INFO [09-11|23:43:03.218] Persisted trie from memory database      nodes=1 size=150.00B time=43.771µs gcnodes=0 gcsize=0.00B gctime=0s livenodes=1 livesize=0.00B
INFO [09-11|23:43:03.218] Successfully wrote genesis state         database=lightchaindata                                                                                                                        hash=925efa…87d5c0
```
![alt geth init](my-own-blockchain/img/geth_init.png)

Vamos a crear un par de cuentas en nuestra blockchain

```bash
rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/my-own-blockchain$ geth --datadir ./datadir account new
INFO [09-11|23:45:39.674] Maximum peer count                       ETH=25 LES=0 total=25
Your new account is locked with a password. Please give a password. Do not forget this password.
Passphrase: 
Repeat passphrase: 
Address: {a208f0420f7821fb2d80552c63818a13459e3ce0}

rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/my-own-blockchain$ geth --datadir ./datadir account new
INFO [09-11|23:46:31.961] Maximum peer count                       ETH=25 LES=0 total=25
Your new account is locked with a password. Please give a password. Do not forget this password.
Passphrase: 
Repeat passphrase: 
Address: {c16ffee999b71ff0160f944be4291057b51ddf15}
```

Una vez creadas van a aparecer los ficheros json asociados en el directorio keystores. Además de estas dos direcciones creadas vamos a añadir la que hemos creado anteriormente con MEW, para lo que simplemente copiamos el fichero json que se creaba en este mismo directorio.

Iniciamos la consola de geth para interactuar con nuestra blockchain:
```bash
ggentil@elcid:~/my-own-blockchain$ geth --datadir ./datadir --networkid 1983 console 
INFO [09-11|23:57:43.926] Maximum peer count                       ETH=25 LES=0 total=25
INFO [09-11|23:57:43.927] Starting peer-to-peer node               instance=Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10
INFO [09-11|23:57:43.927] Allocated cache and file handles         database=/home/rggentil/my-own-blockchain/datadir/geth/chaindata cache=768 handles=512
INFO [09-11|23:57:43.945] Initialised chain configuration          config="{ChainID: 1983 Homestead: 0 DAO: <nil> DAOSupport: false EIP150: <nil> EIP155: 0 EIP158: 0 Byzantium: 0 Constantinople: <nil> Engine: unknown}"
INFO [09-11|23:57:43.945] Disk storage enabled for ethash caches   dir=/home/rggentil/my-own-blockchain/datadir/geth/ethash count=3
INFO [09-11|23:57:43.945] Disk storage enabled for ethash DAGs     dir=/home/rggentil/.ethash                               count=2
INFO [09-11|23:57:43.945] Initialising Ethereum protocol           versions="[63 62]" network=1983
INFO [09-11|23:57:43.945] Loaded most recent local header          number=0 hash=925efa…87d5c0 td=1024
INFO [09-11|23:57:43.945] Loaded most recent local full block      number=0 hash=925efa…87d5c0 td=1024
INFO [09-11|23:57:43.945] Loaded most recent local fast block      number=0 hash=925efa…87d5c0 td=1024
INFO [09-11|23:57:43.945] Loaded local transaction journal         transactions=0 dropped=0
INFO [09-11|23:57:43.945] Regenerated local transaction journal    transactions=0 accounts=0
INFO [09-11|23:57:43.945] Starting P2P networking 
INFO [09-11|23:57:46.075] UDP listener up                          self=enode://2a9f35083af56160d3d7940dab3112fbdf946246af32953da5376f5f1be16374d00c6f23d0977ae3cc5602be8c216607ddbcc84ad774dbd3ea4400710b917424@[::]:30303
INFO [09-11|23:57:46.076] IPC endpoint opened                      url=/home/rggentil/my-own-blockchain/datadir/geth.ipc
INFO [09-11|23:57:46.082] RLPx listener up                         self=enode://2a9f35083af56160d3d7940dab3112fbdf946246af32953da5376f5f1be16374d00c6f23d0977ae3cc5602be8c216607ddbcc84ad774dbd3ea4400710b917424@[::]:30303
Welcome to the Geth JavaScript console!

instance: Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10
INFO [09-11|23:57:46.189] Etherbase automatically configured       address=0xa208f0420f7821FB2D80552C63818a13459e3ce0
coinbase: 0xa208f0420f7821fb2d80552c63818a13459e3ce0
at block: 0 (Thu, 01 Jan 1970 01:00:00 CET)
 datadir: /home/rggentil/my-own-blockchain/datadir
 modules: admin:1.0 debug:1.0 eth:1.0 ethash:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

>
>
```

Tengo que comentar antes que había tenido problemas a la hora de arrancar la consola porque me salía el siguiente error:
```
Fatal: Error starting protocol stack: listen unix /home/rggentil/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/my-own-blockchain/datadir/geth.ipc: bind: invalid argument
```
Buscando por Internet he leído que parece ser que no puede funcionar bien si utilizamos path muy largos por asunto de crear el socket de Unix. El caso que moviéndome a un path más corto funciona correctamente.


### Consultar nuestra blockchain

Una vez arrancada la consola procedemos a realizar algunas acciones de consulta, como ver las cuentas que tenemos y sus balances.

```bash
> eth.accounts
["0x9ca36bcfed9a328fb0e4cababbacc115344efbd1", "0xa208f0420f7821fb2d80552c63818a13459e3ce0", "0xc16ffee999b71ff0160f944be4291057b51ddf15"]
> eth.accounts[0]
"0x9ca36bcfed9a328fb0e4cababbacc115344efbd1"
> eth.getBalance(eth.accounts[0])
1e+23
> web3.fromWei(eth.getBalance(eth.accounts[0]))
100000
```

Como podemos ver tenemos las tres cuentas que esperábamos y además una de ellas es la que tiene la cantidad de 100000 ETH que la habíamos asignado en el fichero init.json

Veamos el estado de nuestra blockchain:

```bash
> eth.blockNumber
0
> eth.getBlock(0)
{
  difficulty: 1024,
  extraData: "0x",
  gasLimit: 3141592,
  gasUsed: 0,
  hash: "0x925efae6cc75044727e0c4f260f7ae024b45974b5f70066e838c93b8ba87d5c0",
  logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  miner: "0x0000000000000000000000000000000000000000",
  mixHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  nonce: "0x0000000000000042",
  number: 0,
  parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  receiptsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  size: 506,
  stateRoot: "0xaecc4f5c1fe7c8d6670f951f0e47ba3b94d0a21d457a03b682fb9e800182c5d4",
  timestamp: 0,
  totalDifficulty: 1024,
  transactions: [],
  transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  uncles: []
}
```
Consultamos la altura de bloque que es 0. Acabamos de arrancar la blockchain y además no se está minando actualmente por lo que es lo esperado. Como vemos podemos consultar dicho bloque.

### Minando nuestra blockchain

Ahora vamos a proceder con el minado

```bash
> miner.setEtherbase(web3.eth.accounts[0])
true
> eth.coinbase
"0xa208f0420f7821fb2d80552c63818a13459e3ce0"
```

Primero vamos a fijar la dirección de coinbase, que será donde se envíen los ethers de minado, a la misma dirección preconfigurada. A continuación arrancamos el minado:

```bash
> miner.start(1)
INFO [09-12|00:11:14.543] Updated mining threads                   threads=1
INFO [09-12|00:11:14.543] Transaction pool price threshold updated price=1000000000
null
> INFO [09-12|00:11:14.543] Commit new mining work                   number=1 sealhash=1fbca2…b03ccc uncles=0 txs=0 gas=0 fees=0 elapsed=131.907µs
INFO [09-12|00:11:17.481] Generating DAG in progress               epoch=0 percentage=0 elapsed=2.264s
INFO [09-12|00:11:19.722] Generating DAG in progress               epoch=0 percentage=1 elapsed=4.506s
INFO [09-12|00:11:22.032] Generating DAG in progress               epoch=0 percentage=2 elapsed=6.816s
...
...
INFO [09-12|00:15:58.538] Generating DAG in progress               epoch=0 percentage=98 elapsed=4m43.322s
INFO [09-12|00:16:01.275] Generating DAG in progress               epoch=0 percentage=99 elapsed=4m46.058s
INFO [09-12|00:16:01.277] Generated ethash verification cache      epoch=0 elapsed=4m46.060s
INFO [09-12|00:16:03.431] Successfully sealed new block            number=1 sealhash=1fbca2…b03ccc hash=d94a8c…75ef6b elapsed=4m48.887s
INFO [09-12|00:16:03.431] 🔨 mined potential block                  number=1 hash=d94a8c…75ef6b
INFO [09-12|00:16:03.431] Commit new mining work                   number=2 sealhash=a4d8c0…5230ae uncles=0 txs=0 gas=0 fees=0 elapsed=85.36µs
INFO [09-12|00:16:05.853] Successfully sealed new block            number=2 sealhash=a4d8c0…5230ae hash=abab1c…40340e elapsed=2.422s
INFO [09-12|00:16:05.853] 🔨 mined potential block                  number=2 hash=abab1c…40340e
INFO [09-12|00:16:05.873] Commit new mining work                   number=3 sealhash=9207a9…1b253d uncles=0 txs=0 gas=0 fees=0 elapsed=406.01µs
INFO [09-12|00:16:06.227] Generating DAG in progress               epoch=1 percentage=0  elapsed=4.199s
INFO [09-12|00:16:09.969] Generating DAG in progress               epoch=1 percentage=1  elapsed=7.942s
INFO [09-12|00:16:13.609] Generating DAG in progress               epoch=1 percentage=2  elapsed=11.582s
INFO [09-12|00:16:13.844] Successfully sealed new block            number=3 sealhash=9207a9…1b253d hash=38780e…e5a5a3 elapsed=7.970s
INFO [09-12|00:16:13.844] 🔨 mined potential block                  number=3 hash=38780e…e5a5a3
INFO [09-12|00:16:13.844] Commit new mining work                   number=4 sealhash=fa1d4e…75a65f uncles=0 txs=0 gas=0 fees=0 elapsed=88.369µs
INFO [09-12|00:16:17.750] Generating DAG in progress               epoch=1 percentage=3  elapsed=15.723s
INFO [09-12|00:16:21.809] Generating DAG in progress               epoch=1 percentage=4  elapsed=19.782s
INFO [09-12|00:16:23.612] Successfully sealed new block            number=4 sealhash=fa1d4e…75a65f hash=9a684e…486f42 elapsed=9.767s
INFO [09-12|00:16:23.612] 🔨 mined potential block                  number=4 hash=9a684e…486f42
...
```

Tarda casi 5 minutos en empezar a minar ya que durante este rato está con la acción de generar el DAG. Posteriormente se van creando bloques rápidamente en menos de unos 10 segundos, ya que la dificultad que habíamos seleccionado era baja.

![alt Minando en nuestra blockchain](my-own-blockchain/img/geth_mining.png)

Dejamos de minar con `miner.stop()` y consultamos de nuevo la altura de la blockchain:

```bash
> eth.blockNumber
23
> web3.fromWei(eth.getBalance(eth.accounts[0]))
100069
```

Observamos dos cosas: que se han minado 23 bloques y que el saldo de nuestra cuenta ha ascendido en 69 ethers, lo que significa que estamos ganando 3 eth por cada bloque minado (esto no es configurable en el init.json si no en el código del propio cliente de geth).

### Emitir transferencias

Para emitir transferencias dentro de nuestra blockchain lo podemos hacer utilizando la función sendTransaction, aunque de primeras nos vamos a encontrar un error debido a que tenemos que desbloquear nuestra cuenta. Una vez desbloqueda podemos enviar la transacción, que en este caso lo haremos desde la cuenta coinbase a otra de las creadas anteriormente:

```bash
> eth.sendTransaction({from:eth.accounts[0], to:eth.accounts[1], value: web3.toWei(500)})
Error: authentication needed: password or unlock
    at web3.js:3143:20
    at web3.js:6347:15
    at web3.js:5081:36
    at <anonymous>:1:1
> personal.unlockAccount(eth.accounts[0], "mortadelo")
true
> eth.sendTransaction({from:eth.accounts[0], to:eth.accounts[1], value: web3.toWei(500)})
INFO [09-12|08:55:59.681] Submitted transaction                    fullhash=0xb4d7cda5014ad823792bbf2b918769fc71fb156f89be10b9afe5d5beb3e05879 recipient=0xa208f0420f7821FB2D80552C63818a13459e3ce0
"0xb4d7cda5014ad823792bbf2b918769fc71fb156f89be10b9afe5d5beb3e05879"
> 
```

Una vez realizada la transacción obtenemos su hash. Si vamos a consultar de nuevo los saldos veremos que no han cambiado como a lo mejor esperaríamos. Esto es debido a que esta transacción no ha sido minada, ya que el minado estaba parado. Si queremos que se realice con éxito debemos minar de nuevo:

```bash
> miner.start(1)
INFO [09-12|08:56:09.285] Updated mining threads                   threads=1
INFO [09-12|08:56:09.285] Transaction pool price threshold updated price=1000000000
null
> INFO [09-12|08:56:09.285] Commit new mining work                   number=60 sealhash=cd05a6…95f789 uncles=0 txs=0 gas=0     fees=0       elapsed=126.218µs
INFO [09-12|08:56:09.287] Commit new mining work                   number=60 sealhash=fbc2d8…3d0fee uncles=0 txs=1 gas=21000 fees=2.1e-05 elapsed=1.910ms
INFO [09-12|08:56:14.523] Successfully sealed new block            number=60 sealhash=fbc2d8…3d0fee hash=e37739…1b8de8 elapsed=5.238s
INFO [09-12|08:56:14.523] 🔗 block reached canonical chain          number=53 hash=a756ad…8db70e
INFO [09-12|08:56:14.523] 🔨 mined potential block                  number=60 hash=e37739…1b8de8
```

Podemos ver que en la instrucción de "Commit new mining work" del bloque 60 hay una transacción (`txs=1`). Ahora sí podemos ver el saldo esperado en las cuentas y además podemos consultar tanto la transacción como verla en el bloque 60:

```bash
> web3.fromWei(eth.getBalance(eth.accounts[1]))
500
> web3.fromWei(eth.getBalance(eth.accounts[0]))
99701
> 
> eth.getTransaction("0xb4d7cda5014ad823792bbf2b918769fc71fb156f89be10b9afe5d5beb3e05879")
{
  blockHash: "0xe377399c334dd6d2b03bd58f236258e9b14c4218cc8eee8a4372bb0de71b8de8",
  blockNumber: 60,
  from: "0x9ca36bcfed9a328fb0e4cababbacc115344efbd1",
  gas: 90000,
  gasPrice: 1000000000,
  hash: "0xb4d7cda5014ad823792bbf2b918769fc71fb156f89be10b9afe5d5beb3e05879",
  input: "0x",
  nonce: 1,
  r: "0x7b4cf59c273dade2a7d1bf5d0090961c4331cbff6232015ee35a43d10a611aab",
  s: "0x3bf80bb90ffe2509d219ff6577ebce075c0b7c47a59227a57314b1e287009929",
  to: "0xa208f0420f7821fb2d80552c63818a13459e3ce0",
  transactionIndex: 0,
  v: "0xfa2",
  value: 500000000000000000000
}
> eth.getBlock(60)
{
  difficulty: 131072,
  extraData: "0xd68301080f846765746886676f312e3130856c696e7578",
  gasLimit: 3330981,
  gasUsed: 21000,
  hash: "0xe377399c334dd6d2b03bd58f236258e9b14c4218cc8eee8a4372bb0de71b8de8",
  logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  miner: "0x9ca36bcfed9a328fb0e4cababbacc115344efbd1",
  mixHash: "0x58153213fc51c9333f4a8667a035c00e411f8a9a44a383c696ee3aa620b5ee61",
  nonce: "0x12f26eaa74cf0a6a",
  number: 60,
  parentHash: "0x5f11df411df374beef98f5501d42edbe4ffb136f3a517cf667b15a50110e9060",
  receiptsRoot: "0x056b23fbba480696b65fe5a59b8f2148a1299103c4f57df839233af2cf4ca2d2",
  sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  size: 650,
  stateRoot: "0x0043aa6f8a6554a6df69bb31191f932f2e651f3039dbb07f082052f53d89a04a",
  timestamp: 1536735369,
  totalDifficulty: 7909952,
  transactions: ["0xb4d7cda5014ad823792bbf2b918769fc71fb156f89be10b9afe5d5beb3e05879"],
  transactionsRoot: "0x6cff4d06a801fd2111589be82834b55b4821370d273c4465a51e4b193b38c447",
  uncles: []
}
> 
```

![alt Sending tx](my-own-blockchain/img/geth_sendtx.png)

### Añadiendo nuevos peers

A continuación vamos a intentar añadir nuevos pares a nuestra red blockchain. Primero inicializamos igual que antes utilizando el mismo fichero init.json pero ahora eligiendo un nuevo directorio. Luego arrancamos la consola con el mismo network id y utilizando un puerto difrerente:

```bash
rggentil@elcid:~/my-own-blockchain$ geth --datadir datadir_2 --networkid 1983 --port 30304    console
INFO [09-12|11:11:27.796] Maximum peer count                       ETH=25 LES=0 total=25
INFO [09-12|11:11:27.796] Starting peer-to-peer node               instance=Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10
INFO [09-12|11:11:27.796] Allocated cache and file handles         database=/home/rggentil/my-own-blockchain/datadir_2/geth/chaindata cache=768 handles=512
INFO [09-12|11:11:27.830] Initialised chain configuration          config="{ChainID: 1983 Homestead: 0 DAO: <nil> DAOSupport: false EIP150: <nil> EIP155: 0 EIP158: 0 Byzantium: 0 Constantinople: <nil> Engine: unknown}"
INFO [09-12|11:11:27.830] Disk storage enabled for ethash caches   dir=/home/rggentil/my-own-blockchain/datadir_2/geth/ethash count=3
INFO [09-12|11:11:27.830] Disk storage enabled for ethash DAGs     dir=/home/rggentil/.ethash                                 count=2
INFO [09-12|11:11:27.830] Initialising Ethereum protocol           versions="[63 62]" network=1983
INFO [09-12|11:11:27.831] Loaded most recent local header          number=0 hash=925efa…87d5c0 td=1024
INFO [09-12|11:11:27.831] Loaded most recent local full block      number=0 hash=925efa…87d5c0 td=1024
INFO [09-12|11:11:27.831] Loaded most recent local fast block      number=2 hash=abab1c…40340e td=263168
INFO [09-12|11:11:27.831] Loaded local transaction journal         transactions=0 dropped=0
INFO [09-12|11:11:27.831] Regenerated local transaction journal    transactions=0 accounts=0
INFO [09-12|11:11:27.832] Starting P2P networking 
INFO [09-12|11:11:29.972] UDP listener up                          self=enode://08c12e01c6a030839d32894f1c60635ae33ffb1bfe00243e12aae1260c6446e77461108cf698cd36a8cfcb5b0b7b09703c4f4b18f5299a21d584f8bbbf9a71a9@[::]:30304
INFO [09-12|11:11:29.975] RLPx listener up                         self=enode://08c12e01c6a030839d32894f1c60635ae33ffb1bfe00243e12aae1260c6446e77461108cf698cd36a8cfcb5b0b7b09703c4f4b18f5299a21d584f8bbbf9a71a9@[::]:30304
INFO [09-12|11:11:29.982] IPC endpoint opened                      url=/home/rggentil/my-own-blockchain/datadir_2/geth.ipc
Welcome to the Geth JavaScript console!

instance: Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10
 modules: admin:1.0 debug:1.0 eth:1.0 ethash:1.0 miner:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0
```

Una vez arrancada añadimos el nuevo peer con el identificador *enode* del primer nodo que hemos obtenido con `admin.nodeInfo`. Pero como vamos a ver no ha ido tal como esperaba:

```bash
> admin.addPeer("enode://2a9f35083af56160d3d7940dab3112fbdf946246af32953da5376f5f1be16374d00c6f23d0977ae3cc5602be8c216607ddbcc84ad774dbd3ea4400710b917424@127.0.0.1:30303")
true
> INFO [09-12|11:06:58.514] Block synchronisation started 
INFO [09-12|11:06:58.534] Imported new block headers               count=0 elapsed=3.784ms number=67 hash=75a90d…53f2e4 ignored=67
INFO [09-12|11:06:58.539] Imported new block receipts              count=0 elapsed=80.657µs number=2  hash=abab1c…40340e size=0.00B ignored=2
WARN [09-12|11:06:58.541] Node data write error                    err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
WARN [09-12|11:06:58.543] Synchronisation failed, retrying         err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
INFO [09-12|11:07:08.530] Imported new block headers               count=0 elapsed=5.378ms  number=67 hash=75a90d…53f2e4 ignored=67
INFO [09-12|11:07:08.536] Imported new block receipts              count=0 elapsed=40.742µs number=2  hash=abab1c…40340e size=0.00B ignored=2
WARN [09-12|11:07:08.537] Node data write error                    err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
WARN [09-12|11:07:08.537] Synchronisation failed, retrying         err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
INFO [09-12|11:07:18.524] Imported new block headers               count=0 elapsed=2.582ms  number=67 hash=75a90d…53f2e4 ignored=67
INFO [09-12|11:07:18.528] Imported new block receipts              count=0 elapsed=36.687µs number=2  hash=abab1c…40340e size=0.00B ignored=2
WARN [09-12|11:07:18.529] Node data write error                    err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
WARN [09-12|11:07:18.529] Synchronisation failed, retrying         err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
INFO [09-12|11:07:28.538] Imported new block headers               count=0 elapsed=4.545ms  number=67 hash=75a90d…53f2e4 ignored=67
INFO [09-12|11:07:28.542] Imported new block receipts              count=0 elapsed=48.382µs number=2  hash=abab1c…40340e size=0.00B ignored=2
WARN [09-12|11:07:28.543] Node data write error                    err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
WARN [09-12|11:07:28.544] Synchronisation failed, retrying         err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"
INFO [09-12|11:07:38.516] Imported new block headers               count=0 elapsed=1.884ms  number=67 hash=75a90d…53f2e4 ignored=67
INFO [09-12|11:07:38.519] Imported new block receipts              count=0 elapsed=24.52µs  number=2  hash=abab1c…40340e size=0.00B ignored=2
WARN [09-12|11:07:38.519] Node data write error                    err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"

> admin.peers
[{
    caps: ["eth/62", "eth/63"],
    id: "2a9f35083af56160d3d7940dab3112fbdf946246af32953da5376f5f1be16374d00c6f23d0977ae3cc5602be8c216607ddbcc84ad774dbd3ea4400710b917424",
    name: "Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10",
    network: {
      inbound: false,
      localAddress: "127.0.0.1:50402",
      remoteAddress: "127.0.0.1:30303",
      static: true,
      trusted: false
    },
    protocols: {
      eth: {
        difficulty: 8829248,
        head: "0x75a90d040e986f7b527afda40c6472cc84724c0a69e04b22495469a90a53f2e4",
        version: 63
      }
    }
}]

> eth.syncing
{
  currentBlock: 2,
  highestBlock: 67,
  knownStates: 3,
  pulledStates: 3,
  startingBlock: 0
}

> eth.blockNumber
0

```

Trata de sincronizar pero desde el primer momento sale el siguiente error continuamente: `Node data write error                    err="state node 5fee44…ce5a0e failed with all peers (1 tries, 1 peers)"`
Podemos observar que con `admin.peers` sí que vemos que tiene un nodo pero no consigue sincronizarse y se mantiene en el bloque 0.

He intentado buscar información pero no he conseguido nada relevante que alclare esta duda particular. Así que misión fallida al tratar de sincronizar nodos.


### Metamask con nuestra blockchain

Por últumo he usado Metamask para utilizar nuestra blockchain. Primero tenemos que conectar Metamask con localhost 8545 que es nuestra blockchain privada. Para importar las cuentas lo que he hecho es importar en MyEtherWallet el UTC json que se encuentran en keystore, para posteriormente ver ahí la clave privada, que la podremos importar en Metamask. Importo dos cuentas así y hago una transferencia en Metamask entre ellas. La transferencia no se realiza debido a que no estaba minando en geth console. Nos ponemos a minar y vemos que efectivamente nos sale el aviso de que la transferencia se ha realizado correctamente y los saldos de las cuentas se actualizan.

![alt Metamask-geth](my-own-blockchain/img/metamask_geth.png)

## Ejercicio 2 - Sincronización con Rinkeby

Para sincronizarnos con Rinkeby vamos a utilizar de nuevo geth, eligiendo la opción `--rinkeby` para que sincronice con dicha red. Aunque las testsnets son más pequeñas que la red principal de Ethereum igualmente ocupa varios gigas, así que vamos a tratar de hacerlo más ligero. Observando las opciones de geth vemos que existen tres opciones a la hora de sincronizar:

- Full: Descarga todos los bloques y valida tododo desde el bloque génesis.

- Fast: Descarga todos lo bloques pero solo procesa las transacciones desde el bloque actual a 64 bloques antes, a partir de aquí se comporta con una sincronización full. Por lo tanto como su nombre indica es más rápido y ocupará menos.

- Light: obtiene solamente el estado actual y a la hora de verificar transacciones tiene que preguntar a nodos completos, de manera similar a como funciona un light node en Bitcoin. Por lo tanto será el más rápido y el que menos ocupa.

Primero vamos a probar con el modo "light":

```bash
rggentil@elcid:~/sync_rinkeby$ geth --rinkeby --syncmode "light"
INFO [09-12|23:28:52.013] Maximum peer count                       ETH=0 LES=100 total=25
INFO [09-12|23:28:52.017] Starting peer-to-peer node               instance=Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10
INFO [09-12|23:28:52.017] Allocated cache and file handles         database=/home/rggentil/.ethereum/rinkeby/geth/lightchaindata cache=768 handles=512
INFO [09-12|23:28:52.046] Writing custom genesis block 
INFO [09-12|23:28:52.057] Persisted trie from memory database      nodes=355 size=51.91kB time=2.385711ms gcnodes=0 gcsize=0.00B gctime=0s livenodes=1 livesize=0.00B
INFO [09-12|23:28:52.058] Initialised chain configuration          config="{ChainID: 4 Homestead: 1 DAO: <nil> DAOSupport: true EIP150: 2 EIP155: 3 EIP158: 3 Byzantium: 1035301 Constantinople: <nil> Engine: clique}"
INFO [09-12|23:28:52.061] Added trusted checkpoint                 chain=rinkeby block=2818047 hash=92cfa6…89d64d
INFO [09-12|23:28:52.061] Loaded most recent local header          number=0 hash=6341fd…67e177 td=1
INFO [09-12|23:28:52.062] Starting P2P networking 
INFO [09-12|23:28:54.165] UDP listener up                          net=enode://652937370eb65d690435007598d779429754bffb5ade320d0e0081a2697c0a78bdd2c2097ce164b41b9d45020575fd991b69aca5fafb4f8feb0baa5a75fecded@[::]:30303
WARN [09-12|23:28:54.172] Light client mode is an experimental feature 
INFO [09-12|23:28:54.173] RLPx listener up                         self="enode://652937370eb65d690435007598d779429754bffb5ade320d0e0081a2697c0a78bdd2c2097ce164b41b9d45020575fd991b69aca5fafb4f8feb0baa5a75fecded@[::]:30303?discport=0"
INFO [09-12|23:28:54.180] IPC endpoint opened                      url=/home/rggentil/.ethereum/rinkeby/geth.ipc
INFO [09-12|23:29:30.862] Updated latest header based on CHT       number=2790000 hash=f28854…e567ea
INFO [09-12|23:29:30.863] Block synchronisation started 
INFO [09-12|23:29:35.915] Stored checkpoint snapshot to disk       number=2790000 hash=f28854…e567ea
INFO [09-12|23:29:36.004] Imported new block headers               count=192 elapsed=92.435ms number=2790192 hash=ae0dc1…206f3b ignored=0
INFO [09-12|23:29:37.393] Imported new block headers               count=192 elapsed=66.626ms number=2790384 hash=da90e1…962f2d ignored=0
INFO [09-12|23:29:39.905] Imported new block headers               count=192 elapsed=72.030ms number=2790576 hash=2664f5…5af20a ignored=0
INFO [09-12|23:29:43.878] Imported new block headers               count=192 elapsed=62.526ms number=2790768 hash=084796…3cc64d ignored=0
INFO [09-12|23:29:45.408] Imported new block headers               count=192 elapsed=61.068ms number=2790960 hash=753daa…9a9fbc ignored=0
INFO [09-12|23:29:45.777] Imported new block headers               count=192 elapsed=82.898ms number=2791152 hash=450b27…5e093f ignored=0
```

Es bastante rápido y en pocos minutos tenemos un nodo disponible para poder trabajar:

```bash
rggentil@elcid:~/sync_rinkeby$ geth --datadir=$HOME/.ethereum/rinkeby attach ipc:$HOME/.ethereum/rinkeby/geth.ipc console
Welcome to the Geth JavaScript console!

instance: Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10
 modules: admin:1.0 debug:1.0 eth:1.0 net:1.0 personal:1.0 rpc:1.0 txpool:1.0 web3:1.0

> eth.blockNumber
2977436
> eth.blockNumber
2977452
```

Ocupa poco espacio como podemos ver:

```bash
rggentil@elcid:~$ du -sh .ethereum/rinkeby/
132M	.ethereum/rinkeby/
```

También para poder utilizar este testnet voy a importar una cuenta que tenía en Metamask antetiormente con varios ETH en Rinkeby. Para ello sacamo la clave privada desde MEW, una vez que importamos con la seed words y la añadimos a geth:

```bash
> personal.importRawKey("eeccc87c8bd7a9c74b887abe402828e78c50badc6bc35596f216471006648d3c", "mortadelo")
"0x5a35af8f8b4283cf6a6407852d8bdab19456c118"
> 
> 
> eth.accounts
["0x5a35af8f8b4283cf6a6407852d8bdab19456c118"]
> web3.fromWei(eth.getBalance(eth.accounts[0]))
3.06602782
```

### Obtener el bloque génesis
Como nos piden obtenerlo no utilizando `eth.getBlock(0)` vamos a utilizar otro comando equivalente:

```bash
> eth.getBlock("earliest")
{
  difficulty: 1,
  extraData: "0x52657370656374206d7920617574686f7269746168207e452e436172746d616e42eb768f2244c8811c63729a21a3569731535f067ffc57839b00206d1ad20c69a1981b489f772031b279182d99e65703f0076e4812653aab85fca0f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  gasLimit: 4700000,
  gasUsed: 0,
  hash: "0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177",
  logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  miner: "0x0000000000000000000000000000000000000000",
  mixHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  nonce: "0x0000000000000000",
  number: 0,
  parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
  receiptsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  size: 666,
  stateRoot: "0x53580584816f617295ea26c0e17641e0120cab2f0a8ffb53a866fd53aa8e8c2d",
  timestamp: 1492009146,
  totalDifficulty: 1,
  transactions: [],
  transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  uncles: []
}
```

La dirección del bloque génesis de Rinkeby es `0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177`

### Obtener la cantidad de peers conectados
El comando para observar este dato es `net.peerCount`. Comentar que al utilizar un light node hay algunos nodos que no se quieren conectar con este tipo de nodos, ya que les saturan, y lo que vemos con este comando es que va variando entre 0 y 2. Por lo que he podido mirar se recomienda para un light node añadir nodos a mano que parecen que sí que aceptan conexiones de light nodes (buscar en Google simplente "rinkeby nodes"). Por lo que he añadido los siguientes a mano:

```bash
> admin.addPeer("enode://1afcc068e3cd1f63ba9c303923c0f71cf1f0b8da4bfc58a7722243761b93d4a9febf77ffa15f60be6d6a90775880b620103bc65fd0db25973884dc819bd39208@121.140.198.92:30303");
true
> admin.addPeer("enode://3a2223f314b225978db3d284ece24d69f5752cefa229b7bc83b38fd5577975655e99d63d00bdec144dab2f3445378af2cd4a61d86d13727f870298444964a494@188.24.82.232:30305");
true
> admin.addPeer("enode://3a66898cf7497667c00bef21ddfae2166d227663fb20c9eebf9880ba15a41b3766b4e489a021f00f62042f44a4c203ee4b097ebc8d9da18319b486855af96d34@54.147.215.74:30303");
true
> admin.addPeer("enode://4192a9a8c893c2105bd388ca241333025dca8a989aeb86872ee5722a525d443e01ea2941318e8f1c303e6b3de6aa77ab62ce6538703bf6ace1cdc9e263e5168d@13.88.23.144:30303");
true
> admin.addPeer("enode://483c1910a306d333e3d94b2be55505a085dab2c242d55ed35022126ec5c8f3e15d54445367ad850e67b5048a6ad93fda2c77352acaee552a16ecdf9fe6ce73d4@188.24.97.9:40404");
true
> admin.addPeer("enode://518e25245fd8ce9328e07851a3c3c551d5ecab4419f2d6ff8beef5dda52fa28eddc72aec9bf518d04ccfe6fbeb715ccb9ced911f0b30394006873602bf9a06e4@192.99.14.22:30303");
true
> admin.addPeer("enode://69a38efbaf80b3e3a4bdee0ddfbb0ed944def83ed03dc15e4a5c2a0535c7492f9449f80527be8f3b286448d2886db02b6bf6ca23aaf3e7cb156994c194900724@34.207.245.10:30303");
true
> admin.addPeer("enode://98267578205c68fc09e917e67606d8cd6fefd3be84a17c26a9840af003fc8659bfdaf77128f22216aeeeee8d3ddd3470297d9a8b8c9581d31560f1a2b0964334@34.210.38.180:30303");
true
> admin.addPeer("enode://99764a629be40e243830c5c62ee899d8729df5de37121922e779367d168fdf57a8cb5bca06227342111c29bc9cd65f74c5b24a77dd70ae0eac94b15ae420e015@40.69.205.164:30303");
true
> admin.addPeer("enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303");
true
> admin.addPeer("enode://a8bb9e486c070a903a3bab33acee1df7780342fc57f308aacac6205a12566bab258077a5d519135ec38314d6bbccf16f57f1e036546418e8da6c9c186ce5a364@64.131.160.31:30304");
true
> admin.addPeer("enode://e2f33c1371ed97ccae5db4d047fed2bb0703ba414f63cfca81041b6fe1b06a636352a81e2da27937357db0ffc516ee03b08f2559a2cfcf1908792a6e0db8a4f8@54.89.154.66:30303");
true
> admin.addPeer("enode://f11c5bc2250e283f7a67dd5a0430216a53191b4e81ff9af698ce2adbe51f1833a4a7bd5d4d81b705c9f246123a0866bf64e33eb1c57057b1dbb43fd0a78e0b3a@172.245.14.179:30303");
true
> admin.addPeer("enode://fa32a124b9d080d30e660fe39533d35b42920e764c43e394d7c1e4d15d11c5473e10d5ab399d82279e969049c7009adaa79e803dbb3a645d695bf5db470d8e58@192.99.56.167:30303");
true
```

Los nodos que finalmente quedan conectados son solo 3, de los cuales solo uno es de los que he añadido a mano, por lo que no me queda muy claro que realmente acepten light nodes:

```bash
> net.peerCount
3
```

#### Obtener información de los peers conectados

Para obtener esta informaición:

```bash
> admin.peers
[{
    caps: ["eth/62", "eth/63", "les/1", "les/2"],
    id: "a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf",
    name: "Geth/v1.8.14-unstable-c376a526/linux-amd64/go1.10.3",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:40430",
      remoteAddress: "52.169.42.101:30303",
      static: true,
      trusted: false
    },
    protocols: {
      les: {
        difficulty: 5540568,
        head: "16e91e88c047561bf369665fa4d5ffee2be6f8b2a91aa6095b93b0a60d52ffee",
        version: 2
      }
    }
}, {
    caps: ["eth/62", "eth/63", "les/1", "les/2"],
    id: "a9ed8d7b0cafdc2a30813b0758febe6e94d2a3a625644b6b5854d4463083b060de0bfbf1681811432487c761064c13d854e33ce203b964e28fea3fb866345fde",
    name: "Geth/v1.8.15-stable-89451f7c/linux-amd64/go1.10",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:57570",
      remoteAddress: "138.197.108.157:30303",
      static: true,
      trusted: false
    },
    protocols: {
      les: {
        difficulty: 5540585,
        head: "4c575a19091b2c9d53bc132e05cbbaa8410f1c96512b38928d94791eee58e051",
        version: 2
      }
    }
}, {
    caps: ["eth/62", "eth/63", "les/1", "les/2"],
    id: "b6b28890b006743680c52e64e0d16db57f28124885595fa03a562be1d2bf0f3a1da297d56b13da25fb992888fd556d4c1a27b1f39d531bde7de1921c90061cc6",
    name: "Geth/v1.8.16-unstable-62e94895/linux-amd64/go1.11",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:44332",
      remoteAddress: "159.89.28.211:30303",
      static: true,
      trusted: false
    },
    protocols: {
      les: {
        difficulty: 5540585,
        head: "4c575a19091b2c9d53bc132e05cbbaa8410f1c96512b38928d94791eee58e051",
        version: 2
      }
    }
}]
```

Lo que no me queda claro es cómo obtener la altura máxima de bloque de mis peers, ya que en la anterior consulta no viene ese dato como tal y no veo ningún otro comando. Entiendo que su altura máxima debería de ser la misma que la que tengo yo ya que con los pares con los que estoy sincronizado.