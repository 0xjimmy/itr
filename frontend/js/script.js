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
        web3.eth.getBalance(web3.eth.defaultAccount, (error, result) => {
            if (!error) {
                document.querySelector("#accountPanel > div.divContent > p:nth-child(3) > span").innerHTML = web3.fromWei(result, 'ether')
                document.querySelector("#contact > div > div > div:nth-child(1) > div > div > div > p").innerHTML = `ETH Balance: ${web3.fromWei(result, 'ether')}`
                document.querySelector("#contact > div > div > div:nth-child(2) > div > div > div > p").innerHTML = `ETH Balance: ${web3.fromWei(result, 'ether')}`
            }
        })        
    })
}