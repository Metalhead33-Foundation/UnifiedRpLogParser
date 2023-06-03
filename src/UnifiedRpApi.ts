export interface ProcessedResult {
    name: string;
    content: string;
    date: string|Date;
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

export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export function formatProcessedResult(result: ProcessedResult[]): string {
    return result
      .map(({ name, content, date }) => {
        if (typeof date === 'string') {
          return `{{RPG Post/${name}
|date=${date}
|post=${content.replace(/\*/g, '{{Str}}')}
}}`;
        } else if (date instanceof Date) {
          const formattedDate = formatDate(date);
          return `{{RPG Post/${name}
|date=${formattedDate}
|post=${content.replace(/\*/g, '{{Str}}')}
}}`;
        } else {
          throw new Error('Invalid date type');
        }
      })
      .join('\n');
}
  