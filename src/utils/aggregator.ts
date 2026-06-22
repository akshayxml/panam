import getXirr from 'xirr';

function updateMapTotals(map: any, currentAmount: number, investedAmount: number) {
    map.current += currentAmount ? currentAmount : 0;
    map.invested += investedAmount ? investedAmount : 0;
    map.returns += (currentAmount - investedAmount);
}

function cloneLots(lots: any[]) {
    if (!lots) return [];
    return lots.map(lot => ({
        ...lot,
        date: lot.date instanceof Date ? new Date(lot.date.getTime()) : new Date(lot.date)
    }));
}

function updateMapFIFO(map: any, currentAmount: number, investedAmount: number, date: Date, calculateXirr: boolean) {
    map.current += currentAmount ? currentAmount : 0;
    map.invested += investedAmount ? investedAmount : 0;
    map.returns += (currentAmount - investedAmount);

    if (calculateXirr) {
        if (!map.buyLots) {
            map.buyLots = [];
        }
        if (investedAmount > 0) {
            map.buyLots.push({
                date: date,
                invested: investedAmount,
                initialInvested: investedAmount,
                current: currentAmount ? currentAmount : 0
            });
        } else if (investedAmount < 0) {
            const redemptionCost = -investedAmount;
            let remainingToRedeem = redemptionCost;
            while (remainingToRedeem > 0 && map.buyLots.length > 0) {
                let oldestLot = map.buyLots[0];
                if (oldestLot.invested <= remainingToRedeem) {
                    remainingToRedeem -= oldestLot.invested;
                    map.buyLots.shift();
                } else {
                    oldestLot.invested -= remainingToRedeem;
                    remainingToRedeem = 0;
                }
            }
        }
    }
}

function finalizeCashflowsFIFO(map: any, key: string, currentAmount: number, investedAmount: number, calculateXirr: boolean) {
    if (calculateXirr) {
        const cashflows: any[] = [];
        let totalRemainingCurrent = 0;

        if (map.buyLots && map.buyLots.length > 0) {
            for (const lot of map.buyLots) {
                const lotDate = lot.date instanceof Date ? lot.date : new Date(lot.date);
                cashflows.push({ amount: -lot.invested, when: lotDate });
                const remainingCurrent = lot.current * (lot.invested / lot.initialInvested);
                totalRemainingCurrent += remainingCurrent;
            }
        }

        cashflows.push({ amount: totalRemainingCurrent, when: new Date() });

        if (cashflows.length >= 2) {
            try {
                map.xirr = getXirr(cashflows);
            } catch (e: any) {
                console.error(`XIRR calculation failed for ${key}:`, e.message);
                map.xirr = 0;
            }
        } else {
            map.xirr = 0;
        }
        delete map.buyLots;
    }
    map.difference = currentAmount - investedAmount;
}

export function getAggregatedData(transactionsRowMap: any, metadata: any) {
    try {
        const instrumentsMetadata = metadata && Array.isArray(metadata.instrument) ? metadata.instrument : [];
        const overallMap: any = { current: 0, invested: 0, returns: 0, buyLots: [] };
        const instrumentsDataMap: any = {};
        const overallActiveLots: any[] = [];

        for (const k in transactionsRowMap) {
            instrumentsDataMap[k] = { current: 0, invested: 0, returns: 0, name: {}, category: {}, buyLots: [] };
            let calculateXirr = instrumentsMetadata.find(
                (instrument: any) => instrument.Name.toLowerCase() === k.toLowerCase()
            )?.CalculateXirr;
            
            if (typeof calculateXirr === 'string') {
                calculateXirr = calculateXirr.toLowerCase() === 'true';
            }

            const transactions = transactionsRowMap[k];
            const hasName = transactions.some((t: any) => t.Name);

            for (const transaction of transactions) {
                const { Current: currentAmount, Invested: investedAmount, Name: name, Category: category, Date: date } = transaction;
                
                updateMapTotals(overallMap, currentAmount, investedAmount);

                if (hasName) {
                    updateMapTotals(instrumentsDataMap[k], currentAmount, investedAmount);
                    
                    if (name) {
                        if (!(name in instrumentsDataMap[k].name)) {
                            instrumentsDataMap[k].name[name] = { current: 0, invested: 0, returns: 0, buyLots: [], category: category };
                        }
                        updateMapFIFO(instrumentsDataMap[k].name[name], currentAmount, investedAmount, date, calculateXirr);
                    }

                    if (category) {
                        if (!(category in instrumentsDataMap[k].category)) {
                            instrumentsDataMap[k].category[category] = { current: 0, invested: 0, returns: 0, buyLots: [] };
                        }
                        updateMapTotals(instrumentsDataMap[k].category[category], currentAmount, investedAmount);
                    }
                } else {
                    updateMapFIFO(instrumentsDataMap[k], currentAmount, investedAmount, date, calculateXirr);
                }
            }

            if (instrumentsDataMap[k].current > 1) {
                if (hasName) {
                    for (const nameKey in instrumentsDataMap[k].name) {
                        const nameMap = instrumentsDataMap[k].name[nameKey];
                        if (nameMap.current > 1) {
                            const remainingLots = nameMap.buyLots ? cloneLots(nameMap.buyLots) : [];
                            
                            // Aggregate to Instrument level active lots
                            instrumentsDataMap[k].buyLots.push(...remainingLots);
                            
                            // Aggregate to Category level active lots
                            const categoryKey = nameMap.category;
                            if (categoryKey) {
                                const categoryMap = instrumentsDataMap[k].category[categoryKey];
                                if (categoryMap) {
                                    categoryMap.buyLots.push(...cloneLots(remainingLots));
                                }
                            }
                            
                            // Aggregate to Overall level active lots
                            if (calculateXirr) {
                                overallActiveLots.push(...cloneLots(remainingLots));
                            }

                            finalizeCashflowsFIFO(nameMap, nameKey, nameMap.current, nameMap.invested, calculateXirr);
                        } else {
                            delete instrumentsDataMap[k].name[nameKey];
                        }
                    }

                    for (const categoryKey in instrumentsDataMap[k].category) {
                        const categoryMap = instrumentsDataMap[k].category[categoryKey];
                        if (categoryMap.current > 1) {
                            finalizeCashflowsFIFO(categoryMap, categoryKey, categoryMap.current, categoryMap.invested, calculateXirr);
                        } else {
                            delete instrumentsDataMap[k].category[categoryKey];
                        }
                    }

                    finalizeCashflowsFIFO(instrumentsDataMap[k], k, instrumentsDataMap[k].current, instrumentsDataMap[k].invested, calculateXirr);
                } else {
                    // No Name case: instrument itself is the leaf
                    if (calculateXirr && instrumentsDataMap[k].buyLots) {
                        overallActiveLots.push(...cloneLots(instrumentsDataMap[k].buyLots));
                    }
                    finalizeCashflowsFIFO(instrumentsDataMap[k], k, instrumentsDataMap[k].current, instrumentsDataMap[k].invested, calculateXirr);
                }
            } else {
                delete instrumentsDataMap[k];
            }
        }

        // Finalize overall cashflows
        if (overallActiveLots.length > 0) {
            overallMap.buyLots = overallActiveLots;
            finalizeCashflowsFIFO(overallMap, 'overall', overallMap.current, overallMap.invested, true);
        } else {
            overallMap.xirr = 0;
            overallMap.difference = overallMap.current - overallMap.invested;
        }

        return [overallMap, instrumentsDataMap];
    } catch (error) {
        console.error(error);
        return [{}, {}];
    }
}
