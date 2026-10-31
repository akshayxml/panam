export function getCapitalGainsData(transactionsRowMap, instrument, name,
                                    unitsField, buyNavField, currentNavField,
                                    shortTermPeriod) {
    if (!transactionsRowMap || !(instrument in transactionsRowMap) || !unitsField || !buyNavField || !currentNavField) {
        return [0, 0];
    }

    try{

        let withdrawnUnits = 0, currentNav = 0;
        const buyLots = [];

        const today = new Date();
        const thresholdDate = new Date(today.setMonth(today.getMonth() - shortTermPeriod));

        transactionsRowMap[instrument]
            .filter(transaction => transaction.Name === name)
            .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
            .forEach(transaction => {
                const transactionUnits = Number(transaction[unitsField]) || 0;
                const nav = Number(transaction[currentNavField]);
                if (nav > 0) {
                    currentNav = nav;
                }

                if (transactionUnits < 0) {
                    withdrawnUnits += -transactionUnits;
                } else if (transactionUnits > 0) {
                    buyLots.push({
                        date: new Date(transaction.Date),
                        units: transactionUnits,
                        buyNav: Number(transaction[buyNavField]) || 0,
                    });
                }
            });

        // Withdrawals redeem the oldest units first (FIFO) across long and short term lots, and only once.
        let longTermValue = 0, shortTermValue = 0;
        buyLots.forEach(lot => {
            const redeemedUnits = Math.min(lot.units, withdrawnUnits);
            withdrawnUnits -= redeemedUnits;
            const gains = (lot.units - redeemedUnits) * (currentNav - lot.buyNav);
            if (lot.date < thresholdDate) {
                longTermValue += gains;
            } else {
                shortTermValue += gains;
            }
        });

        return [longTermValue, shortTermValue];
    }
    catch (e){
        console.error(e)
        return [0, 0];
    }
}

export function getRedemptionAmountData(transactionsRowMap, instrument, name,
                                    unitsField, currentNavField,
                                    redemptionUnits) {
    if (!transactionsRowMap || !(instrument in transactionsRowMap) || !unitsField || !currentNavField) {
        return [0, 0];
    }

    try{
        let currentNav = 0, investedAmount = 0, redemptionUnitsCopy = redemptionUnits;

        const relevantTransactions = transactionsRowMap[instrument]
        .filter(transaction => transaction.Name === name) 
        .sort((a, b) => {                               
            const dateA = new Date(a.Date);
            const dateB = new Date(b.Date);
            return dateA.getTime() - dateB.getTime(); 
        });

        let redeemdedUnits = relevantTransactions
        .filter(transaction => transaction[unitsField] < 0) 
        .reduce((sum, transaction) => sum + Math.abs(transaction[unitsField]), 0);
        
        relevantTransactions.forEach(transaction => {
            let transactionUnits = transaction[unitsField];
            if(transactionUnits < 0)
                return;
            currentNav = transaction[currentNavField];

            if (redeemdedUnits > 0) {
                if (redeemdedUnits >= transactionUnits){
                    redeemdedUnits -= transactionUnits;
                    return;
                }
                else{
                    transactionUnits -= redeemdedUnits;
                    redeemdedUnits = 0;
                }
            } 
            if (redemptionUnits > 0){
                if (redemptionUnits >= transactionUnits){
                    investedAmount += (transactionUnits/transaction[unitsField])*transaction.Invested;
                    redemptionUnits -= transactionUnits;
                }
                else{
                    investedAmount += (redemptionUnits/transaction[unitsField])*transaction.Invested
                    redemptionUnits = 0;
                }
            }
        });

        if(redemptionUnits > 0)
            return [-1, -1]
        
        const currentAmount = redemptionUnitsCopy*currentNav;
        return [investedAmount, currentAmount];
    }
    catch (e){
        console.error(e)
        return [0, 0];
    }
}