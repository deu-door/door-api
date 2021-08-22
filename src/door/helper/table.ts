type Row = {
	[key: string]: HTMLElement & {
		// get innerText and trim
		text: string;
		// get url from <a> tag
		url: string | undefined;
	};
};

export function parseListedTableElement(table: HTMLTableElement): Row[] {
	const tableElements = [...table.querySelectorAll('tbody tr,thead tr')].map(tr =>
		// tbody이어도 th 태그가 포함될 수 있음 (서버 단에서 그렇게 하기 때문)
		[...tr.querySelectorAll<HTMLElement>('td,th')],
	);

	// rowspan 처리
	tableElements.forEach((row, i) => {
		row.forEach((td, j) => {
			if (td.hasAttribute('rowspan')) {
				const rowspan = Number(td.getAttribute('rowspan'));
				td.removeAttribute('rowspan');

				for (let k = 1; k < rowspan; k++) {
					tableElements[i + k].splice(j, 0, td);
				}
			}

			if (td.hasAttribute('colspan')) {
				const colspan = Number(td.getAttribute('colspan'));
				td.removeAttribute('colspan');

				for (let k = 1; k < colspan; k++) {
					tableElements[i].splice(j, 0, td);
				}
			}
		});
	});

	//console.log(tableElements.map(row => row.map(d => d.textContent?.trim() ?? '')));

	let rows = tableElements.map(tr =>
		tr.map(td =>
			Object.assign(td, {
				text: td.textContent?.trim() ?? '',
				url: td.querySelector('*[href]')?.getAttribute('href') || undefined,
			}),
		),
	);

	// 첫 번째 row 사용
	const headers = rows.shift()?.map(d => d.text) || [];

	// 헤더의 갯수와 데이터 필드의 개수가 일치하지 않으면 Filter
	// Door 홈페이지에서, 게시물이 하나도 없을 경우 <td colspan="9">등록된 과제가 없습니다.</td> 를 띄우는데,
	// 이를 필터링하기 위함
	rows = rows.filter(row => row.length === headers.length);

	const tableParsed = rows.map(row => {
		const newRow: Row = {};
		headers.forEach((header, index) => {
			newRow[header] = row[index];
		});
		return newRow;
	});

	//console.log(tableParsed);

	return tableParsed;
}

export function parseInformaticTableElement(table: HTMLTableElement): Row {
	const parsed: Row = {};

	table.querySelectorAll<HTMLTableHeaderCellElement>('tbody th').forEach(th => {
		const td = th.nextElementSibling;

		if (td?.nodeName.toLowerCase() !== 'td') return;

		const name = th.textContent?.trim();

		if (name === undefined) return;

		parsed[name] = Object.assign(td as HTMLElement, {
			text: td.textContent?.trim() ?? '',
			url: td.querySelector('*[href]')?.getAttribute('href') || undefined,
		});
	});

	return parsed;
}
