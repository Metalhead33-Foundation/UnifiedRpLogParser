import fs, { stat } from 'fs';
import cheerio from 'cheerio';
import * as UnifiedRpApi from './UnifiedRpApi';

// Interfaces
interface Replacement {
    pattern: RegExp;
    replacement: string;
}

// Function to perform HTML tag replacements
function performTagReplacements(htmlFile: string): string {
    const replacements: Replacement[] = [
        { pattern: /<p>/g, replacement: '' },
        { pattern: /<\/p>/g, replacement: '' },
        { pattern: /<span style="color: #16569E"><span style="font-size: smaller">\x28/g, replacement: '<post><time>' },
        { pattern: /<span style="color: #A82F2F"><span style="font-size: smaller">\x28/g, replacement: '<post><time>' },
        { pattern: /<span style="color: #062585"><span style="font-size: smaller">\x28/g, replacement: '<post><time>' },
        { pattern: /<font color="#16569E"><font size="2">\x28/g, replacement: '<post><time>' },
        { pattern: /<font color="#A82F2F"><font size="2">\x28/g, replacement: '<post><time>' },
        { pattern: /<font color="#062585"><font size="2">\x28/g, replacement: '<post><time>' },
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

export function extractDataFromXml(xmlString: string): UnifiedRpApi.ProcessedResult[] {
    const $ = cheerio.load(xmlString, { xmlMode: true });
    let result: UnifiedRpApi.ProcessedResult[] = [];

    // Iterate over 'body' elements
    $('body').each((idx, elem) => {
        const convoInfo = $(elem).find('h1').text().match(/(\d{4}.*) \d{2}:\d{2}:\d{2} CE/) || [];
        const convoDate = convoInfo[1] || 'unknown';

        // Iterate over child nodes
        $(elem)
            .contents()
            .each((idx: number, elem: cheerio.Element) => {
                if (elem != null && elem.type === 'tag' && elem.name === 'post') {
                    const postContentElem = $(elem).find('postcontent');
                    let content = postContentElem.length > 0 ? postContentElem.html() : '';
                    content = content != null ? content.replace(/\n/g, '<br>').trim() : '';
                    result.push({
                        name: $(elem).find('charname').text().trim(),
                        content: content,
                        date: convoDate + ' ' + $(elem).find('time').text().trim()
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