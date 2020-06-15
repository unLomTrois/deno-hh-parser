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

const filterVacancies = (vacancies: any[], avoid_words: string[]): any[] => {
  return vacancies.filter((el: HH.Response) => {
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

const urlByPage = (url:string, page: number): string => url.replace('page=0', `page=${ page }`);

const getVacancies = async (hh_url: HH.URL, headers_init?: HeadersInit, limit: number = 2000, avoid_words: string[] = []): Promise<any[]> => {
  const start = new Date().getTime();

  if (limit < (hh_url.query.per_page ?? 100) ) {
    hh_url.query.per_page = limit;
  }

  // получаем итоговое число найденных по запросу вакансий
  const found: number = await getFound(hh_url, headers_init);
  console.log(red(`LIMIT: ${ limit }`))

  // получаем список avoid-слов в нижнем регистре
  const avoid_words_lowercase: string[] = avoid_words.map(sw => sw.toLowerCase());

  // получаем количество элементов на страницу
  const per_page: number = hh_url.query.per_page ?? 100;

  // вычисляем количество требуемых страниц
  const pages: number = Math.ceil((found <= limit ? found : limit ) / per_page);

  // получаем базовый url
  const base_url: string = getURL(hh_url);

  // генерируем массив url-ек
  const urls: string[] = Array.from(Array(pages).fill(base_url), (url: string, page: number) => urlByPage(url, page));

  // делаем промисы на фетчи
  const connections: Promise<Response>[] = urls.map(url => fetch(url, { headers: headers_init }));

  // ждём резолва фетчей
  const responses: Response[] = await Promise.all(connections);

  // делаем промисы на жсоны
  const data: Promise<any>[] = responses.map(res => res.json());

  // ждём резолва жсонов
  const json_data: any[] = await Promise.all(data);

  // вакансии в поле items
  const raw_vacancies: any[] = json_data.map(page => page['items']);

  // объединяем массивы вакансий в единый массив
  const vacancies: any[] = new Array().concat( ...raw_vacancies );

  const end = new Date().getTime();

  console.log(green(`fetched ${ vacancies.length } in ${ (end - start) / 1000 } sec`));

  // фильтрация по avoid-словам
  if (avoid_words_lowercase.length) {
    console.log(yellow(`avoid words: ${ avoid_words_lowercase.join(', ') }`));

    const start = new Date().getTime();
    const filtered_vacancies = filterVacancies(vacancies, avoid_words_lowercase);
    const end = new Date().getTime();

    console.log(green(`${ vacancies.length } vacancies filtered to ${ filtered_vacancies.length } in ${ (end - start) / 1000 }`))

    return filtered_vacancies;
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
  const response = await fetch(vacancy_url, { headers: headers_init });

  return response;
}

export {
  getVacancies,
  getFullVacancies,
  getFullVacancy
}
