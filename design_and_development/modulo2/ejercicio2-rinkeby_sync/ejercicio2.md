# Módulo 2 - Ejercicio 2 - Comunicación y Procesamiento

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

### Sincronizando con modo "fast"

Con el propósito de probar geth he sincronizado también con la opción fast para comparar. Lo primero que vemos es que el proceso es más lento ya que con la opción por defecto en mi VM con Ubuntu tarda más de una hora, unos 80 minutos. Además el tamaño es mayor llegando a unos 9.5GB.

Podemos ver como va sincronizando:

```bash
> eth.syncing
{
  currentBlock: 1848734,
  highestBlock: 2979761,
  knownStates: 4279545,
  pulledStates: 4277040,
  startingBlock: 0
}
```

Hasta que no llegue a los bloques finales no podré ver mi los ETH en mi cuenta, ya que los obtuve hace poco:

```bash
> personal.importRawKey("eeccc87c8bd7a9c74b887abe402828e78c50badc6bc35596f216471006648d3c", "mortadelo")
"0x5a35af8f8b4283cf6a6407852d8bdab19456c118"
> "0x5a35af8f8b4283cf6a6407852d8bdab19456c118"
"0x5a35af8f8b4283cf6a6407852d8bdab19456c118"
> 
> eth.accounts
["0x5a35af8f8b4283cf6a6407852d8bdab19456c118"]
> web3.fromWei(eth.getBalance(eth.accounts[0]))
0
```

Por otro lado al funcionar como un nodo capaz de verificar tenemos más peers y son más estables:

```bash
> net.peerCount
4
> admin.peers
[{
    caps: ["eth/62", "eth/63"],
    id: "343149e4feefa15d882d9fe4ac7d88f885bd05ebb735e547f12e12080a9fa07c8014ca6fd7f373123488102fe5e34111f8509cf0b7de3f5b44339c9f25e87cb8",
    name: "Geth/v1.8.16-unstable-5918b88a/linux-amd64/go1.9.2",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:37460",
      remoteAddress: "52.3.158.184:30303",
      static: false,
      trusted: false
    },
    protocols: {
      eth: {
        difficulty: 5543914,
        head: "0xa6b18fe267986063b4bb71547ebcb8bf43e6db5689d6a1973fd962651cc13f2d",
        version: 63
      }
    }
}, {
    caps: ["eth/62", "eth/63"],
    id: "3476cc44a735dfb0efcb13c8be5ba58a39412994576a384f31fd57b386036052c409790c734a3ebe1de306fed07c0e5367fec9af28f09d6e7e75db6659a3327d",
    name: "Geth/v1.8.11-stable-dea1ce05/linux-amd64/go1.10.1",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:48304",
      remoteAddress: "35.232.239.27:30303",
      static: false,
      trusted: false
    },
    protocols: {
      eth: {
        difficulty: 5543989,
        head: "0x4345568edd303ecc821d5549fd118a2e998fb93a89811d90b60dd5cabdd2dbe5",
        version: 63
      }
    }
}, {
    caps: ["eth/62", "eth/63", "les/1", "les/2"],
    id: "a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf",
    name: "Geth/v1.8.14-unstable-c376a526/linux-amd64/go1.10.3",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:46672",
      remoteAddress: "52.169.42.101:30303",
      static: false,
      trusted: false
    },
    protocols: {
      eth: {
        difficulty: 5543993,
        head: "0x33e18acc7fc72f69f2b85af9d30223ffb909710e4159b083e3b817f3606137c2",
        version: 63
      }
    }
}, {
    caps: ["eth/62", "eth/63", "les/1", "les/2"],
    id: "b6b28890b006743680c52e64e0d16db57f28124885595fa03a562be1d2bf0f3a1da297d56b13da25fb992888fd556d4c1a27b1f39d531bde7de1921c90061cc6",
    name: "Geth/v1.8.16-unstable-62e94895/linux-amd64/go1.11",
    network: {
      inbound: false,
      localAddress: "192.168.1.42:50234",
      remoteAddress: "159.89.28.211:30303",
      static: false,
      trusted: false
    },
    protocols: {
      eth: {
        difficulty: 5543997,
        head: "0xfb9ae9ab9e57135e077a97535a29dc64dccbfba6fdd282650da8e7b58b924ef9",
        version: 63
      }
    }
}]

```

Sin embargo por lo que veo no termina nunca de sincronizarse totalmente, se queda a unos 60 bloques del último bloque y no hay manera de que termine. Según me indica el current block es el 0, y parece que lo que hace es importar los states, pero no del todo de forma satisfactoria:

```bash
INFO [09-13|10:42:26.267] Imported new state entries               count=1997 elapsed=22.341ms  processed=6572748 pending=14764 retry=2   duplicate=5437 unexpected=12278
INFO [09-13|10:42:27.162] Imported new state entries               count=2403 elapsed=12.137ms  processed=6575151 pending=13403 retry=2   duplicate=5437 unexpected=12278
WARN [09-13|10:42:27.258] Rolled back headers                      count=14   header=2980090->2980076 fast=2980020->2980020 block=0->0
INFO [09-13|10:42:27.259] Imported new state entries               count=33   elapsed=342.837µs processed=6575184 pending=13382 retry=0   duplicate=5437 unexpected=12278
WARN [09-13|10:42:27.259] Synchronisation failed, dropping peer    peer=35a76afee16c4508 err="retrieved hash chain is invalid"
WARN [09-13|10:42:32.040] Node data write error                    err="state node 0ceae1…887ba8 failed with all peers (2 tries, 2 peers)"
WARN [09-13|10:42:32.041] Synchronisation failed, retrying         err="state node 0ceae1…887ba8 failed with all peers (2 tries, 2 peers)"
WARN [09-13|10:42:42.033] Node data write error                    err="state node 0ceae1…887ba8 failed with all peers (2 tries, 2 peers)"
WARN [09-13|10:42:42.033] Synchronisation failed, retrying         err="state node 0ceae1…887ba8 failed with all peers (2 tries, 2 peers)"
WARN [09-13|10:42:52.041] Node data write error                    err="state node 0ceae1…887ba8 failed with all peers (2 tries, 2 peers)"
...
...
INFO [09-13|12:27:18.072] Imported new state entries               count=1536 elapsed=15.690ms  processed=11031193 pending=16040 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:18.525] Imported new state entries               count=1536 elapsed=7.261ms   processed=11032729 pending=15209 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:18.929] Imported new state entries               count=1152 elapsed=15.268ms  processed=11033881 pending=15642 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:19.397] Imported new state entries               count=1536 elapsed=6.055ms   processed=11035417 pending=15049 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:19.748] Imported new state entries               count=1152 elapsed=4.584ms   processed=11036569 pending=15427 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:20.227] Imported new state entries               count=1536 elapsed=10.679ms  processed=11038105 pending=14821 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:20.643] Imported new state entries               count=1152 elapsed=7.050ms   processed=11039257 pending=15652 retry=0   duplicate=1801 unexpected=7921
INFO [09-13|12:27:21.101] Imported new state entries               count=1536 elapsed=8.153ms   processed=11040793 pending=14809 retry=0   duplicate=1801 unexpected=7921

```

```bash
> eth.syncing
{
  currentBlock: 2980004,
  highestBlock: 2980070,
  knownStates: 6372241,
  pulledStates: 6364794,
  startingBlock: 0
}
> eth.syncing
{
  currentBlock: 2980004,
  highestBlock: 2980071,
  knownStates: 6380378,
  pulledStates: 6373526,
  startingBlock: 0
}
> eth.blockNumber
0
> eth.syncing
{
  currentBlock: 2980064,
  highestBlock: 2980132,
  knownStates: 6599120,
  pulledStates: 6589800,
  startingBlock: 0
}
> eth.blockNumber
0
```

Buscando un poco por Google encuentro una expliación a este comportamiento no esperado (al menos no esperado por mí): https://github.com/ethereum/go-ethereum/issues/15001#issuecomment-370732526
El problema no es solo bajarse los bloques si no calcular las transiciones. Mejor explicado en el propio enlace:
> Many people falsely assume that because they have the blocks, they are in sync. Unfortunately this is not the case, since no transaction was executed, so we do not have any account state available (ie. balances, nonces, smart contract code and data). These need to be downloaded separately and cross checked with the latest blocks. This phase is called the state trie download and it actually runs concurrently with the block downloads; alas it take a lot longer nowadays than downloading the blocks.

Como se van creando nuevos bloques, hay nuevas transacciones y al final es muy costoso en tiempo, y además depende de la velocidad de escritura en disco. Como estoy utilizando en mi portátil una máquina virtual que está un poco saturada lo voy a dejar de momento ya que lo que comenta la gente es que puede llegar a tardar varias horas sino días. Además según pone en las trazas las state entried pending llegan incluso a ir aumentando.