This micro library provides a utility to use the Notion API to get data from a page and all its nested children with a single line of code.

For each page found you will be provided with data about the page and its content.

This utility tries to be as agnostc as possible about the logic you are going to apply on the fetched pages, thus the interface provides the objects `GetPageResponse` and `ListBlockChildrenResponse` exactly as they are returned by the API.

For information about how to manipulate such objects, refer to the [Notion API Documnentation](https://developers.notion.com/reference/intro) and the [official SDK](https://www.npmjs.com/package/@notionhq/client).

### Working with `Task`

The utility returns a `Task` to allow you to manipulate the result in functional style (see [Task](https://gcanti.github.io/fp-ts/modules/Task.ts.html)). If you are not familiar with fp-ts, you can get a `Promise` from the task just by running it

```
const myTask: Task<A> = ...
const myPromise: Promise<A> = myTask()
```

## Examples

Browse all the pages nested in the target page and extract their names

```ts
import {scrape} from 'notion-page-scraper';

function getPageName(p: Page): string {
  return (
    ('properties' in p.pageInfo &&
      'title' in p.pageInfo.properties &&
      p.pageInfo.properties.title.type === 'title' &&
      p.pageInfo.properties.title.title.map(rti => rti.plain_text).join('')) ||
    'missing title'
  );
}

const getAllThePagesNames: Task<string[]> = scrape(getPageName)(
  'b4df9247-ebde-471a-8bbc-eb202f01359f'
);

const names: string[] = await getAllThePagesNames();
```

Find all the pages nested in the target page where the first block is a callout with a mention, and extract the user's name

```ts
import {scrape} from 'notion-page-scraper';
import {array, option, task} from 'fp-ts';
import {pipe} from 'fp-ts/function';

function getMentionedUser(p: Page): option.Option<string> {
  const blocks = p.pageContent.results;

  return option.fromNullable(
    blocks[0] &&
      'type' in blocks[0] &&
      blocks[0].type === 'callout' &&
      blocks[0].callout.text[0]?.type === 'mention' &&
      blocks[0].callout.text[0]?.mention.type === 'user' &&
      'name' in blocks[0].callout.text[0]?.mention.user
      ? blocks[0].callout.text[0]?.mention.user.name
      : null
  );
}

const getAllTheMentionedUsers: Task<string[]> = pipe(
  scrape(getMentionedUser)('b4df9247-ebde-471a-8bbc-eb202f01359f'),
  task.map(array.compact)
);

const users: string[] = await getAllTheMentionedUsers();
```

## Known limitations

The current implementation will not access pages inside databases: the `f` will be applied to database page but not on the pages inside it.
