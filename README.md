This micro library provides a utility to use the Notion API to get data from a page and all its nested children with a single line of code.

For each page found you will be provided with data about the page and its content.

This utility tries to be as agnostc as possible about the logic you are going to apply on the fetched pages, thus the interface provides the objects `GetPageResponse` and `ListBlockChildrenResponse` exactly as they are returned by the API.

For information about how to manipulate such objects, refer to the [Notion API Documnentation](https://developers.notion.com/reference/intro) and the [official SDK](https://www.npmjs.com/package/@notionhq/client).

## Examples

Browse all the pages nested in the target page and extract their names

```ts
import {scrape} from 'notion-page-scraper';

function getPageName(p: {pageInfo: GetPageResponse}): string {
  return (
    ('properties' in p.pageInfo &&
      'title' in p.pageInfo.properties &&
      p.pageInfo.properties.title.type === 'title' &&
      p.pageInfo.properties.title.title.map(rti => rti.plain_text).join('')) ||
    'missing title'
  );
}

scrape(getPageName)('b4df9247-ebde-471a-8bbc-eb202f01359f').then(r =>
  r.forEach(n => console.log(n))
);
```

Find all the pages nested in the target page where the first block is a callout with a mention, and extract the user's name

```ts
import {scrape} from 'notion-page-scraper';

function getMentionedUser(p: {pageContent: ListBlockChildrenResponse}) {
  const blocks = p.pageContent.results;

  return blocks[0] &&
    'type' in blocks[0] &&
    blocks[0].type === 'callout' &&
    blocks[0].callout.rich_text[0]?.type === 'mention' &&
    blocks[0].callout.rich_text[0]?.mention.type === 'user' &&
    'name' in blocks[0].callout.rich_text[0]?.mention.user
    ? blocks[0].callout.rich_text[0]?.mention.user.name
    : null;
}

scrape(getMentionedUser)('b4df9247-ebde-471a-8bbc-eb202f01359f').then(res =>
  res.filter(s => s !== null).forEach(s => console.log(s))
);
```

## Known limitations

The current implementation will not access pages inside databases: the `f` will be applied to database page but not on the pages inside it.
