export interface ProcessedResult {
    name: string;
    content: string;
    date: string;
}

// Function to postprocess the extracted data
export function postprocessExtractedData(result: ProcessedResult[]): ProcessedResult[] {
    let processedResult: ProcessedResult[] = [];

    // Process the result
    for (let i = 0; i < result.length; i++) {
        const processedIndex = processedResult.length - 1;
        if (i === 0) {
            processedResult.push(result[i]);
        } else if (processedResult[processedIndex].name === result[i].name) {
            processedResult[processedIndex].content += '<br>\n' + result[i].content;
        } else {
            processedResult.push(result[i]);
        }
    }

    return processedResult;
}

export function formatProcessedResult(result: ProcessedResult[]): string {
    return result
        .map(({ name, content, date }) => {
            return `{{RPG Post/${name}
|date=${date}
|post=${content.replace(/\*/g, '{{Str}}')}
}}`;
        })
        .join('\n');
}