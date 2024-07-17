import React from 'react'
import MainBox from "../components/grid/MainBox";
import LineGraphBox from "../components/grid/LineGraphBox";
import DonutChartBox from "../components/grid/DonutChartBox";
import {getAggregatedData} from "../utils/aggregator";
const Home = ({
                    instruments,
                    transactionsRowMap,
                    transactionsColumnMap,
                    metadata,
                    reports,
                    aggregatedData,
                    setSelectedMenuItem,
}) => {
    if(!instruments)
        return <div></div>

    return (
        transactionsColumnMap ?
            <div className="home">
                <div className="box box1">
                    <MainBox
                        instruments={instruments}
                        metadata={metadata}
                        aggregatedData={aggregatedData}
                        setSelectedMenuItem={setSelectedMenuItem}/>
                </div>
                <div className="box box2">
                </div>
                <div className="box box3">
                    <DonutChartBox aggregatedData={aggregatedData} metadata={metadata}/>
                </div>
                <div className="box box4">
                    <LineGraphBox
                        reports={reports}/>
                </div>
                <div className="box box5"></div>
            </div> :
            <div/>
    )
}

export default Home