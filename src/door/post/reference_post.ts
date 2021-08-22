import { Course } from '../course/course.interfaces';
import Door from '../door';
import { getPost, getPostList } from './post';
import { PostVariant } from './post.interfaces';
import { ReferencePost, ReferencePostHead } from './reference_post.interfaces';

export async function getReferencePostList(door: Door, courseId: Course['id']): Promise<ReferencePostHead[]> {
	return (await getPostList(door, courseId, PostVariant.REFERENCE)) as ReferencePostHead[];
}

export async function getReferencePost(door: Door, head: Pick<ReferencePostHead, 'courseId' | 'id'>): Promise<ReferencePost> {
	return (await getPost(door, { variant: PostVariant.REFERENCE, ...head })) as ReferencePost;
}
