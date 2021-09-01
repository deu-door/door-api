import assert from 'assert';
import { Course } from '../course/course.interfaces';
import { Door } from '..';
import { parseInformaticTableElement, parseListedTableElement } from '../helper/table';
import { BasePost, BasePostHead, PostVariant } from './post.interfaces';
import { parseAttachmentList } from '../attachment/attachment';

export async function getPostList(door: Door, courseId: Course['id'], variant: PostVariant): Promise<BasePostHead[]> {
	const { document, HTMLTableElement, HTMLImageElement } = await door.get(
		`/BBS/Board/List/${
			variant === PostVariant.NOTICE ? 'CourseNotice' : variant === PostVariant.REFERENCE ? 'CourseReference' : ''
		}?cNo=${courseId}&pageRowSize=200`,
	);
	const table = document.querySelector('table.tbl_type');

	assert(table instanceof HTMLTableElement);

	const postHeads: BasePostHead[] = parseListedTableElement(table)
		.map(row => ({
			variant,
			partial: true as const,

			id: row['제목'].url?.match(/\/Read\/[A-Za-z]+\/(\w+)?/)?.[1] || '',
			courseId,

			author: row['작성자'].text,
			createdAt: new Date(row['등록일'].text).toISOString(),
			title: row['제목'].text,
			views: Number(row['조회'].text),
			noted: row['읽음'].querySelector('img[alt=확인]') instanceof HTMLImageElement,
		}))
		.filter(postHead => postHead.id !== '');

	return postHeads;
}

export async function getPost(door: Door, head: Pick<BasePostHead, 'courseId' | 'variant' | 'id'>): Promise<BasePost> {
	const { courseId, variant, id } = head;

	const urlParam = variant === PostVariant.NOTICE ? 'CourseNotice' : variant === PostVariant.REFERENCE ? 'CourseReference' : '';

	// /BBS/Board/Read 로 요청을 보내면 서버 자체적으로 "읽음" 처리된 후 /BBS/Board/Detail로 리다이렉트됨
	const url = `/BBS/Board/Read/${urlParam}/${id}?cNo=${courseId}`;
	const referer = `/BBS/Board/Detail/${urlParam}/${id}?cNo=${courseId}`; // 첨부파일에 필요한 referer 주소

	const { document, HTMLTableElement } = await door.get(url);
	const detailTable = document.querySelector('table.tbl_type');

	assert(detailTable instanceof HTMLTableElement);

	const detail = parseInformaticTableElement(detailTable);
	const attachments = parseAttachmentList(detail['첨부파일'], referer);

	return {
		variant,
		partial: false,

		id,
		courseId,
		title: detail['제목'].text,
		author: detail['작성자'].text,
		createdAt: new Date(detail['등록일'].text).toISOString(),
		views: Number(detail['조회'].text),
		contents: detail['내용'].innerHTML || '',
		noted: true,
		attachments: attachments,
	};
}
