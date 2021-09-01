import { HTMLElement } from 'node-html-parser';
import { parseAttachmentList } from '../../attachment/attachment';
import { Submission } from './submission.interfaces';

export const parseSubmission = (table: HTMLElement, referer: string): Submission => {
	return {
		contents: table.querySelector('textarea')?.text.trim() || '',
		attachments: parseAttachmentList(table, referer),
	};
};
