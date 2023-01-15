import {apply, array, option, task, taskEither, taskOption} from 'fp-ts';
import {pipe} from 'fp-ts/function';

import * as notionClient from './notionClient';
import {analyzePageContent} from './analyzePageContent';
import {Page} from './model';

export function recursivelyScrape(mode: 'as-page' | 'as-block') {
  return <A>(f: (p: Page) => A) =>
    (block_id: string) =>
      pipe(
        notionClient.getChildrenBlocks(block_id),
        taskEither.chain(res => {
          const doSomething: taskOption.TaskOption<A> =
            mode === 'as-page'
              ? pipe(
                  notionClient.getPageInfo(block_id),
                  taskOption.fromTaskEither,
                  taskOption.map(pageInfo => f({pageInfo, pageContent: res})) // note: `f` must never throw
                )
              : taskOption.none;

          const scrapeNestedBlocks: taskOption.TaskOption<A[]> = pipe(
            analyzePageContent(res.results),
            ({childPages, blocksWithChilds}) => [
              ...childPages.map(recursivelyScrape('as-page')(f)),
              ...blocksWithChilds.map(recursivelyScrape('as-block')(f)),
            ],
            array.sequence(task.task),
            task.map(r =>
              r.reduce((acc, curr) => [...acc, ...curr], Array<A>())
            ),
            t => taskOption.fromTask(t)
          );

          return pipe(
            apply.sequenceS(task.task)({
              thisPage: doSomething,
              nestedPages: scrapeNestedBlocks,
            }),
            task.map(({thisPage, nestedPages}) => [
              ...pipe(thisPage, a => [a], array.compact),
              ...pipe(
                nestedPages,
                option.getOrElse(() => Array<A>())
              ),
            ]),
            t => taskEither.rightTask<string, A[]>(t)
          );
        }),
        taskEither.fold(() => task.of([]), task.of)
      );
}
