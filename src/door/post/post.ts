import assert from 'assert';
import { Attachment } from '../common/attachment.interfaces';
import { Course } from '../course/course.interfaces';
import { Door } from '../door';
import { parseInformaticTableElement, parseListedTableElement } from '../helper/table';
import { BasePost, BasePostHead, PostVariant } from './post.interfaces';

export async function getPostList(door: Door, courseId: Course['id'], variant: PostVariant): Promise<BasePostHead[]> {
	const { document, HTMLTableElement, HTMLImageElement } = await door.get(
		`/BBS/Board/List/Course${variant}?cNo=${courseId}&pageRowSize=200`,
	);
	const table = document.querySelector('table.tbl_type');

	assert(table instanceof HTMLTableElement);

	const postHeads: BasePostHead[] = parseListedTableElement(table)
		.map(row => ({
			variant,
			partial: true as const,

			id: row['제목'].url?.match(/CourseNotice\/(\w+)?/)?.[1] || '',
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

	// /BBS/Board/Read 로 요청을 보내면 서버 자체적으로 "읽음" 처리된 후 /BBS/Board/Detail로 리다이렉트됨
	const { document, HTMLTableElement } = await door.get(`/BBS/Board/Read/Course${variant}/${id}?cNo=${courseId}`);
	const detailTable = document.querySelector('table.tbl_type');

	assert(detailTable instanceof HTMLTableElement);

	const detail = parseInformaticTableElement(detailTable);

	const attachments: Attachment[] = [...detail['첨부파일'].querySelectorAll('a')]
		.map(fileElement => ({
			title: fileElement.textContent?.trim() || '',
			url: fileElement.getAttribute('href') || '',
		}))
		.filter(attachment => attachment.url !== '');

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
