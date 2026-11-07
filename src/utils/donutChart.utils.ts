const colors = ['rgb(99, 102, 241)', 'rgb(142, 145, 255)', 'rgb(122, 125, 255)', 'rgb(76, 77, 213)', 'rgb(59, 60, 180)', 'rgb(53, 54, 161)'];
function convertToDountChartData(aggregatedData, column, itemLimit) {
    itemLimit = Math.min(itemLimit, colors.length)
    try {
        let total = 0
        Object.keys(aggregatedData).forEach((key) => {
            const value = aggregatedData[key][column];
            if (value > 0) {
                total += value;
            }
        });

        let sortedData = Object.keys(aggregatedData).map((key) => {
            const name = key;
            const value = aggregatedData[key][column]
            const perc = (100 * value / total);

            return {name, value, perc}
        }).filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)

        const others = sortedData.slice(itemLimit - 1).reduce((acc, instrument) => {
            acc.value += instrument.value;
            acc.perc += instrument.perc;
            return acc;
        }, {name: 'Others', value: 0, perc: 0});

        // Full list for the legend; items beyond the limit share the "Others" color.
        const legendData = sortedData.map((item, i) => ({
            ...item,
            fill: colors[Math.min(i, itemLimit - 1)],
        }));

        const chartData: Array<{name: string, value: number, perc: number, fill?: string}> = sortedData.slice();
        if (chartData.length > itemLimit) {
            chartData.splice(itemLimit - 1)
            chartData.push(others);
        }
        for(let i=0; i<chartData.length; i++){
            chartData[i] = {...chartData[i], fill: colors[i]}
        }

        return {chartData, legendData}
    }
    catch(e){
        console.error(e);
        return {chartData: [], legendData: []}
    }
}

export default convertToDountChartData;