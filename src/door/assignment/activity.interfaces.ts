import { AssignmentType, AssignmentVariant, BaseAssignmentHead } from './assignment.interfaces';
import { Homework } from './homework.interfaces';
import { TeamProject } from './team_project.interfaces';

/**
 * 수업활동일지는 List View에서 제출 여부를 확인할 수 없음
 */
export type ActivityHead = Omit<BaseAssignmentHead, 'submitted'> & Pick<Activity, 'variant'>;

/**
 * 수업활동일지는 개인제출, 팀별제출 두 유형이 있음
 *
 * 개인제출인 경우 과제({@link Homework}), 팀별제출인 경우 팀프로젝트 결과({@link TeamProject})가 됨
 *
 * 수업활동일지 타입은 type 멤버로 {@link Homework}인지, {@link TeamProject}인지 판별
 *
 * @example
 * ```
 * if (activity.type === AssignmentType.INDIVIDUAL) {
 *   // activity is Homework
 * }
 * else if (activity.type === AssignmentType.TEAM) {
 *   // activity is TeamProject
 * }
 * ```
 */
export type Activity =
	| (Omit<Homework, 'variant' | 'type'> & { readonly variant: AssignmentVariant.ACTIVITY; type: AssignmentType.INDIVIDUAL })
	| (Omit<TeamProject, 'variant' | 'type'> & { readonly variant: AssignmentVariant.ACTIVITY; type: AssignmentType.TEAM });
