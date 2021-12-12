import Notiflix from 'notiflix';

import NewsApiService from './api-service';
import galleryCards from './templates/galleryCards.hbs';
// Описан в документации
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const newsApiService = new NewsApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(e) {
  e.preventDefault();

  newsApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  newsApiService.resetPage();

  if (newsApiService.query === '') {
    onClearGallery();
    refs.loadMoreBtn.classList.add('is-hidden');
    return Notiflix.Notify.warning('Please, fill the main field');
  }

  newsApiService
    .fetchGalleryCards()

    .then(data => {
      onClearGallery();
      refs.loadMoreBtn.classList.remove('is-hidden');

      if (!data.hits.length) {
        Notiflix.Notify.warning(
          `Sorry, there are no images matching your search query. Please try again.`,
        );
        refs.loadMoreBtn.classList.add('is-hidden');
        return;
      }

      onRenderGallery(data);
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images !!!`);
    });
}

function onLoadMore() {
  newsApiService.fetchGalleryCards().then(onScrollmake);
}

function onRenderGallery(data) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', galleryCards(data.hits));

  onSliderMake();
}

function onClearGallery() {
  refs.galleryContainer.innerHTML = '';
}

function onScrollmake(data) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', galleryCards(data.hits));

  onSliderMake();

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });

  if (data.hits.length < 40 && data.hits.length > 0) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

function onSliderMake() {
  const lightbox = new SimpleLightbox('.gallery a', {
    close: true,
    closeText: '×',
    showCounter: true,
    preloading: true,
    enableKeyboard: true,
    docClose: true,
    disableScroll: true,
  });
  lightbox.refresh();
}
