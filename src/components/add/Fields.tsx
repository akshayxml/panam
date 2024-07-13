import AutocompleteWrapper from "./AutocompleteWrapper";

const Fields = ({
                       instrument,
                       transactionsColumnMap,
                       requiredHeaders,
                        inputValues,
                        onInputChange,
                        error
                   }) => {
    if(!requiredHeaders)
        return <div/>

    let uniqueValues = {}
    requiredHeaders.forEach(columnName => {
        uniqueValues[columnName] = Array.from(new Set(transactionsColumnMap[instrument][columnName]));
    });

    return (
        <div className="fields">
            {requiredHeaders.map(columnName => (
                <div key={columnName} className="field">
                    <AutocompleteWrapper
                        suggestions={uniqueValues[columnName]}
                        column={columnName}
                        inputValues={inputValues}
                        handleInputChange={onInputChange}
                        error={error}
                        />
                </div>
            ))}
        </div>
    );
}

export default Fields