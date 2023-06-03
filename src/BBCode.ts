function bbcodeUrlToHtml(text: string): string {
    const urlPattern = /\[url=([^[\]]+)\]([^[\]]+)\[\/url\]/g;
    const urlReplacement = '<a href="$1">$2</a>';
  
    return text.replace(urlPattern, urlReplacement);
}

export function bbcodeToHtml(bbcode: string): string {
    const tags = [
      { bbcode: /\[b\]/g, html: '<strong>' },
      { bbcode: /\[\/b\]/g, html: '</strong>' },
      { bbcode: /\[i\]/g, html: '<em>' },
      { bbcode: /\[\/i\]/g, html: '</em>' },
      { bbcode: /\[u\]/g, html: '<u>' },
      { bbcode: /\[\/u\]/g, html: '</u>' },
    ];
  
    let html = bbcode;
  
    tags.forEach((tag) => {
      html = html.replace(tag.bbcode, tag.html);
    });
    html = bbcodeUrlToHtml(html);
    html = html.replace(/\r?\n/g, "<br>");
  
    return html;
}