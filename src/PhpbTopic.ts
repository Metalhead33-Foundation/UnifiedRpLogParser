import cheerio from 'cheerio';
import * as UnifiedRpApi from './UnifiedRpApi';

export default function extractPostsFromTopic($: cheerio.Root) : UnifiedRpApi.ProcessedResult[]
{
    const result : UnifiedRpApi.ProcessedResult[] = [];
    $(".forumline > tbody > tr.post").each((idx, elem) => {
        const contentElement = $(elem).find("div.postbody > div");
        let contentString = contentElement != null ? contentElement.html() : '';
        contentString = contentString != null ? contentString.trim() : '';
        result.push({
            name: $(elem).find("span.name").text().trim(),
            streamlinedDate: false,
            content: contentString,
            date: $(elem).find("table > tbody > tr > td > span.postdetails").contents().filter( function(this : Node) { return this.nodeType === 3 }).last().text().trim(),
        });
    });
    return result;
}