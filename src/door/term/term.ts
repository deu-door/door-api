import assert from 'assert';
import { Door } from '..';
import { Term } from './term.interfaces';

export async function getTermList(door: Door): Promise<Term[]> {
	const { document, HTMLSelectElement } = await door.get('/MyPage');
	const termsSelect = document.querySelector('#tno');

	assert(termsSelect instanceof HTMLSelectElement);

	const terms = [...termsSelect.querySelectorAll('option')]
		.map(optionElement => ({
			id: optionElement.getAttribute('value') ?? '',
			name: optionElement.textContent?.trim() ?? '',
		}))
		.filter(term => term.id !== '')
		// currently not support for
		.filter(term => !(term.name.includes('동계학기') || term.name.includes('하계학기')));

	return terms;
}
