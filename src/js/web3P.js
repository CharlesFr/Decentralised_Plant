function getBlockNumber() {
    return new Promise(function(resolve, reject){
        web3.eth.getBlockNumber(function(err, number) {
            if (err) {
                console.log("getBlockNumber::error", err);
                reject(err);
            }

            resolve(number);
        });
    });
}

function getBlock(blockNumber) {
    return new Promise(function(resolve, reject){
        web3.eth.getBlock(blockNumber, function(err, block) {
            if (err) {
                console.log("getBlock::error", err);
                reject(err);
            }

            resolve(block);
        });
    });
}

function getTransaction(transactionHash) {
    return new Promise(function(resolve, reject){
        web3.eth.getTransaction(transactionHash, function(err, transaction) {
            if (err) {
                console.log("getTransaction::error", err);
                reject(err);
            }
            resolve(transaction);
        });
    });
}