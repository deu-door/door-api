import { AssignmentType, AssignmentVariant, BaseAssignment, BaseAssignmentHead } from './assignment.interfaces';

export type TeamProjectHead = BaseAssignmentHead & Pick<TeamProject, 'variant' | 'submitted'>;

export interface TeamProject extends BaseAssignment {
	readonly variant: AssignmentVariant.TEAM_PROJECT;

	type: AssignmentType.TEAM;
}
