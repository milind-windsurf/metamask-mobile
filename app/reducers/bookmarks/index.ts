import { BookmarksAction, BookmarksActionType } from '../../actions/bookmarks/types';
import { BookmarksState } from './types';

export * from './types';

const initialState: BookmarksState = [];

/* eslint-disable @typescript-eslint/default-param-last */
const bookmarksReducer = (
  state: BookmarksState = initialState,
  action: BookmarksAction,
): BookmarksState => {
  switch (action.type) {
    case BookmarksActionType.ADD_BOOKMARK:
      return [...state, action.bookmark];
    case BookmarksActionType.REMOVE_BOOKMARK:
      return state.filter((item) => item.url !== action.bookmark.url);
    default:
      return state;
  }
};

export default bookmarksReducer;
