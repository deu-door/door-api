import assert from 'assert';
import { Course } from '../course/course.interfaces';
import { Door } from '..';
import { parseListedTableElement } from '../helper/table';
import { Activity, ActivityHead } from './activity.interfaces';
import { AssignmentType, AssignmentVariant } from './assignment.interfaces';
import { getHomework } from './homework';
import { getTeamProject } from './team_project';
import { parseAssignmentType } from '../helper/assignment';

export async function getActivityList(door: Door, courseId: Course['id']): Promise<ActivityHead[]> {
	const document = await door.get(`/LMS/LectureRoom/CourseOutputs/${courseId}`);

	const table = document.querySelector('#sub_content2 > div > table');
	assert(table?.tagName.toLowerCase() === 'table');

	const activityHeads: ActivityHead[] = parseListedTableElement(table)
		// filter for 등록된 산출물이 없습니다
		.filter(row => /\d+/.test(row['No'].text.trim()))
		.map(row => {
			const [from, to] = row['제출기간'].text
				.trim()
				.split('~')
				.map(date => new Date('20' + date.trim()).toISOString());

			return {
				variant: AssignmentVariant.ACTIVITY as const,
				type: parseAssignmentType(row['제출방식'].text.trim()),
				partial: true as const,

				id: row['주제'].url?.match(/HomeworkNo=(\d+)/)?.[1] ?? row['주제'].url?.match(/ProjectNo=(\d+)/)?.[1] ?? '',
				courseId,

				title: row['주제'].text.trim(),
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
