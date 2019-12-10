document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.color-mode').click()
})

document.querySelector("#accountPanel > div.lockedWallet > p > button").addEventListener('click', () => {
    update()
})

function update() {
    ethereum.enable().then(() => {
        document.querySelector("#accountPanel > div.lockedWallet").style.display = 'none'
        document.querySelector("#accountPanel > div.divContent").style.display = 'block'
        // Ether balances
        web3.eth.getBalance(web3.eth.defaultAccount, (error, result) => {
            if (!error) {
                document.querySelector("#accountPanel > div.divContent > p:nth-child(7) > span").innerHTML = web3.fromWei(result, 'ether')
            }
        })
        // Token Balance
        web3.eth.contract(tokenABI).at(tokenAddress).balanceOf(web3.eth.defaultAccount, (error, result) => {
            if (!error) {
                document.querySelector("#accountPanel > div.divContent > p:nth-child(2) > span").innerHTML = result / 100000
            }
        })
        // Exchange Balance
        web3.eth.contract(exchangeABI).at(exchangeAddress).account(web3.eth.defaultAccount, (error, result) => {
            if (!error) {
                document.querySelector("#accountPanel > div.divContent > p:nth-child(3) > span").innerHTML = result[0] / 100000
                document.querySelector("#contact > div > div > div:nth-child(2) > div > div > div > p").innerHTML = `${result[0] / 100000} iTR Available`
                document.querySelector("#accountPanel > div.divContent > p:nth-child(8) > span").innerHTML = web3.fromWei(result[1], 'ether')
                document.querySelector("#contact > div > div > div:nth-child(1) > div > div > div > p").innerHTML = `${web3.fromWei(result[1], 'ether')} ETH Available`
            }
        })
        // Token Price
        web3.eth.contract(exchangeABI).at(exchangeAddress).tokenPrice((error, result) => {
            if (!error) {
                tokenPrice = web3.fromWei(result, 'ether').toNumber()
            }
        })
        setTimeout(update(), 15000)
    })
}

// Update ETH Values
document.querySelector("#longAmount").addEventListener('change', () => {
    document.querySelector("#longCost").value = document.querySelector("#longAmount").value * tokenPrice
})
document.querySelector("#shortAmount").addEventListener('change', () => {
    document.querySelector("#shortCost").value = document.querySelector("#shortAmount").value * tokenPrice
})

// ETH Deposit & Withdraw
document.querySelector("#accountPanel > div.divContent > a:nth-child(10)").addEventListener('click', () => {
    web3.eth.contract(exchangeABI).at(exchangeAddress).depositETH({value: web3.toWei(document.querySelector("#accountPanel > div.divContent > input:nth-child(9)").value, 'ether')}, (error, result) => {
        console.log(error, result)
    })
})
document.querySelector("#accountPanel > div.divContent > a:nth-child(11)").addEventListener('click', () => {
    web3.eth.contract(exchangeABI).at(exchangeAddress).withdrawETH(web3.toWei(document.querySelector("#accountPanel > div.divContent > input:nth-child(9)").value, 'ether'), (error, result) => {
        console.log(error, result)
    })
})
// iTR Deposit & Withdraw
document.querySelector("#accountPanel > div.divContent > a:nth-child(5)").addEventListener('click', () => {

})
document.querySelector("#accountPanel > div.divContent > a:nth-child(6)").addEventListener('click', () => {
    web3.eth.contract(exchangeABI).at(exchangeAddress).withdrawITR((document.querySelector("#accountPanel > div.divContent > input:nth-child(4)").value / 100000), (error, result) => {
        console.log(error, result)
    })
})
// Create Buy & Sell Orders
document.querySelector("#contact > div > div > div:nth-child(1) > div > div > div > input.form-control.submit-btn").addEventListener('click', () => {
    var buyAmount = document.querySelector("#longCost").value * 10 ** 18;
    var buyAmount;
    var tokenPrice;
    var usedOrders;
    var orderLength;
    function toEth(amount) {
        return Math.trunc((amount * tokenPrice) / (10 ** tokenDecimals));
    }
    function toTokens(amount) {
        return Math.trunc((amount / tokenPrice) * (10 ** tokenDecimals));
    }

    
    exchange.usedTokenOrders(function (error, result) {
        usedOrders = JSON.parse(result)
        exchange.getTokenOrdersLength(function (error, result) {
            orderLength = JSON.parse(result)
            if ((orderLength - usedOrders) == 0) {
                exchange.limitBuy((document.querySelector("#longCost").value * 10 ** 18), function (error, result) {
                    console.log(error, result)
                })
            } else {
                marketBuy()
            }
        })
    })
    
    
    var checkedOrders = 0;
    var marketAmounts = [];
    var etherUsedSum = 0;
    function marketBuy() {
        if (checkedOrders == (orderLength - usedOrders) || etherUsedSum == buyAmount) {
            var stingedOrders = [];
            for (i = 0; i < marketAmounts.length; i++) {
                stingedOrders.push(JSON.stringify(marketAmounts[i]));
            }
            exchange.sendMarketBuys(stingedOrders, (buyAmount - etherUsedSum), function (error, result) {
                console.log(result);
            });
        } else {
            exchange.tokenOrders((usedOrders + checkedOrders), function (error, result) {
                if (!error) {
                    var currentAddress = result;
                    exchange.account(currentAddress, function (error, result) {
                        if (!error) {
                            var amount = JSON.parse(result[2]);
                            if (amount >= toTokens(buyAmount - etherUsedSum)) {
                                marketAmounts.push(buyAmount - etherUsedSum);
                                etherUsedSum = buyAmount;
                            } else {
                                etherUsedSum += toEth(amount);
                                marketAmounts.push(toEth(amount));
                            }
                            checkedOrders++;
                            marketBuy();
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    console.log(error);
                }
            });
        }
    }
})
document.querySelector("#contact > div > div > div:nth-child(2) > div > div > div > input.form-control.submit-btn").addEventListener('click', () => {
    var sellAmount = document.querySelector("#shortAmount").value * 10 ** tokenDecimals;
    var tokenPrice;
    var usedOrders;
    var orderLength;
    function toEth(amount) {
        return Math.trunc((amount * tokenPrice) / (10 ** tokenDecimals));
    }
    function toTokens(amount) {
        return Math.trunc((amount / tokenPrice) * (10 ** tokenDecimals));
    }
    
    exchange.tokenPrice(function (error, result) {
        tokenPrice = JSON.parse(result);
        exchange.usedEtherOrders(function (error, result) {
            usedOrders = JSON.parse(result);
            exchange.getEtherOrdersLength(function (error, result) {
                orderLength = JSON.parse(result);
                if ((orderLength - usedOrders) == 0) {
                    exchange.limitSell((document.querySelector("#shortAmount").value * 10 ** tokenDecimals), function (error, result) {
                        console.log(error, result)
                    });
                } else {
                    marketSell();
                }
            });
        });
    });
    
    var checkedOrders = 0;
    var marketAmounts = [];
    var tokenUsedSum = 0;
    function marketSell() {
        if (checkedOrders == (orderLength - usedOrders) || tokenUsedSum == sellAmount) {
            var stingedOrders = [];
            for (i = 0; i < marketAmounts.length; i++) {
                stingedOrders.push(JSON.stringify(marketAmounts[i]));
            }
            console.log(marketAmounts);
            console.log(stingedOrders);
            exchange.sendMarketSells(stingedOrders, (sellAmount - tokenUsedSum), function (error, result) {
                console.log(result);
            });
        } else {
            exchange.etherOrders((usedOrders + checkedOrders), function (error, result) {
                if (!error) {
                    var currentAddress = result;
                    exchange.account(currentAddress, function (error, result) {
                        if (!error) {
                            var amount = JSON.parse(result[4]);
                            if (amount >= toEth(sellAmount - tokenUsedSum)) {
                                marketAmounts.push(sellAmount - tokenUsedSum);
                                tokenUsedSum = sellAmount;
                            } else {
                                tokenUsedSum += toTokens(amount);
                                marketAmounts.push(toTokens(amount));
                            }
                            checkedOrders++;
                            marketSell();
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    console.log(error);
                }
            });
        }
    }
})

let tokenPrice
const tokenDecimals = 5
const tokenAddress = '0xf5a68b17e69ff202b604ac6bd9b1482554592671'
const exchangeAddress = '0xc5F9412E46026fe82115dF8cbCbBc97D2fF655b9'

const exchangeABI = [{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"etherOrders","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEtherOrdersLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawITR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"myid","type":"bytes32"},{"internalType":"string","name":"result","type":"string"}],"name":"__callback","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"bytes32","name":"_myid","type":"bytes32"},{"internalType":"string","name":"_result","type":"string"},{"internalType":"bytes","name":"_proof","type":"bytes"}],"name":"__callback","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"sendMarketBuys","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"usedEtherOrders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"latestEthPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"depositITR","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"limitSell","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"lastPriceUpdate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"account","outputs":[{"internalType":"uint256","name":"tokenBalance","type":"uint256"},{"internalType":"uint256","name":"etherBalance","type":"uint256"},{"internalType":"uint256","name":"tokenOrder","type":"uint256"},{"internalType":"uint256","name":"tokenOrderIndex","type":"uint256"},{"internalType":"uint256","name":"etherOrder","type":"uint256"},{"internalType":"uint256","name":"etherOrderIndex","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"cancelSell","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getTokenOrdersLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"donateEther","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"usedTokenOrders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"marketBuy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_wei","type":"uint256"}],"name":"setOracleFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"limitBuy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenOrders","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"collectFees","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newTokenAddress","type":"address"}],"name":"changeTokenAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"sendMarketSells","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"marketSell","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawETH","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"depositETH","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"oracleFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"outstandingFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"cancelBuy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"_type","type":"string"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"_type","type":"string"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"from","type":"address"}],"name":"Withdraw","type":"event"}]
const tokenABI = [{"constant":true,"inputs":[],"name":"supply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"_allowed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"}]