import cheerio from 'cheerio';
import * as UnifiedRpApi from './UnifiedRpApi';
import fs from 'fs';

export default function extractPostsFromTopic($: cheerio.Root) : UnifiedRpApi.ProcessedResult[]
{
    const result : UnifiedRpApi.ProcessedResult[] = [];
    $('table[role="grid"]').each((idx, elem) => {
        let username : string | undefined;
        let date : Date | undefined;
        let msg : string | null | undefined;
        $(elem).find('.o-user-link').each((idx, elem) => {
            username = $(elem).text();
        });
        $(elem).find('abbr.o-timestamp').each((idx, elem) => {
            // Get the date from the title attribute
            const titleValue = $(elem).attr('title');
            if(titleValue) {   
                date = new Date(titleValue);
            }
          });
          $(elem).find('div.message').each((idx, elem) => {
              msg = $(elem).html();
          });
          result.push({
            user: username ? username : 'Null',
            streamlinedDate: date ? true : false,
            content: msg ? msg : 'null',
            date: date ? date : 'null',
          });
    });
    return result;
}
export function extractDataFromHtmlFile(htmlPath: string): UnifiedRpApi.ProcessedResult[] {
    let htmlString = `${fs.readFileSync(require.resolve(htmlPath))}`;
    const $ = cheerio.load(htmlString);
    return extractPostsFromTopic($);
}