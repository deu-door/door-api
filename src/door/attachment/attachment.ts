import { HTMLElement } from 'node-html-parser';
import { Attachment } from './attachment.interfaces';

export function parseAttachmentList(container: HTMLElement, referrer: string): Attachment[] {
	return container
		.querySelectorAll('a')
		.filter(a => a.getAttribute('href') !== '#')
		.map(element => ({
			title: element.text.trim() || '파일',
			url: element.getAttribute('href') ?? '',
			referrer: referrer.startsWith('/') ? `http://door.deu.ac.kr/${referrer}` : referrer,
		}))
		.filter(attachment => attachment.url !== '');
}
