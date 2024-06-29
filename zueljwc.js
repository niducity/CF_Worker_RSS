addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 发送 HTTP 请求获取网页内容
  const response = await fetch('https://jwc.zuel.edu.cn/5768/list.htm');
  const html = await response.text();

  // 提取与指定格式的条目类似的内容
  const regex = /<li class="column-news-item item-\d+ clearfix"><span class="column-news-title"><a href='(.*?)'.*?>(.*?)<\/a><\/span><span class="column-news-date news-date-hide">(.*?)<\/span><\/li>/g;
  let match;
  const items = [];
  
  // 跳过置顶的前两条无用推广
  let count = 0;
  while ((match = regex.exec(html)) !== null) {
    count++;
    if (count > 2) {
      const link = match[1];
      const title = match[2];
      const date = match[3];
      items.push({ title, link, date });
    }
  }

  // 生成 RSS 内容
  const rssItems = items.map(item => `
    <item>
      <title>${item.title}</title>
      <link>https://jwc.zuel.edu.cn${item.link}</link>
      <pubDate>${item.date}</pubDate>
    </item>
  `);

  const rssContent = `
    <rss version="2.0">
      <channel>
        <title>中南财经政法大学教务部</title>
        <link>https://jwc.zuel.edu.cn/main.htm</link>
        <description>中南财经政法大学教务部学生通知</description>
        ${rssItems.join('')}
      </channel>
    </rss>
  `;

  // 返回 RSS 内容
  return new Response(rssContent, {
    headers: {
      'Content-Type': 'application/rss+xml'
    }
  });
}
