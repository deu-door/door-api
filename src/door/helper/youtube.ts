import axios from 'axios';
import qs from 'qs';

type OEmbedResponse = {
	title: string;
	author_name: string;
	author_url: string;
	type: string;
	height: number;
	width: number;
	version: string;
	provider_name: string;
	provider_url: string;
	thumbnail_height: number;
	thumbnail_width: number;
	thumbnail_url: string;
	html: string;
};

/**
 * YouTube URL을 embed url로 바꾸어주는 함수 (youtube api 사용)
 *
 * @param url embedding할 youtube url
 * @returns embedding된 youtube url. embed 할 수 없을 시 undefined 반환
 */
export async function tryToEmbedYouTubeUrl(url: string): Promise<string | undefined> {
	try {
		const { data } = await axios.get<OEmbedResponse>(`https://youtube.com/oembed?url=${qs.stringify(url)}`);

		return /src="(.+?)"/.exec(data.html)?.[1];
	} catch (e) {
		return undefined;
	}
}
