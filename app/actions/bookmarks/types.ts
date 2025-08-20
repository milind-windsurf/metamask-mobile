import { type Action } from 'redux';

export interface Bookmark {
  url: string;
  name: string;
}

export enum BookmarksActionType {
  ADD_BOOKMARK = 'ADD_BOOKMARK',
  REMOVE_BOOKMARK = 'REMOVE_BOOKMARK',
}

export type AddBookmarkAction = Action<BookmarksActionType.ADD_BOOKMARK> & {
  bookmark: Bookmark;
};

export type RemoveBookmarkAction = Action<BookmarksActionType.REMOVE_BOOKMARK> & {
  bookmark: Bookmark;
};

export type BookmarksAction = AddBookmarkAction | RemoveBookmarkAction;
