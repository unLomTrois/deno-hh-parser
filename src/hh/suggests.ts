
// get area_id from https://api.hh.ru/areas
const suggestArea = async (text: string | number, locale: string): Promise<number> => {
  if (typeof text == "number") {
    return text;
  }

  const url = `https://api.hh.ru/suggests/areas?text=${ text }&locale=${ locale }`;

  const connection: Promise<Response> = fetch(url);

  const response: Response = await connection;

  const data: any = await response.json();

  const area = data['items'][0];

  const area_id: number = area['id'];

  return area_id;
}

export {
  suggestArea
}
