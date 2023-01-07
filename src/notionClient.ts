import * as TE from 'fp-ts/TaskEither';

import {Client} from '@notionhq/client';
import {RateLimiter} from 'limiter';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const limiter = new RateLimiter({
  interval: 'second',
  tokensPerInterval: 3,
});

export function getChildrenBlocks(block_id: string) {
  return TE.tryCatch(
    async () => {
      await limiter.removeTokens(1);
      console.log(`GET /blocks/${block_id}/children`);
      return notion.blocks.children.list({block_id});
    },
    reason => `${reason}`
  );
}

export function getPageInfo(page_id: string) {
  return TE.tryCatch(
    async () => {
      await limiter.removeTokens(1);
      console.log(`GET /pages/${page_id}`);
      return notion.pages.retrieve({page_id});
    },
    reason => `${reason}`
  );
}
