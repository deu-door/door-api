import { AssignmentVariant, BaseAssignment, BaseAssignmentHead } from './assignment.interfaces';

export type HomeworkHead = BaseAssignmentHead & Pick<Homework, 'variant' | 'submitted' | 'week' | 'period'>;

export interface Homework extends BaseAssignment {
	readonly variant: AssignmentVariant.HOMEWORK;
	/**
	 * 주차 (예: 3 (3주차))
	 */
	week: number;
	/**
	 * 차시 (예: 4 (4차시))
	 */
	period: number;
}
