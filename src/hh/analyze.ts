import { green } from 'https://deno.land/std/fmt/colors.ts';

const analyzeVacancies = async (vacancies: any[]): Promise<any> => {

  const filtered_vacancies: any[] = [];
  for (const vacancy of vacancies) {
    const { id, name, key_skills, alternate_url }: {id: string, name: string, key_skills: any[], alternate_url: string } = vacancy;

    if (key_skills.length) {
      const filtered_key_skills: string[] = [];
      key_skills.forEach(skill => {
        filtered_key_skills.push(skill.name);
      });

      filtered_vacancies.push({id, name, key_skills: filtered_key_skills, alternate_url});
    }
  }

  console.log(green(`parsed ${ filtered_vacancies.length } vacancies with key words`));

  return filtered_vacancies;
}

export {
  analyzeVacancies
}
