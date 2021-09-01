import { AxiosResponse } from 'axios';
import { WriteStream } from 'fs';
import { Door } from '..';
import { Attachment } from '../attachment';

export async function download(door: Door, attachment: Attachment): Promise<AxiosResponse<WriteStream>> {
	return await door.axios.get(attachment.url, {
		headers: {
			Referer: attachment.referrer,
		},
		responseType: 'stream',
	});
}
