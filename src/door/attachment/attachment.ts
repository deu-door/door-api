import { Attachment } from './attachment.interfaces';

export function parseAttachmentList(container: HTMLElement, referrer: string): Attachment[] {
	return [...container.querySelectorAll<HTMLAnchorElement>('a')]
		.filter(a => a.href !== '#')
		.map(element => ({
			title: element.text ?? '파일',
			url: element.getAttribute('href') ?? '',
			referrer: referrer.startsWith('/') ? `http://door.deu.ac.kr/${referrer}` : referrer,
		}))
		.filter(attachment => attachment.url !== '');
}
