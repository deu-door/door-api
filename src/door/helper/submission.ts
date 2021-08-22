import { Submission } from '../assignment/assignment.interfaces';

export const parseSubmission = (table: HTMLTableElement): Submission => {
	return {
		contents: table.querySelector('textarea')?.textContent || '',
		attachments: [...table.querySelectorAll<HTMLAnchorElement>('.filelist .fileitembox a[title=다운로드]')]
			.map(element => ({
				title: element.innerText ?? '파일',
				url: element.getAttribute('href') ?? '',
			}))
			.filter(attachment => attachment.url !== ''),
	};
};
