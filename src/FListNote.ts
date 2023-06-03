import * as fs from 'fs';
import cheerio from 'cheerio';
import * as UnifiedRpApi from './UnifiedRpApi';
import {Distance, decrementDate, formatDate} from './RelativeDate';
import {bbcodeToHtml} from './BBCode';

export interface FListNote {
  relativeDate?: string;
  longerText: string;
  sender?: string;
  date?: Date;
}

export interface FListNoteArchive {
  stats: fs.Stats;
  posts: FListNote[];
}

function extractSenderAndDistance(text: string): { sender: string; distance: Distance } {
    const [, sender, timeString] = text.match(/^(.+?) sent, ((?:\d+[a-z, ]+)+) ago$/) || [];
    const distance: Distance = {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  
    const timeUnits = timeString.split(', ');
    timeUnits.forEach((unit) => {
      const [, value, unitKey] = (unit.match(/(\d+)([a-z]+)/) || []) as [unknown, string, string];
      if (unitKey.includes('y')) distance.years = parseInt(value, 10);
      else if (unitKey.includes('mo')) distance.months = parseInt(value, 10);
      else if (unitKey.includes('w')) distance.weeks = parseInt(value, 10);
      else if (unitKey.includes('d')) distance.days = parseInt(value, 10);
      else if (unitKey.includes('h')) distance.hours = parseInt(value, 10);
      else if (unitKey.includes('m')) distance.minutes = parseInt(value, 10);
      else if (unitKey.includes('s')) distance.seconds = parseInt(value, 10);
    });
  
    return { sender, distance };
}

function isLastElementDuplicate(posts: FListNote[], element: FListNote): boolean {
    if (posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      const isDuplicate =
        lastPost.longerText === element.longerText ||
        (element.relativeDate != null && lastPost.longerText.substring(0, 32) === element.relativeDate.substring(0, 32)) ||
        lastPost.longerText.substring(lastPost.longerText.length - 1, lastPost.longerText.length - 32) === element.longerText.substring(element.longerText.length - 1, element.longerText.length - 32);
  
      return isDuplicate;
    }
    return false;
}
  
export function extractPostsFromHTML($: cheerio.Root): FListNote[] {
    const posts: FListNote[] = [];
  // cheerio.Elem
    $(".FormattedBlock").each(function (idx :number, elem : cheerio.Element) {
      const inputString = $(elem).text();
      const colonIndex = inputString.indexOf(":");
      const newElement: FListNote = {
        relativeDate: inputString.substring(0, colonIndex).trim(),
        longerText: inputString.substring(colonIndex + 1).trim(),
      };
  
      if (!isLastElementDuplicate(posts, newElement)) {
        posts.push(newElement);
      }
    });
  
    return posts;
}
  
export function preprocessExtractedPosts(posts: FListNote[], stats: fs.Stats): FListNoteArchive {
    posts.forEach((obj) => {
      if (obj.relativeDate != null) {
        const { sender, distance } = extractSenderAndDistance(obj.relativeDate);
        const decrementedDate = decrementDate(stats.mtime, distance);
        obj.sender = sender;
        obj.date = decrementedDate;
        delete obj.relativeDate;
      }
    });
  
    posts.forEach(function (currentValue, index) {
      if (currentValue.date != null) {
        currentValue.date.setSeconds(currentValue.date.getSeconds() + index);
      }
    });
    return {
        stats: stats,
        posts: posts,
    };
}
export function StandardizePostLogs(input: FListNoteArchive): UnifiedRpApi.ProcessedResult[] {
    return input.posts
      .filter((element) => element.date != null && element.sender != null)
      .map((element) => ({
        name: element.sender!,
        content: bbcodeToHtml(element.longerText),
        date: formatDate(element.date!),
      }));
}
  
export function extractFromHtmlString(htmlFile: string, stats: fs.Stats) : FListNoteArchive
{
    const $ = cheerio.load(htmlFile, { xmlMode: false });

    const posts = extractPostsFromHTML($);
  
    return preprocessExtractedPosts(posts,stats);
}
export function extractFromHtmlFile(htmlPath: string) : FListNoteArchive
{
    const stats = fs.statSync(htmlPath);
    const htmlfile = "" + fs.readFileSync(require.resolve(htmlPath)) + "";
    const $ = cheerio.load(htmlfile, { xmlMode: false });
  
    const posts = extractPostsFromHTML($);
  
    return preprocessExtractedPosts(posts,stats);
}
export function processHtmlString(htmlFile: string, stats: fs.Stats) : UnifiedRpApi.ProcessedResult[]
{
    return StandardizePostLogs(extractFromHtmlString(htmlFile,stats));
}
export function processFromHtmlFile(htmlPath: string) : UnifiedRpApi.ProcessedResult[]
{
    return StandardizePostLogs(extractFromHtmlFile(htmlPath));
}
