import { AssignmentType } from '../assignment';

export function parseAssignmentType(_rawType: string): AssignmentType {
	const rawType = _rawType.replace(' ', '').trim();
	if (rawType === '개인과제' || rawType === '개인제출' || rawType.includes('개인')) {
		return AssignmentType.INDIVIDUAL;
	} else if (rawType === '팀별과제' || rawType === '팀별제출' || rawType.includes('팀')) {
		return AssignmentType.TEAM;
	}
	return AssignmentType.INDIVIDUAL;
}
