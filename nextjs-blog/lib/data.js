// BEFORE USING got MUST DO: npm install got@9.6.0
import got from 'got';

const WP_BASE = 'https://dev-cs-55-13-david-schreibstein.pantheonsite.io/wp-json';

// Regular posts (custom theme endpoint) + custom post types from WP REST
const postsURL = `${WP_BASE}/twentytwentyone-child/v1/latest-posts/1`;
const gamesURL = `${WP_BASE}/wp/v2/game`;
const consolesURL = `${WP_BASE}/wp/v2/console`;

async function fetchJson(url) {
  try {
    const response = await got(url);
    console.log(response.body);
    const data = JSON.parse(response.body);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Normalize WP REST CPT items and custom latest-posts items into one shape
function normalizeItem(item) {
  const type = item.post_type || item.type || 'post';
  const id = (item.ID ?? item.id).toString();
  const title =
    item.post_title ||
    item.title?.rendered ||
    item.acf?.game_name ||
    '';
  const dateRaw = item.post_date || item.date || '';
  const post_date = dateRaw.includes('T')
    ? dateRaw.replace('T', ' ').slice(0, 19)
    : dateRaw;

  let post_content = item.post_content || item.content?.rendered || '';
  if (!post_content && item.acf) {
    const description = item.acf.decription || item.acf.description || '';
    const year = item.acf.year_of_releaste;
    post_content = description ? `<p>${description}</p>` : '';
    if (year) {
      post_content += `<p>Year of release: ${year}</p>`;
    }
  }

  return {
    id,
    name: title,
    post_title: title,
    post_content,
    post_date,
    type,
    acf: item.acf || null,
  };
}

async function getAllContent() {
  const [posts, games, consoles] = await Promise.all([
    fetchJson(postsURL),
    fetchJson(gamesURL),
    fetchJson(consolesURL),
  ]);

  return [...posts, ...games, ...consoles].map(normalizeItem);
}

// function returns ids for all json objects in array
export async function getAllIds() {
  const jsonObj = await getAllContent();

  return jsonObj.map((item) => {
    return {
      params: {
        id: item.id,
      },
    };
  });
}

// function returns names and ids for all json objects in array, sorted by name property
export async function getSortedList() {
  const jsonObj = await getAllContent();

  jsonObj.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  return jsonObj.map((item) => {
    return {
      id: item.id,
      name: item.name,
      type: item.type,
    };
  });
}

export async function getData(idRequested) {
  const jsonObj = await getAllContent();

  const objMatch = jsonObj.filter((obj) => {
    return obj.id === idRequested;
  });

  let objReturned;
  if (objMatch.length > 0) {
    objReturned = objMatch[0];
  } else {
    objReturned = {};
  }

  return objReturned;
}
