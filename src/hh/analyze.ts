import { getFullVacancy } from "./vacancies.ts"


const analyzeVacancies = async (urls: string[]): Promise<any> => {
  const vacancies: any[] = [];

  for (const url of urls) {
    const { id, name, key_skills }: {id: string, name: string, key_skills: any[] } =  await getFullVacancy(url);

    if (key_skills.length) {
      const filtered_key_skills: string[] = [];
      key_skills.forEach(skill => {
        filtered_key_skills.push(skill.name);
      });

      vacancies.push({id, name, key_skills: filtered_key_skills, url});
    }
  }

  return vacancies;
}

export {
  analyzeVacancies
}
