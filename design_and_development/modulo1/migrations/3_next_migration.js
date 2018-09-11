var TokenERC20 = artifacts.require("./TokenERC20.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");


module.exports = function(deployer) {
  deployer.deploy(Crowdsale, 0xe89fe16758eff82a9f7ebf7812101d354922f44c, 50, 15, 1, 0x07a12155d00623fb3270167f42b66e23f014c2dd);
};
