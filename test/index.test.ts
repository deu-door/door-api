import assert from 'assert';
import dotenv from 'dotenv';
import {
	AssignmentVariant,
	AssignmentVariants,
	Course,
	Door,
	DoorLoginError,
	DoorUnauthorizedError,
	PostVariant,
	PostVariants,
	Term,
	User,
} from '../';

dotenv.config();

jest.setTimeout(60 * 1000);

const id = process.env.ID;
const password = process.env.PASSWORD;
const door = new Door();
let user: User | undefined = undefined;
let terms: Term[] = [];
let courses: Course[] = [];

assert(typeof id === 'string' && typeof password == 'string');

describe('Test Login', () => {
	test('Check environment variables (ID, PASSWORd) are ready', () => {
		expect(typeof id).toBe('string');
		expect(typeof password).toBe('string');
	});

	test('Login with incorrect password', async () => {
		await expect(async () => await door.login('20000000', '20000000')).rejects.toThrow(DoorLoginError);
	});

	test('Login', async () => {
		user = await door.login(id, password);

		expect(user.id).toBe(id);
	});
});

describe('Test Terms', () => {
	test('Get Terms', async () => {
		terms = await door.getTermList();

		terms.forEach(term => {
			expect(term.name).toMatch(/^\d+년 \w+학기$/);
			expect(term.id).toMatch(/\d+/);
		});
	});
});

describe('Test Courses', () => {
	test('Get Courses', async () => {
		courses = await door.getCourseList(terms[1].id);

		courses.forEach(course => {
			expect(course.id).toMatch(/\d+/);
			expect(typeof course.name).toBe('string');
			expect(course.division).toMatch(/\d+/);
			expect(course.professor).toMatch(/[가-힣 ]+/);
			expect(terms.find(term => term.id === course.termId)).not.toBeUndefined();
			expect(course.type).toMatch(/[가-힣]+/);
		});
	});

	test('Get Course Syllabus', async () => {
		const syllabus = await door.getCourseSyllabus(courses[0].id);

		expect(typeof syllabus.book).toBe('string');
		expect(typeof syllabus.contact).toBe('string');
		expect(syllabus.credits).toBeGreaterThan(0);
		expect(typeof syllabus.description).toBe('string');
		expect(typeof syllabus.email).toBe('string');
		expect(typeof syllabus.goal).toBe('string');
		expect(syllabus.hours).toBeGreaterThanOrEqual(0);
		expect(typeof syllabus.major).toBe('string');
		expect(syllabus.target).toBeGreaterThanOrEqual(1); // 1학년 이상
		expect(syllabus.target).toBeLessThanOrEqual(4); // 4학년 이하

		syllabus.times.forEach(time => {
			expect(typeof time.room).toBe('string');
			expect(time.day).toMatch(/[월화수목금토일]/);
		});
	});
});

describe('Test Post', () => {
	for (const variant of PostVariants) {
		test(`Get ${variant} Post`, async () => {
			const heads = await (async () => {
				for (const course of courses) {
					const heads =
						variant === PostVariant.NOTICE
							? await door.getNoticePostList(course.id)
							: variant === PostVariant.REFERENCE
							? await door.getReferencePostList(course.id)
							: [];

					if (heads.length > 0) return heads;
				}
				return [];
			})();

			if (heads.length === 0) return;

			const head = heads[0];

			expect(head.variant).toBe(variant);
			expect(head.partial).toBe(true);
			expect(typeof head.title).toBe('string');
			expect(new Date(head.createdAt).toString()).not.toBe('Invalid Date');
			expect(typeof head.author).toBe('string');
			expect(typeof head.noted).toBe('boolean');

			const post =
				variant === PostVariant.NOTICE
					? await door.getNoticePost(head)
					: variant === PostVariant.REFERENCE
					? await door.getReferencePost(head)
					: undefined;

			assert(post !== undefined);

			expect(post.partial).toBe(false);
			expect(typeof post.contents).toBe('string');
		});
	}
});

describe('Test Assignment', () => {
	for (const variant of AssignmentVariants) {
		test(`Get ${variant} Post`, async () => {
			const heads = await (async () => {
				for (const course of courses) {
					const heads =
						variant === AssignmentVariant.HOMEWORK
							? await door.getHomeworkList(course.id)
							: variant === AssignmentVariant.TEAM_PROJECT
							? await door.getTeamProjectList(course.id)
							: variant === AssignmentVariant.ACTIVITY
							? await door.getActivityList(course.id)
							: [];

					if (heads.length > 0) return heads;
				}
				return [];
			})();

			if (heads.length === 0) return;

			const head = heads[0];

			expect(head.variant).toBe(variant);
			expect(head.partial).toBe(true);
			expect(typeof head.title).toBe('string');
			expect(new Date(head.duration.from).toString()).not.toBe('Invalid Date');
			expect(new Date(head.duration.to).toString()).not.toBe('Invalid Date');
			expect(typeof head.type).toBe('string');

			const assignment =
				head.variant === AssignmentVariant.HOMEWORK
					? await door.getHomework(head)
					: head.variant === AssignmentVariant.TEAM_PROJECT
					? await door.getTeamProject(head)
					: head.variant === AssignmentVariant.ACTIVITY
					? await door.getActivity(head)
					: undefined;

			assert(assignment !== undefined);

			expect(assignment.partial).toBe(false);
			expect(typeof assignment.contents).toBe('string');
			expect(typeof assignment.submitted).toBe('boolean');
		});
	}
});

describe('Test Logout', () => {
	test('Manually logout', async () => {
		await door.logout();

		await expect(async () => await door.getUser()).rejects.toThrow(DoorUnauthorizedError);
	});
});
