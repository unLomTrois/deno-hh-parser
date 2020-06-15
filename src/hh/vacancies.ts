import { HH } from '../../api/hh/module.d.ts';
import { red, yellow, green } from 'https://deno.land/std/fmt/colors.ts';

const queryToString = (query: HH.QueryInterface): string => {
  const query_list: string[] = [];

  Object.entries(query).forEach(([key, value]) => {
    query_list.push([key, value].join('='))
  });

  return query_list.join('&');
}

const getURL = (url: HH.URL): string => url.baseURL + url.method + queryToString(url.query)

const getFound = async (hh_url: HH.URL, headers_init?: HeadersInit): Promise<number> => {
  const clonned_hh_url = { ...hh_url };
  clonned_hh_url.query = { ...hh_url.query, per_page: 0 };

  const url = getURL(clonned_hh_url);
  console.log(yellow(`request to ${ url } `));

  const response: any = await (await fetch(url, { headers: headers_init })).json();

  const found: number = response['found'];
  console.log(green(`found: ${ found } vacancies`));

  return found;
}

const filterVacancies = (data: any[], avoid_words: string[]): any[] => {
  return data.filter((el: HH.Response) => {
    const name = el.name.toLowerCase();
    const requirement = (el.snippet.requirement ?? '').toLowerCase();
    const responsibility = (el.snippet.responsibility ?? '').toLowerCase();

    return !(
      avoid_words.some( avoid_word => name.includes(avoid_word) ) ||
      avoid_words.some( avoid_word => requirement.includes(avoid_word) ) ||
      avoid_words.some( avoid_word => responsibility.includes(avoid_word) )
    );
  });
}

const getVacancies = async (hh_url: HH.URL, headers_init?: HeadersInit, limit?: number, avoid_words?: string[]): Promise<any[]> => {
  const start = new Date().getTime();
  // limit
  if (limit === undefined) {
    limit = 2000;
  } else {
    if (limit < (hh_url.query.per_page ?? 100) ) {
      hh_url.query.per_page = limit;
    }
  }

  // items per page
  const per_page = hh_url.query.per_page ?? 100;

  // get number of founded vacancies
  const found: number = await getFound(hh_url, headers_init);
  console.log(red(`LIMIT: ${ limit }`))

  const avoid_words_lowercase: string[] = avoid_words?.map(sw => sw.toLowerCase()) ?? [] ;
  if (avoid_words_lowercase.length) {
    console.log(yellow(`avoid words: ${ avoid_words_lowercase.join(', ') }`));
  }

  const responses: Promise<Response>[] = [];
  for (let page = 0; page < Math.ceil((found <= limit ? found : limit ) / per_page); page++) {
    hh_url.query.page = page;

    const url = getURL(hh_url);

    console.log(yellow(`page №${ page }; request to ${ url }`));

    const response = fetch(url, { headers: headers_init });

    responses.push(response);
  }
  const results: Response[] = await Promise.all(responses);

  const vacancies: any[] = [];
  for (const res of results) {
    const data: any[] = (await res.json())['items'];
    vacancies.push(...( avoid_words_lowercase.length ? filterVacancies(data, avoid_words_lowercase) : data ) );
  }

  const end = new Date().getTime();

  console.log(green(`fetched ${ responses.length * (hh_url.query.per_page ?? 100) } in ${ (end - start) / 1000 } sec`));

  if (avoid_words_lowercase.length) {
    console.log(green(`passed the conditions: ${ vacancies.length }`))
  }

  return vacancies;
}

const getFullVacancies = async (urls: string[]): Promise<any[]> => {
  // делаю промисы на фетчи
  const connections: Promise<Response>[] = urls.map(url => fetch(url));

  // жду резолва промисов
  const responses: Response[] = await Promise.all(connections);

  // делаю промисы на жсоны
  const data: Promise<any>[] = responses.map(res => res.json());

  // жду резолва жсонов
  const vacancies: any[] = await Promise.all(data);

  return vacancies;
}

const getFullVacancy = async (vacancy_url: string, headers_init?: HeadersInit): Promise<any> => {
  const response = await fetch(vacancy_url, {
    headers: headers_init
  });

  return response;
}

export {
  getVacancies,
  getFullVacancies,
  getFullVacancy
}
