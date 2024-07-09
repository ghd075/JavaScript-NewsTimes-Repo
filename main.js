const API_KEY='3715619bc4054aa9b5ca4b178d6b1525';
const currentUrl = window.location.host;
console.log('현재 주소 : ', currentUrl);
let newsApiUrl = '';
// 테스트용
if(currentUrl === '127.0.0.1:5500') {
  newsApiUrl = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${API_KEY}`;
// 배포용
} else {
}

let news = [];

const getLatestNews = async () => {
  const url = new URL(newsApiUrl);
  const response = await fetch(url);
  const data = await response.json();
  let news = data.articles;
  console.log('data : ', news);
};

getLatestNews();