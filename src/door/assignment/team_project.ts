import assert from 'assert';
import { Course } from '../course/course.interfaces';
import { Door } from '..';
import { parseSubmission } from '../helper/submission';
import { parseInformaticTableElement, parseListedTableElement } from '../helper/table';
import { AssignmentType, AssignmentVariant } from './assignment.interfaces';
import { TeamProject, TeamProjectHead } from './team_project.interfaces';
import { parseAttachmentList } from '../attachment/attachment';

export async function getTeamProjectList(door: Door, courseId: Course['id']): Promise<TeamProjectHead[]> {
	const document = await door.get(`/LMS/LectureRoom/CourseTeamProjectStudentList/${courseId}`);

	const teamProjectTable = document.querySelector('#sub_content2 > div:nth-child(4) > table');
	assert(teamProjectTable?.tagName.toLowerCase() === 'table');

	const teamProjectHeads: TeamProjectHead[] = parseListedTableElement(teamProjectTable)
		// filter for 등록된 팀프로젝트가 없습니다
		.filter(row => /\d+/.test(row['No'].text.trim()))
		.map(row => {
			const [from, to] = row['제출기간'].text
				.trim()
				.split('~')
				.map(date => new Date('20' + date.trim()).toISOString());

			return {
				variant: AssignmentVariant.TEAM_PROJECT as const,
				partial: true as const,

				id: row['팀프로젝트 제목'].url?.match(/ProjectNo=(\d+)/)?.[1] || '',
				courseId: courseId,

				title: row['팀프로젝트 제목'].text.trim(),
				type: AssignmentType.TEAM,
				// TODO: implement 제출방식 (예: 팀장제출)
				duration: { from, to },
				submitted: row['제출 여부'].text.trim() === '제출',
			};
		})
		.filter(teamProjectHead => teamProjectHead.id !== '');

	return teamProjectHeads;
}

export async function getTeamProject(door: Door, head: Pick<TeamProjectHead, 'courseId' | 'id'>): Promise<TeamProject> {
	const { courseId, id } = head;
	const url = `/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo=${courseId}&ProjectNo=${id}`;
	const document = await door.get(url);

	const descriptionTable = document.querySelector('.form_table_b table');
	const submissionTable = document.querySelector('.form_table_s table');
	const form = document.querySelector('#CourseLeture');
	assert(
		descriptionTable?.tagName.toLowerCase() === 'table' &&
			submissionTable?.tagName.toLowerCase() === 'table' &&
			form?.tagName.toLowerCase() === 'form',
	);

	const description = parseInformaticTableElement(descriptionTable);
	const attachments = parseAttachmentList(description['첨부파일'], url);
	const [from, to] = description['제출기간'].text
		.trim()
		.split('~')
		.map(date => new Date('20' + date.trim()).toISOString());

	// 제출 관련 정보 파싱
	const submission = parseSubmission(submissionTable, url);

	return {
		variant: AssignmentVariant.TEAM_PROJECT,
		partial: false,

		id,
		courseId,

		type: AssignmentType.TEAM,
		// 수업활동일지에선 '주제' 가 사용됨
		title: description['제목']?.text.trim() ?? description['주제']?.text.trim() ?? '제목이 없습니다',
		// 수업활동일지에선 '수업내용' 이 사용됨
		contents: description['내용']?.innerHTML ?? description['수업내용']?.innerHTML ?? '',

		duration: { from, to },
		attachments,
		submitted: submission.contents.length > 0 || submission.attachments.length > 0,
		submission,
	};
}
