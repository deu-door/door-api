import { parseAttachmentList } from '../../attachment/attachment';
import { Submission } from './submission.interfaces';

export const parseSubmission = (table: HTMLTableElement, referer: string): Submission => {
	return {
		contents: table.querySelector('textarea')?.textContent || '',
		attachments: parseAttachmentList(table, referer),
	};
};
