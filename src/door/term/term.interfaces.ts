/**
 * @description 학기 인터페이스
 *
 * @example 2020년 1학기, 2020년 하계학기(계절학기)
 */
export interface Term {
	/**
	 * 학기에 해당되는 ID (예: 7)
	 */
	readonly id: string;
	/**
	 * 학기 이름 (예: 2020년 1학기)
	 */
	name: string;
}
