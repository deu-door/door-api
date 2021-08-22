import { BasePost, BasePostHead, PostVariant } from './post.interfaces';

export type ReferencePostHead = BasePostHead & Pick<ReferencePost, 'variant'>;

export interface ReferencePost extends BasePost {
	readonly variant: PostVariant.REFERENCE;
}
