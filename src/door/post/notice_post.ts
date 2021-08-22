import { Course } from '../course/course.interfaces';
import Door from '../door';
import { NoticePost, NoticePostHead } from './notice_post.interfaces';
import { getPost, getPostList } from './post';
import { PostVariant } from './post.interfaces';

export async function getNoticePostList(door: Door, courseId: Course['id']): Promise<NoticePostHead[]> {
	return (await getPostList(door, courseId, PostVariant.NOTICE)) as NoticePostHead[];
}

export async function getNoticePost(door: Door, head: Pick<NoticePostHead, 'courseId' | 'id'>): Promise<NoticePost> {
	return (await getPost(door, { variant: PostVariant.NOTICE, ...head })) as NoticePost;
}
