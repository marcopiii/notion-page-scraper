import {ListBlockChildrenResponse} from '@notionhq/client/build/src/api-endpoints';

type AnalyzedPageContentResult = {
  childPages: string[];
  blocksWithChilds: string[];
};

/**
 * Analyzes the content of a page, as a list of blocks.
 *
 * @returns an object of type `AnalyzedPageResult` containing
 * - a list of child pages found inside this page
 * - a list of blocks that should be inspected further to see if they contiain other pages
 */
export function analyzePageContent(
  pageContent: ListBlockChildrenResponse['results']
) {
  return pageContent.reduce<AnalyzedPageContentResult>(
    (acc, b) => {
      // this means that the block is not accessible to the integration
      if (!('type' in b)) return acc;

      return b.type === 'child_page'
        ? {
            childPages: [...acc.childPages, b.id],
            blocksWithChilds: acc.blocksWithChilds,
          }
        : b.has_children
        ? {
            childPages: acc.childPages,
            blocksWithChilds: [...acc.blocksWithChilds, b.id],
          }
        : acc;
    },
    {childPages: [], blocksWithChilds: []}
  );
}
