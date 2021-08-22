import { NoticePost, NoticePostHead } from './notice_post.interfaces';
import { ReferencePost, ReferencePostHead } from './reference_post.interfaces';

export type PostHead = NoticePostHead | ReferencePostHead;
export type Post = NoticePost | ReferencePost;
