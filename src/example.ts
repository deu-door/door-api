import assert from 'assert';
import dotenv from 'dotenv';
import Door from './door/door';

dotenv.config();

const id = process.env.ID;
const password = process.env.PASSWORD;

assert(typeof id === 'string' && typeof password === 'string');

// door-api playground
(async () => {
	const door = new Door();

	// login and print user
	const user = await door.login(id, password);
	console.log('User:', user);

	// get user's term list
	const terms = await door.getTerms();
	console.log('Terms:', terms);

	// get user's courses
	const courses = await door.getCourses(terms[1].id);
	console.log('Courses:', courses);

	// get user's all notice posts
	const notices = (await Promise.all(courses.map(course => door.getNoticePostList(course.id)))).flat();
	console.log('Notices:', notices.slice(0, 3));

	// get user's all homeworks
	const homeworks = (await Promise.all(courses.map(course => door.getHomeworkList(course.id)))).flat();
	console.log('Homeworks:', homeworks.slice(0, 3));

	// get user's lectures
	const lectures = await door.getLectureList(courses[0].id);
	console.log('Lectures: ', lectures.slice(0, 3));
})();
