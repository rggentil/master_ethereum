var TokenERC20 = artifacts.require("./TokenERC20.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");


module.exports = function(deployer) {
  deployer.deploy(TokenERC20, 100000, "Pavos", "PAV");
};
