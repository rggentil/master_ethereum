# Módulo2 - Ejercicio 3 - Compilador de Solidity

Instalamos el compilador de solidity con los paquetes binarios:

```
sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc
```

En todos los apartados utilizamos la opción de optimización `--optimize`.

## Códigos de operación del smartcontrat

Vamos a trabajar con el contrato que usamos en el anteior módulo de [MyToken.sol](contracts/MyToken.sol) ya que es más sencillo y así las salidas no son tan grandes y nos sirve para ver los opcodes.

Para obtener dichos códigos tenemos que lanzar el compilador con la opción `--opcodes`:

```bash
rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/ejercicio3-solidity_compiler$ solc --optimize --opcodes contracts/MyToken.sol 

======= contracts/MyToken.sol:MyToken =======
Opcodes: 
PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH1 0x20 DUP1 PUSH2 0x1E8 DUP4 CODECOPY DUP2 ADD PUSH1 0x40 SWAP1 DUP2 MSTORE SWAP1 MLOAD CALLER PUSH1 0x0 SWAP1 DUP2 MSTORE PUSH1 0x20 DUP2 SWAP1 MSTORE SWAP2 SWAP1 SWAP2 KECCAK256 SSTORE PUSH2 0x1A4 DUP1 PUSH2 0x44 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0x4B JUMPI PUSH4 0xFFFFFFFF PUSH29 0x100000000000000000000000000000000000000000000000000000000 PUSH1 0x0 CALLDATALOAD DIV AND PUSH4 0x70A08231 DUP2 EQ PUSH2 0x50 JUMPI DUP1 PUSH4 0xA9059CBB EQ PUSH2 0x90 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x5C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x7E PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF PUSH1 0x4 CALLDATALOAD AND PUSH2 0xD5 JUMP JUMPDEST PUSH1 0x40 DUP1 MLOAD SWAP2 DUP3 MSTORE MLOAD SWAP1 DUP2 SWAP1 SUB PUSH1 0x20 ADD SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x9C JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0xC1 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF PUSH1 0x4 CALLDATALOAD AND PUSH1 0x24 CALLDATALOAD PUSH2 0xE7 JUMP JUMPDEST PUSH1 0x40 DUP1 MLOAD SWAP2 ISZERO ISZERO DUP3 MSTORE MLOAD SWAP1 DUP2 SWAP1 SUB PUSH1 0x20 ADD SWAP1 RETURN JUMPDEST PUSH1 0x0 PUSH1 0x20 DUP2 SWAP1 MSTORE SWAP1 DUP2 MSTORE PUSH1 0x40 SWAP1 KECCAK256 SLOAD DUP2 JUMP JUMPDEST CALLER PUSH1 0x0 SWAP1 DUP2 MSTORE PUSH1 0x20 DUP2 SWAP1 MSTORE PUSH1 0x40 DUP2 KECCAK256 SLOAD DUP3 GT ISZERO PUSH2 0x103 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF DUP4 AND PUSH1 0x0 SWAP1 DUP2 MSTORE PUSH1 0x20 DUP2 SWAP1 MSTORE PUSH1 0x40 SWAP1 KECCAK256 SLOAD DUP3 DUP2 ADD LT ISZERO PUSH2 0x137 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP CALLER PUSH1 0x0 SWAP1 DUP2 MSTORE PUSH1 0x20 DUP2 SWAP1 MSTORE PUSH1 0x40 DUP1 DUP3 KECCAK256 DUP1 SLOAD DUP5 SWAP1 SUB SWAP1 SSTORE PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF DUP5 AND DUP3 MSTORE SWAP1 KECCAK256 DUP1 SLOAD DUP3 ADD SWAP1 SSTORE PUSH1 0x1 SWAP3 SWAP2 POP POP JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 SWAP9 0x1f 0xe9 0xe1 0xc6 0xcc 0xbb PC 0xf5 0x28 SWAP16 0xfc PUSH30 0x29C4FD28CB46DF6EA4CAAB7FC9A9E7D81A43B40029000000000000000000 
```

## Identificadores de las funciones

Entiendo que lo que se refiere con identificadores de las funciones son los hashes que las identifican. Por tanto para obtener sus identificadores tenemos que user la opción `--hashes`. Para este ejemplo utilizamos el contrato [TokenERC20.sol](contracts/TokenERC20.sol) que tiene más funciones:

```bash
rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/ejercicio3-solidity_compiler$ solc --optimize --hashes contracts/TokenERC20.sol 

======= contracts/TokenERC20.sol:TokenERC20 =======
Function signatures: 
dd62ed3e: allowance(address,address)
095ea7b3: approve(address,uint256)
cae9ca51: approveAndCall(address,uint256,bytes)
70a08231: balanceOf(address)
42966c68: burn(uint256)
79cc6790: burnFrom(address,uint256)
313ce567: decimals()
06fdde03: name()
95d89b41: symbol()
18160ddd: totalSupply()
a9059cbb: transfer(address,uint256)
23b872dd: transferFrom(address,address,uint256)

======= contracts/TokenERC20.sol:tokenRecipient =======
Function signatures: 
8f4ffcb1: receiveApproval(address,uint256,address,bytes)
```

## Estimación del gas de cada función

Vamos a ver el gas en cada uno de los contratos anteriores, utilizando la opción `--gas`:

```bash
rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/ejercicio3-solidity_compiler$ solc --optimize --gas contracts/MyToken.sol 

======= contracts/MyToken.sol:MyToken =======
Gas estimation:
construction:
   20260 + 84000 = 104260
external:
   balanceOf(address):	465
   transfer(address,uint256):	41410


rggentil@elcid:~/Documents/master_ethereum/master_ethereum/design_and_development/modulo2/ejercicio3-solidity_compiler$ solc --optimize --gas contracts/TokenERC20.sol 

======= contracts/TokenERC20.sol:TokenERC20 =======
Gas estimation:
construction:
   infinite + 449800 = infinite
external:
   allowance(address,address):	860
   approve(address,uint256):	22354
   approveAndCall(address,uint256,bytes):	infinite
   balanceOf(address):	663
   burn(uint256):	42552
   burnFrom(address,uint256):	63606
   decimals():	487
   name():	infinite
   symbol():	infinite
   totalSupply():	428
   transfer(address,uint256):	44710
   transferFrom(address,address,uint256):	65467
internal:
   _transfer(address,address,uint256):	infinite

======= contracts/TokenERC20.sol:tokenRecipient =======
Gas estimation:
```

Como podemos en el primer contrato que es muy sencillo tenemos la cantidad exacta de gas, mientras que en el segundo, más complejo hay varias funciones donde nos sale infinito. No implica que nuestro contrato vaya a gastar todo el gas del que disponga si no que el análisis estático no puede predecir un límite de gas. Por ejemplo las funciones *name* y *symbol* que consisten en devolver un string que hemos definido antes, como string es un tipo que puede ser lo largo que queramos, entonces implica que nuestra función podría gastar todo el gas con un string lo suficientemente largo.

