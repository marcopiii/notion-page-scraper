import {Page} from './model';
import {recursivelyScrape} from './recursivelyScrape';

export {Page};

/**
 * @param f a function to be applied on an object containing both the responses to
 * - {@link https://developers.notion.com/reference/retrieve-a-page GET /pages/page_id},
 * - {@link https://developers.notion.com/reference/get-block-children GET /blocks/page_id/children},
 *
 * for a given page.
 * **NOTE**: this function must never throw, any error will not be catched.
 *
 * @returns a function that takes a Notion page id as a parameter, finds all its child pages (recursively), and applies the given `f` to all of them.
 * **NOTE**: it doesn't access pages in databases
 */
export function scrape<A>(f: (p: Page) => A) {
  return (page_id: string) => recursivelyScrape('as-page')(f)(page_id)();
}
