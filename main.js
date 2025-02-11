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

let url = new URL(newsApiUrl);

let newsList = [];
const menus = document.querySelectorAll('.navbar-nav .nav-item a');  //Menu의 버튼 요소들
console.log('메뉴 : ', menus);

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-form input');

// 각 Menu 버튼 클릭 이벤트
menus.forEach(menu => menu.addEventListener('click', (event) => getNewsByCategory(event)));

// 변수
let _totalResults = 0;
let _page = 1;
const _pageSize = 10;
const _groupSize = 5;

// 뉴스 데이터 가져오기 - 리팩토링
const getNews = async() => {
  try {
    url.searchParams.set("page", _page);
    url.searchParams.set("pageSize", _pageSize);
    const response = await fetch(url);
    const data = await response.json();
    console.log('데이터 잘 들어오니 > ', data);
    if(response.status === 200) {
      if (data.articles.length === 0) {
        _totalResults = 0; // 전체건수 초기화
        pagingRender();
        throw new Error("요청하신 데이터가 없습니다. 다시 확인하세요.");
      }
      newsList = data.articles;
      _totalResults = data.totalResults;
      console.log('data : ', newsList);
      console.log('_totalResults : ', _totalResults);
      render();
      pagingRender();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.log('error : ', error.message);
    errorRender(error.message);
  }
}

// 뉴스 기사 가져오기
const getLatestNews = async () => {
  url = new URL(newsApiUrl);
  _page = 1;
  await getNews();        // 뉴스 데이터 가져오기 - 리팩토링
};


// 카테고리별 조회
const getNewsByCategory = async (event) => {
  const category = event.target.id;
  console.log('카테고리 : ', category);
  url = new URL(newsApiUrl);
  
  if (category !== "all") {
    url.searchParams.set("category", category);
  } else {
    url.searchParams.delete("category");
  }

  // 해당 카테고리로 active class CSS 지정
  const menuItems = document.querySelectorAll('.navbar-nav .nav-item a');
  menuItems.forEach((menuItem) => {
    menuItem.classList.remove('active');
  });
  event.target.classList.add('active')           //신규 active 지정

  _page = 1;
  await getNews();        // 뉴스 데이터 가져오기 - 리팩토링
}

// 화면에 뿌려주기
const render = () => {
  const newsContainer = document.getElementById('news-container');
  const noNewsMessage = document.getElementById('no-news-message');
  const newsCount = document.getElementById("news-count");
  noNewsMessage.style.display = 'none';
  
  if(newsList.length === 0) {
    newsContainer.innerHTML = '';
  } else {
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
      newsCount.innerHTML = `<strong>총 건수 :</strong> ${_totalResults}건`;
  }
}

// 에러핸들링
const errorRender = (errorMessage) => {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '';  // 기존 뉴스기사 삭제

  const noNewsContainer = document.getElementById("no-news-message");
  noNewsContainer.style.display = 'block';

  const newsCount = document.getElementById("news-count");
  newsCount.style.display = 'none';

  const errorHTML = `<div class="alert alert-danger" role="alert">
    <h3>${errorMessage}</h3>
  </div>
  <button id="refresh-button" class="btn btn-primary">새로고침</button>`;
  noNewsContainer.innerHTML = errorHTML;

  // 새로고침 버튼
  document.getElementById('refresh-button').addEventListener('click', () => {
    location.reload();
  });
}

// 페이지네이션 HTML 생성 함수
const createPaginationItem = (pageNum, text, isDisabled = false, isActive = false) => {
  return `<li class="page-item ${isDisabled ? "disN" : ""} ${isActive ? "active" : ""}" onclick="goPage(${pageNum})">
            <a class="page-link" href="#">${text}</a>
          </li>`;
};

// 페이지네이션
const pagingRender = () => {
  let paginationHTML = ``;
  // totalPage
  const totalPage = Math.ceil(_totalResults / _pageSize);
  // pageGroup
  const pageGroup = Math.ceil(_page / _groupSize);
  // lastPage
  let lastPage = pageGroup * _groupSize;
  if (lastPage > totalPage) {
      lastPage = totalPage;
  }
  // firstPage
  const firstPage = lastPage - (_groupSize - 1) <= 0 ? 1 : lastPage - (_groupSize - 1);

  paginationHTML += createPaginationItem(1, "&lt;&lt;", totalPage < 5 || _page === 1);
  paginationHTML += createPaginationItem(_page - 1, "&lt;", totalPage < 5 || _page === 1);

  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += createPaginationItem(i, i, false, _page === i);
  }

  paginationHTML += createPaginationItem(_page + 1, "&gt;", totalPage < 5 || _page === totalPage);
  paginationHTML += createPaginationItem(totalPage, "&gt;&gt;", totalPage < 5 || _page === totalPage);

  document.querySelector(".pagination").innerHTML = paginationHTML;
};

// 페이지네이션 이벤트
const goPage = (pageNum) => {
  _page = pageNum;
  getNews();
};

getLatestNews();

// 1. 버튼들에 클릭이벤트주기
// 2. 카테고리별 뉴스 가져오기
// 3. 그 뉴스를 보여주기

//검색창 숨기기/보이기
document.getElementById('search-icon').addEventListener('click', function() {
  var searchBar = document.getElementById('search-bar');
  if (searchBar.style.display === 'none' || searchBar.style.display === '') {
      searchBar.style.display = 'flex';
  } else {
      searchBar.style.display = 'none';
  }
});

// 검색어로 조회
const getNewsByKeyword = async (event) => {
  event.preventDefault();
  let keyword = searchInput.value;
  console.log('키워드 : ', keyword);
  if(searchInput.value.length === 0){
    alert('검색어를 입력해주세요!');
    searchInput.focus();
    return;
  } else {
    let category = null;
    const activeNavItem = document.querySelector('.navbar-nav .nav-item a.active');

    // 카테고리별 뉴스 검색
    if (activeNavItem) {
      category = activeNavItem.id;
      console.log('category 어떤 것이 들어오니?? ', category);
    }

    url = new URL(newsApiUrl);
    url.searchParams.set("q", keyword);
    
    if (category && category !== "all") {
      url.searchParams.set("category", category);
    }

    _page = 1;
    await getNews();        // 뉴스 데이터 가져오기 - 리팩토링
    searchInput.value = ''; // 검색상자 비우기
  }

};


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
searchForm.addEventListener('submit',getNewsByKeyword);

