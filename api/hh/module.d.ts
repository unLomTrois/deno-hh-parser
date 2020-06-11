
export namespace HH {

  export interface QueryInterface {
    '?no_magic': boolean;
    'area'?: number;
    'text'?: string;
    'schedule'?: 'fullDay' | 'shift' | 'flexible' | 'remote' | 'flyInFlyOut';
    'per_page'?: number;
    'page'?: number;
    'specialization'?: string;
    'experience'?: 'noExperience' | 'between1And3' | 'between3And6' | 'moreThan6';
    'describe_arguments'?: boolean;
    'employment'?: 'full' | 'part' | 'project' | 'volunteer' | 'probation';
    'industry'?: string;
    'salary'?: number;
    'currency'?: 'AZN' | 'BYR' | 'EUR' | 'GEL' | 'KGS' | 'KZT' | 'RUR' | 'UAH' | 'USD' | 'UZS';
    'order_by'?: 'publication_time' | 'salary_desc' | 'salary_asc' | 'relevance' | 'distance';
    'search_field'?: 'name' | 'company_name' | 'description'
  }

  export interface URLInterface {
    baseURL: string,
    method: string,
    query: QueryInterface
  }

  export class URL implements URLInterface {
    baseURL: 'https://api.hh.ru'
    method: '/vacancies'
    query: QueryInterface
  }

  // finish
  export interface Response {
    name: string;
    snippet: Snippet;
  }

  export interface Snippet {
    requirement: string | undefined | null;
    responsibility: string | undefined | null;
  }
}
