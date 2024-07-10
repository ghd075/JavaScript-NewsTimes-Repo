const API_KEY='3715619bc4054aa9b5ca4b178d6b1525';
const currentUrl = window.location.host;
console.log('현재 주소 : ', currentUrl);
let newsApiUrl = '';
// 테스트용
if(currentUrl === '127.0.0.1:5500') {
  newsApiUrl = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${API_KEY}`;
// 배포용
} else {
  newsApiUrl = `https://strong-concha-caa6d1.netlify.app/top-headlines`;
}

let newsList = [];

const getLatestNews = async () => {
  const url = new URL(newsApiUrl);
  const response = await fetch(url);
  const data = await response.json();
  newsList = data.articles;
  render();
  console.log('data : ', newsList);
};

const render = () => {
  const newsContainer = document.getElementById('news-container');
  const newsHTML = newsList.map(
    (news) => `
         <div class="col-lg-6 col-12 mb-4">
            <div class="card h-100">
                <div class="news-img-wrap">
                  <img src="${news.urlToImage}" class="news-img" alt="${news.title}" width="100%" height="100%" onerror="this.src='./images/noImg.png'">
                </div>
                <div class="card-body">
                    <h5 class="card-title"><a href="${news.url}" target="_blank" class="title_link">${news.title}</a></h5>
                    <p class="card-text">${
                      news.description == null || news.description == ""
                        ? "내용없음"
                        : news.description.length > 200
                        ? news.description.substring(0, 200) + "..."
                        : news.description
                 }</p>
                  <a href="${news.url}" target="_blank" class="btn btn-primary">기사링크</a>
                </div>
                <div class="card-footer text-body-light d-flex justify-content-between">
                  ${news.source.name == null ? "출처없음" : news.source.name}
                  <div>${news.publishedAt ? moment(news.publishedAt).startOf("day").fromNow() : ' '}</div>
                </div>
            </div>
        </div>    
    `).join('');

  newsContainer.innerHTML = newsHTML;
}
getLatestNews();

//검색창
document.getElementById('search-icon').addEventListener('click', function() {
  var searchBar = document.getElementById('search-bar');
  if (searchBar.style.display === 'none' || searchBar.style.display === '') {
      searchBar.style.display = 'flex';
  } else {
      searchBar.style.display = 'none';
  }
});

// top 버튼
let backToTop = () => {
  // Scroll | button show/hide
  window.addEventListener('scroll', () => {
    if (document.querySelector('html').scrollTop > 100) {
      document.getElementById('go-top').style.display = "block";
    } else {
      document.getElementById('go-top').style.display = "none";
    }
  });
  // back to top
  document.getElementById('go-top').addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  })
};
backToTop();