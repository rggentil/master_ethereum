# RPS

First version of my implementation of the popular game of Rock-Paper-Scissors in Solidity/Ethereum.

So far you can place bet against the house/jackpot and also create rounds that anyone can later join.

Several limitations so far:

- Random is taken from blockhash, so it is not safe at all.
- It's currently bad code (frond-end is just lame).
- Lack of unit tests
- Just tested in local ganache