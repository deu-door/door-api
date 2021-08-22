export interface User {
	/**
	 * Door 시스템에서 사용되는 아이디(학번) (예: 20172000)
	 */
	readonly id: string;
	/**
	 * Door 시스템 상 등록되어 있는 이름 (예: 홍길동)
	 */
	name: string;
	/**
	 * 학생 구분 (예: 학부생)
	 */
	studentType: string;
	/**
	 * 전공 (예: 컴퓨터공학과)
	 */
	major: string;
	/**
	 * 프로필 사진 URL
	 */
	profileUrl: string;
}
