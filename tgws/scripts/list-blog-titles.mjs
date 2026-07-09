import https from 'https';

const q = '*[_type=="post"]{title,slug}';
const url = `https://r6ztl1oq.api.sanity.io/v2021-10-21/data/query/production?query=${encodeURIComponent(q)}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const j = JSON.parse(data);
    j.result.forEach((p, i) => {
      console.log(`${i+1}. ${p.title} | slug: ${p.slug?.current}`);
    });
  });
});
