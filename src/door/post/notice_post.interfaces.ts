import { BasePost, BasePostHead, PostVariant } from './post.interfaces';

export type NoticePostHead = BasePostHead & Pick<NoticePost, 'variant'>;

export interface NoticePost extends BasePost {
	readonly variant: PostVariant.NOTICE;
}
