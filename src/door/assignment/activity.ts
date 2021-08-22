import assert from 'assert';
import { Course } from '../course/course.interfaces';
import Door from '../door';
import { parseListedTableElement } from '../helper/table';
import { Activity, ActivityHead } from './activity.interfaces';
import { AssignmentType, AssignmentVariant } from './assignment.interfaces';
import { getHomework } from './homework';
import { getTeamProject } from './team_project';

export async function getActivityList(door: Door, courseId: Course['id']): Promise<ActivityHead[]> {
	const { document, HTMLTableElement } = await door.get(`/LMS/LectureRoom/CourseOutputs/${courseId}`);
	const table = document.querySelector('#sub_content2 > div > table');

	assert(table instanceof HTMLTableElement);

	const activityHeads: ActivityHead[] = parseListedTableElement(table)
		// filter for 등록된 산출물이 없습니다
		.filter(row => /\d+/.test(row['No'].text))
		.map(row => {
			const [from, to] = row['제출기간'].text.split('~').map(date => new Date('20' + date.trim()).toISOString());
			const type =
				row['제출방식'].text === '개인제출'
					? AssignmentType.INDIVIDUAL
					: row['제출방식'].text === '팀별제출'
					? AssignmentType.TEAM
					: AssignmentType.INDIVIDUAL;

			return {
				variant: AssignmentVariant.ACTIVITY as const,
				type,
				partial: true as const,

				id: row['주제'].url?.match(/HomeworkNo=(\d+)/)?.[1] || '',
				courseId,

				title: row['주제'].text,
				duration: { from, to },
			};
		})
		.filter(activityHead => activityHead.id !== '');

	return activityHeads;
}

export async function getActivity(door: Door, head: Pick<ActivityHead, 'courseId' | 'id' | 'type'>): Promise<Activity> {
	switch (head.type) {
		case AssignmentType.INDIVIDUAL:
			return {
				...(await getHomework(door, head)),
				variant: AssignmentVariant.ACTIVITY,
			};
		case AssignmentType.TEAM:
			return {
				...(await getTeamProject(door, head)),
				variant: AssignmentVariant.ACTIVITY,
			};
	}
}
