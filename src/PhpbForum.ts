import cheerio from 'cheerio';
import got from 'got';
import * as UnifiedRpApi from './UnifiedRpApi';
import extractPostsFromTopic from './PhpbTopic';

export async function fetchIndex(forumLink: string, target: string | undefined, topicMap: Map<string, UnifiedRpApi.ProcessedResult[]>, indexMap: Map<string,string>): Promise<void> {
  if (target == null) return;

  if (indexMap.has(target)) {
    return;
  } else indexMap.set(target,'f');

  const { body } = await got.get(forumLink + target);
  const $ = cheerio.load(body);

  const asub = $(".hierarchy a.forumlink").toArray();
  const atopic = $("div.topictitle a").toArray();

  const topicLinks = asub.concat(atopic).map((elem) => $(elem).attr('href'));

  for (const a of asub) {
    await fetchIndex(forumLink, $(a).attr('href'), topicMap, indexMap);
  }

  for (const a of atopic) {
    await fetchTopic(forumLink, $(a).attr('href'), topicMap, indexMap);
  }
}

export async function fetchTopic(forumLink: string, destination: string | undefined, topicMap: Map<string, UnifiedRpApi.ProcessedResult[]>, indexMap: Map<string,string>): Promise<void> {
  if (destination == null) return;
  if (indexMap.has(destination)) {
    return;
  } else indexMap.set(destination,'t');

  const { body } = await got.get(forumLink + destination);
  const $ = cheerio.load(body);
  const result = extractPostsFromTopic($);

  topicMap.set(destination, result);

  for (const a of $("table.noprint td.row1 a img.sprite-arrow_subsilver_right").parent().toArray()) {
    await fetchTopic(forumLink, $(a).attr("href") || '', topicMap, indexMap);
  }
}
