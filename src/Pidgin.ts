import fs, { stat } from 'fs';
import cheerio from 'cheerio';
import * as UnifiedRpApi from './UnifiedRpApi';

// Interfaces
interface Replacement {
    pattern: RegExp;
    replacement: string;
}

function performTagReplacements(htmlFile: string): string {
    const replacements: Replacement[] = [
        { pattern: /<p>/g, replacement: '' },
        { pattern: /<\/p>/g, replacement: '' },
        { pattern: /<span style="color: #[A-F0-9]{6}"><span style="font-size: smaller">\x28/g, replacement: '<post><time>' },
        { pattern: /<font color="#[A-F0-9]{6}"><font size="2">\x28/g, replacement: '<post><time>' },
        { pattern: /\x29<\/font> <b>\*\*\*/g, replacement: '</time><charname>' },
        { pattern: /\x29<\/span> <b>\*\*\*/g, replacement: '</time><charname>' },
        { pattern: /\x29<\/font> <b>/g, replacement: '</time><charname>' },
        { pattern: /\x29<\/span> <b>/g, replacement: '</time><charname>' },
        { pattern: /:<\/b><\/font>/g, replacement: '</charname><postcontent>' },
        { pattern: /:<\/b><\/span>/g, replacement: '</charname><postcontent>' },
        { pattern: /<\/b><\/font>/g, replacement: '</charname><postcontent>' },
        { pattern: /<\/b><\/span>/g, replacement: '</charname><postcontent>' },
        { pattern: /<br>/g, replacement: '</postcontent></post>' },
    ];

    for (const { pattern, replacement } of replacements) {
        htmlFile = htmlFile.replace(pattern, replacement);
    }

    return htmlFile;
}
function extractDateFromHeader(header: string): Date | undefined {
    const monthNames: { [key: string]: number } = {
      'jan': 0, 'febr': 1, 'márc': 2, 'ápr': 3, 'máj': 4, 'jún': 5, 'júl': 6, 'aug': 7, 'szept': 8, 'okt': 9, 'nov': 10, 'dec': 11
    };
    const regex = /([0-9][0-9][0-9][0-9])\. ([^\.,]+?)\. ([0-9]+)\., .+, ([0-9][0-9]):([0-9][0-9]):([0-9][0-9])/;
    const parts = header.match(regex);
    if (parts) {
        if(parts.length >= 7) {
            const year = parseInt(parts[1], 10);
            const month = monthNames[parts[2].toLowerCase()];
            const day = parseInt(parts[3], 10);
            const hours = parseInt(parts[4], 10);
            const minutes = parseInt(parts[5], 10);
            const seconds = parseInt(parts[6], 10);
            if (!isNaN(year) && month !== undefined && !isNaN(day) && !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
                return new Date(year, month, day, hours, minutes, seconds);
            }
        }
    }
    console.log("Failed to extract date from the string '" + header + "'.");
    return undefined; // Date extraction failed
  }
  
  
  
function extractDateFromPost(dateString: string, existingDate?: Date): Date | undefined {
    // Handle date format "2023-01-11 00:52:12" or other unrecognized formats
    const parsedDate = Date.parse(dateString);
    if (!isNaN(parsedDate)) {
      return new Date(parsedDate);
    }

    if (dateString.includes(':')) {
      const timeParts = dateString.split(':');
      if (timeParts.length === 3) {
        // Handle time format "06:36:27"
        const [hours, minutes, seconds] = timeParts.map(part => parseInt(part, 10));
        if (existingDate) {
          const newDate = new Date(existingDate.getTime());
          newDate.setHours(hours, minutes, seconds);
          return newDate;
        }
        return undefined; // No existing date provided, cannot create new date from time only
      }
    }
  
    console.log("Failed to extract time!");
    return undefined; // Unrecognized format, return undefined
}
  
  

export function extractDataFromXml(xmlString: string): UnifiedRpApi.ProcessedResult[] {
    const $ = cheerio.load(xmlString, { xmlMode: true });
    let result: UnifiedRpApi.ProcessedResult[] = [];

    // Iterate over 'body' elements
    $('body').each((idx, elem) => {
        const headerText = $(elem).find('h1').text();
        const match = headerText.match(/at (.*?)CE/);
        let convoDate : Date | undefined;
        if (match && match.length >= 2) {
            const extractedText = match[1].trim();
            convoDate = extractDateFromHeader(extractedText);
        } else {
            console.log("No /at(.*?)CE/ patteren found!")
            convoDate = extractDateFromHeader(headerText);
        }

        // Iterate over child nodes
        $(elem)
            .contents()
            .each((idx: number, elem: cheerio.Element) => {
                if (elem != null && elem.type === 'tag' && elem.name === 'post') {
                    const postContentElem = $(elem).find('postcontent');
                    let content = postContentElem.length > 0 ? postContentElem.html() : '';
                    content = content != null ? content.replace(/\n/g, '<br>').trim() : '';
                    result.push({
                        user: $(elem).find('charname').text().trim(),
                        content: content,
                        date: extractDateFromPost($(elem).find('time').text().trim(),convoDate) ?? 'Unknown',
                        streamlinedDate: false
                    });
                }
            });
    });
    return result;
}
export function extractDataFromHtmlFile(htmlPath: string): UnifiedRpApi.ProcessedResult[] {
    let xmlString = `<dummy>${fs.readFileSync(require.resolve(htmlPath))}</dummy>`;
    xmlString = performTagReplacements(xmlString);
    return extractDataFromXml(xmlString);
}