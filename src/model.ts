import {
  GetPageResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';

export type Page = {
  pageInfo: GetPageResponse;
  pageContent: ListBlockChildrenResponse;
};
