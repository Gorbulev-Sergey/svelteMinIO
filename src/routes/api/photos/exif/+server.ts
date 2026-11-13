import exifr from 'exifr';

export async function GET({ url }) {
	let photo = url.searchParams.get('photo') || '';
	try {
		const tags = await exifr.parse(photo, {
			// Можно указать только нужные теги, чтобы еще больше ускорить процесс
			// pick: ['Make', 'Model', 'ISO', 'FNumber']
		});
		return new Response(JSON.stringify(tags));
	} catch (error) {
		return new Response(JSON.stringify([]));
	}
}
