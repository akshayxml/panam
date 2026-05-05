function arrayToObjects(arr) {
  if (!arr || arr.length === 0) return [];
  const headers = arr[0];
  const results = [];
  for (let i = 1; i < arr.length; i++) {
    const row = arr[i];
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    results.push(obj);
  }
  return results;
}

function getAIChatResponse(prompt) {
  const env = PropertiesService.getScriptProperties().getProperty('ENV');
  if (env === 'development') {
    return {
      statusCode: 200,
      text: `Mock Response (Development Mode): Hello! I am your AI assistant. I am currently running in development mode. Your prompt was: "${prompt}"`
    };
  }

  const apiKey = PropertiesService.getScriptProperties().getProperty('AI_API_KEY');

  if (!apiKey) {
    return {
      statusCode: 200,
      text: "Mock Response: Hello! I am an AI assistant. Please set your 'AI_API_KEY' in Script Properties to enable live responses."
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  let portfolioData = "{}";
  try {
    const rawData = JSON.parse(fetchData());
    const structuredData = {};
    for (const sheetName in rawData) {
      structuredData[sheetName] = arrayToObjects(rawData[sheetName]);
    }
    portfolioData = JSON.stringify(structuredData);
  } catch (e) {
    console.error("Error fetching portfolio data:", e);
    portfolioData = JSON.stringify({ error: "Failed to fetch and structure portfolio data: " + (e.message || e) });
  }
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    systemInstruction: {
      parts: [{ text: "You are a financial assistant for the Panam portfolio management application. Restrict your answers to financial advice, portfolio analysis, and investment queries related to the project. If the user asks about other topics, politely decline to answer. The data is provided as a JSON object where keys are sheet names and values are lists of objects representing rows, with keys mapping to column headers. Here is the current portfolio data: " + portfolioData }]
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200) {
      const json = JSON.parse(responseText);
      const text = json.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        text: text
      };
    } else {
      return {
        statusCode: responseCode,
        text: `Error from Gemini API: ${responseText}`
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      text: `Exception occurred: ${e.message || e}`
    };
  }
}
