import { tool as listDuplicate } from './duplicate/meta';
import { tool as listUnwrap } from './unwrap/meta';
import { tool as listReverse } from './reverse/meta';
import { tool as listFindUnique } from './find-unique/meta';
import { tool as listFindMostPopular } from './find-most-popular/meta';
import { tool as listGroup } from './group/meta';
import { tool as listWrap } from './wrap/meta';
import { tool as listRotate } from './rotate/meta';
import { tool as listTruncate } from './truncate/meta';
import { tool as listShuffle } from './shuffle/meta';
import { tool as listSort } from './sort/meta';

export const listTools = [
  listSort, // TODO: Check if uses ToolContent - Needs update to use ToolContent
  // listUnwrap,
  listReverse, // TODO: Check if uses ToolContent - Needs update to use ToolContent
  listFindUnique, // TODO: Check if uses ToolContent - Needs update to use ToolContent
  listFindMostPopular, // TODO: Check if uses ToolContent - Needs update to use ToolContent
  listGroup, // TODO: Check if uses ToolContent - Needs update to use ToolContent
  // listWrap,
  listRotate, // TODO: Check if uses ToolContent - Needs update to use ToolContent
  listShuffle // TODO: Check if uses ToolContent - Needs update to use ToolContent
  // listTruncate,
  // listDuplicate
];
